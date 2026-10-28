import datetime
import math
from typing import Dict, Any, List
from backend.models.weather_models import (
    WeatherAdvisoryRequest,
    WeatherAdvisoryResponse,
    PourSuitability,
    CraneSafety
)
from backend.services.gemini_service import gemini_service

WEATHER_SYSTEM_PROMPT = """You are a certified Weather Risk Engineer and Construction Field Operations Consultant.
Evaluate weather inputs against ACI 305R (Hot Weather Concreting), ACI 306R (Cold Weather), and OSHA 1926.1431 (Cranes and Derricks in Construction).
Respond ONLY with a JSON object strictly matching this schema:
{
  "site_advisory_level": "GREEN_NORMAL" | "YELLOW_CAUTION" | "ORANGE_RESTRICTED" | "RED_SUSPENSION",
  "overall_guidance": "<concise actionable overview of weather impacts on operations>",
  "temperature_heat_index": "34.5°C (Category: Extreme Caution)",
  "pour_suitability": {
    "status": "OPTIMAL" | "CAUTION" | "PROHIBITED",
    "suitability_score": 72,
    "plastic_shrinkage_cracking_risk": "MODERATE",
    "curing_protocol_adjustments": [
      "Use chilled mixing water or flake ice to keep fresh concrete temp below 30°C",
      "Apply aliphatic alcohol evaporation retardant immediately following screeding"
    ],
    "max_allowable_slump_retention_minutes": 45
  },
  "crane_and_rigging": {
    "safe_to_operate": true,
    "current_wind_speed_kmh": 22.0,
    "max_safe_wind_speed_kmh": 38.0,
    "wind_gust_risk": "SAFE",
    "derating_factor_percent": 10,
    "boom_guidelines": "Maintain tagline control on wide surface panels; monitor gust anemometer continuously."
  },
  "earthworks_and_excavation_risk": "Stable. Moisture within proctor optimum for subgrade compaction.",
  "heat_stress_regime": "OSHA Level 2: 45 min work / 15 min shaded rest cycle with mandatory 500ml electrolyte intake/hour.",
  "scheduled_task_recommendations": [
    {
      "task": "Roof Truss Hoisting",
      "status": "APPROVED",
      "time_window": "07:00 - 11:30 before peak gust speeds exceed 30 km/h"
    },
    {
      "task": "Exterior Spray Painting",
      "status": "RESCHEDULE",
      "time_window": "Shift to indoor drywall sanding due to wind drift"
    }
  ],
  "twenty_four_hour_outlook": [
    {"time": "08:00", "temp_c": 24, "rain_prob": 10, "wind_kmh": 12, "condition": "Sunny"},
    {"time": "12:00", "temp_c": 31, "rain_prob": 20, "wind_kmh": 22, "condition": "Partly Cloudy"},
    {"time": "16:00", "temp_c": 33, "rain_prob": 30, "wind_kmh": 26, "condition": "Scattered Clouds"},
    {"time": "20:00", "temp_c": 28, "rain_prob": 15, "wind_kmh": 14, "condition": "Clear Night"}
  ]
}
"""

def calculate_analytical_weather_advisory(request: WeatherAdvisoryRequest) -> WeatherAdvisoryResponse:
    t = request.temperature_c
    rh = request.humidity_percent
    rain = request.rain_probability_percent
    wind = request.wind_speed_kmh
    gusts = max(wind, request.wind_gusts_kmh if request.wind_gusts_kmh is not None else (wind * 1.4))
    
    # Compute ACI 305R Evaporation Rate approximation E (kg/m2/hr)
    # E = (Tc^2.5 - r*Ta^2.5) * (1 + 0.4*V) * 10^-6
    # When E > 1.0 kg/m2/hr, plastic shrinkage cracking is critical.
    vapor_pressure_sat = 0.61078 * math.exp((17.27 * t) / (t + 237.3)) # kPa
    vapor_pressure_air = vapor_pressure_sat * (rh / 100.0)
    # Simplified evaporation metric
    evap_rate = round(max(0.1, (0.003 * (t ** 1.3) + 0.02 * (wind / 3.6)) * (1.0 - (rh / 120.0))), 2)
    
    # Pour suitability scoring
    pour_score = 100
    pour_reasons = []
    
    if t > 32:
        pour_score -= int((t - 32) * 5)
        pour_reasons.append(f"High ambient temperature ({t}°C) accelerates hydration rate and slump loss.")
    elif t < 5:
        pour_score -= int((5 - t) * 8)
        pour_reasons.append(f"Low temperature ({t}°C) retards setting; risk of frost damage before reaching 3.5 MPa.")
        
    if evap_rate > 0.8:
        pour_score -= 25
        pour_reasons.append(f"High surface evaporation rate ({evap_rate} kg/m²/h) exceeds ACI 305 threshold (1.0 kg/m²/h).")
        
    if rain > 50:
        pour_score -= 40
        pour_reasons.append(f"Precipitation probability ({rain}%) presents risk of surface wash-out and water-cement ratio dilution.")
        
    pour_score = max(10, min(100, pour_score))
    
    if pour_score >= 80:
        pour_status = "OPTIMAL"
        shrinkage_risk = "LOW"
    elif pour_score >= 50:
        pour_status = "CAUTION"
        shrinkage_risk = "MODERATE"
    else:
        pour_status = "PROHIBITED"
        shrinkage_risk = "CRITICAL"
        
    curing_measures = [
        "Apply monomolecular evaporation retardant film immediately after screeding",
        "Maintain continuous moist curing with water misting or pre-soaked burlap for 7 full days",
        "Use white reflective polyethylene curing sheets to minimize solar heat absorption"
    ]
    if t > 30:
        curing_measures.insert(0, "Batch concrete with chilled mixing water (<10°C) or liquid nitrogen cooling")
    if t < 5:
        curing_measures = [
            "Use insulated curing blankets with minimum thermal resistance R-5",
            "Maintain concrete internal temperature above 10°C for 72 hours",
            "Employ heated mixing water and non-chloride accelerating admixtures"
        ]

    # Crane and lifting safety
    safe_to_lift = (wind < 38.0) and (gusts < 38.0)
    wind_risk = "MANDATORY_SHUTDOWN" if not safe_to_lift else ("GUST_WATCH" if gusts >= 28.0 else "SAFE")
        
    derate = 0
    if gusts > 25.0:
        derate = min(30, int((gusts - 25) * 2.5))
        
    crane_info = CraneSafety(
        safe_to_operate=safe_to_lift,
        current_wind_speed_kmh=wind,
        max_safe_wind_speed_kmh=38.0,
        wind_gust_risk=wind_risk,
        derating_factor_percent=derate,
        boom_guidelines=f"Gusts at {gusts:.1f} km/h. " + ("Suspend all tower crane hoists immediately." if not safe_to_lift else "Taglines compulsory on all panel and formwork picks.")
    )
    
    # Heat stress index
    heat_index = round(t + (0.5555 * ((rh / 100.0) * 6.11 * math.exp(5417.7530 * (1/273.16 - 1/(273.15 + t))) - 10.0)), 1)
    if heat_index >= 38:
        heat_regime = "OSHA Heat Alert Category: High. Mandatory 30m work / 30m shaded rest cycle. 1 Liter electrolyte fluid/worker/hour."
        advisory_level = "ORANGE_RESTRICTED"
    elif heat_index >= 31:
        heat_regime = "OSHA Heat Alert Category: Moderate Caution. 45m work / 15m rest. Accessible cold potable water stations."
        advisory_level = "YELLOW_CAUTION" if safe_to_lift else "ORANGE_RESTRICTED"
    else:
        heat_regime = "Comfortable thermal zone. Standard work rest intervals."
        advisory_level = "GREEN_NORMAL" if safe_to_lift else "ORANGE_RESTRICTED"
        
    if not safe_to_lift or rain > 70:
        advisory_level = "RED_SUSPENSION" if rain > 85 else "ORANGE_RESTRICTED"
        
    tasks = [
        {"task": "Structural Concrete Pouring", "status": pour_status, "guidance": f"Score {pour_score}/100. " + ("; ".join(pour_reasons[:2]) if pour_reasons else "Ideal ambient conditions.")},
        {"task": "Tower Crane & Rigging Operations", "status": "APPROVED" if safe_to_lift else "SUSPEND", "guidance": f"Max gust {gusts:.0f} km/h (Limit: 38 km/h)."},
        {"task": "Deep Trenching & Subgrade Excavation", "status": "APPROVED" if rain < 40 else "CAUTION", "guidance": "Trench wall slope stability normal." if rain < 40 else "Risk of trench wall sloughing; inspect shoring."},
        {"task": "Exterior Spray Waterproofing / Painting", "status": "RESCHEDULE" if wind > 18 else "APPROVED", "guidance": "Excessive wind overspray risk; shift crew indoors." if wind > 18 else "Surface drying times optimal."}
    ]
    
    outlook = [
        {"time": "08:00", "temp_c": round(t - 4, 1), "rain_prob": max(0, int(rain - 10)), "wind_kmh": round(wind * 0.7, 1), "condition": "Clear / Favorable"},
        {"time": "12:00", "temp_c": round(t, 1), "rain_prob": int(rain), "wind_kmh": round(wind, 1), "condition": "Partly Cloudy"},
        {"time": "15:00", "temp_c": round(t + 2, 1), "rain_prob": min(100, int(rain + 15)), "wind_kmh": round(gusts * 0.9, 1), "condition": "Peak Heat & Wind"},
        {"time": "19:00", "temp_c": round(t - 2, 1), "rain_prob": int(rain * 0.8), "wind_kmh": round(wind * 0.8, 1), "condition": "Mild Evening Window"}
    ]

    return WeatherAdvisoryResponse(
        site_advisory_level=advisory_level,
        overall_guidance=f"Operations Advisory for {request.location}: Temp {t}°C, RH {rh}%, Wind {wind} km/h (gusts {gusts:.0f} km/h), Rain risk {rain}%. Concrete pour rated {pour_status} ({pour_score}/100). Crane operations {('ACTIVE' if safe_to_lift else 'HALTED')}.",
        temperature_heat_index=f"{heat_index}°C (Apparent Temperature)",
        pour_suitability=PourSuitability(
            status=pour_status,
            suitability_score=pour_score,
            plastic_shrinkage_cracking_risk=shrinkage_risk,
            curing_protocol_adjustments=curing_measures,
            max_allowable_slump_retention_minutes=45 if t > 28 else 75
        ),
        crane_and_rigging=crane_info,
        earthworks_and_excavation_risk="Normal Stability" if rain < 35 else "Elevated Soil Saturation Alert",
        heat_stress_regime=heat_regime,
        scheduled_task_recommendations=tasks,
        twenty_four_hour_outlook=outlook
    )

def evaluate_weather_advisory(request: WeatherAdvisoryRequest) -> WeatherAdvisoryResponse:
    prompt = f"""Evaluate real-time site weather conditions for construction operations.
Data:
- Location: {request.location}
- Temperature: {request.temperature_c}°C
- Relative Humidity: {request.humidity_percent}%
- Precipitation Probability: {request.rain_probability_percent}%
- Wind Speed: {request.wind_speed_kmh} km/h (Gusts: {request.wind_gusts_kmh or 'N/A'} km/h)
- UV Index: {request.uv_index or 'Moderate'}

Calculate ACI 305/306 concrete pour suitability, OSHA crane gust restrictions, trench collapse hazard, and worker heat stress schedule.
"""
    ai_result = gemini_service.generate_json_response(
        prompt=prompt,
        system_instruction=WEATHER_SYSTEM_PROMPT
    )

    if ai_result and isinstance(ai_result, dict) and "pour_suitability" in ai_result:
        try:
            raw_ps = ai_result.get("pour_suitability", {})
            ps = PourSuitability(
                status=raw_ps.get("status", "CAUTION"),
                suitability_score=int(raw_ps.get("suitability_score", 70)),
                plastic_shrinkage_cracking_risk=raw_ps.get("plastic_shrinkage_cracking_risk", "MODERATE"),
                curing_protocol_adjustments=raw_ps.get("curing_protocol_adjustments", []),
                max_allowable_slump_retention_minutes=int(raw_ps.get("max_allowable_slump_retention_minutes", 60))
            )

            raw_cr = ai_result.get("crane_and_rigging", {})
            # Enforce physical crane safety limits according to OSHA 1926.1431
            crane_safe = bool(raw_cr.get("safe_to_operate", True))
            effective_wind = float(raw_cr.get("current_wind_speed_kmh", request.wind_speed_kmh))
            effective_gusts = request.wind_gusts_kmh or (request.wind_speed_kmh * 1.4)
            if effective_wind >= 38.0 or effective_gusts >= 38.0:
                crane_safe = False

            cr = CraneSafety(
                safe_to_operate=crane_safe,
                current_wind_speed_kmh=effective_wind,
                max_safe_wind_speed_kmh=float(raw_cr.get("max_safe_wind_speed_kmh", 38.0)),
                wind_gust_risk="MANDATORY_SHUTDOWN" if not crane_safe else raw_cr.get("wind_gust_risk", "SAFE"),
                derating_factor_percent=int(raw_cr.get("derating_factor_percent", 0)),
                boom_guidelines=raw_cr.get("boom_guidelines", "Monitor anemometer continuously.")
            )

            return WeatherAdvisoryResponse(
                site_advisory_level=ai_result.get("site_advisory_level", "YELLOW_CAUTION"),
                overall_guidance=ai_result.get("overall_guidance", "Weather analysis active."),
                temperature_heat_index=ai_result.get("temperature_heat_index", f"{request.temperature_c}°C"),
                pour_suitability=ps,
                crane_and_rigging=cr,
                earthworks_and_excavation_risk=ai_result.get("earthworks_and_excavation_risk", "Stable conditions."),
                heat_stress_regime=ai_result.get("heat_stress_regime", "Standard hydration protocols."),
                scheduled_task_recommendations=ai_result.get("scheduled_task_recommendations", []),
                twenty_four_hour_outlook=ai_result.get("twenty_four_hour_outlook", [])
            )
        except Exception as e:
            print(f"[WeatherAdvisory] Parsing AI response failed: {e}, using analytical fallback.")

    return calculate_analytical_weather_advisory(request)
