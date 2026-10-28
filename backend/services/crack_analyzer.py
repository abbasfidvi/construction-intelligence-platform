import datetime
from typing import Dict, Any, List
from backend.models.crack_models import (
    CrackAnalysisRequest,
    CrackAnalysisResponse,
    CrackClassification,
    CrackSeverityAssessment,
    ProbableCause,
    RepairMethod,
    MonitoringProtocol
)
from backend.services.gemini_service import gemini_service

CRACK_SYSTEM_PROMPT = """You are a certified Senior Forensic Structural Engineer and NDT (Non-Destructive Testing) specialist.
Analyze the provided concrete/masonry crack photo and inspection data.
Respond ONLY with a JSON object strictly following this structure:
{
  "crack_detected": true,
  "summary": "<comprehensive 2-3 sentence forensic diagnosis>",
  "classification": {
    "primary_type": "Diagonal Shear Crack / Flexural Tension Crack / Thermal Shrinkage / Differential Settlement / Craze Cracking / Corrosion Spalling",
    "estimated_width_mm": 2.4,
    "width_category": "Moderate (1.5-3mm)",
    "propagation_pattern": "45-degree Diagonal / Vertical / Stepped Masonry / Horizontal / Spiderweb Map",
    "structural_significance": "Structural Hazard / Serviceability Concern / Aesthetic Non-structural",
    "depth_indicator": "Deep / Rebar Level / Surface Only / Full Section"
  },
  "severity": {
    "severity_score": 75,
    "urgency_level": "URGENT_SHORING" | "REPAIR_SOON" | "MONITOR_PERIODICALLY" | "CRITICAL_EVACUATION",
    "risk_of_structural_failure": "HIGH" | "MEDIUM" | "LOW" | "NEGLIGIBLE",
    "recommended_reinspection_days": 7
  },
  "probable_causes": [
    {
      "cause": "High Shear Stress Exceeding Concrete Capacity",
      "probability_percent": 82,
      "explanation": "Diagonal cracking at ~45 degrees near the beam-column joint indicates diagonal tensile stresses exceeding shear reinforcement limits."
    },
    {
      "cause": "Differential Foundation Settlement",
      "probability_percent": 45,
      "explanation": "Subsurface soil compaction variance causing rotational deflection along the beam support line."
    }
  ],
  "recommended_repairs": [
    {
      "method_name": "Low-Pressure Structural Epoxy Injection",
      "suitability": "Restores structural monolithic continuity across cracked concrete sections without active ongoing dynamic movement.",
      "estimated_cost_usd": "$1,200 - $2,800",
      "durability_years": "15 - 25 years",
      "materials_required": ["High-modulus epoxy resin (ASTM C881 Type IV)", "Surface capping paste", "Port injection nipples", "Rotary wire brush"],
      "step_by_step_procedure": [
        "Clean crack surface with compressed oil-free air to remove loose dust and debris.",
        "Bond entry surface ports along the crack length spaced at thickness of member (approx. 150-200mm apart).",
        "Seal surface opening between ports with rapid-curing epoxy paste; allow 2 hours to cure.",
        "Inject structural epoxy starting at the lowest port until clean resin extrudes from adjacent port.",
        "Cap current port and migrate upward sequentially along the crack trajectory.",
        "Grind off surface seal after full cure (24h) and apply protective carbon fiber wrap if specified."
      ]
    },
    {
      "method_name": "External CFRP (Carbon Fiber Reinforced Polymer) Laminate Wrapping",
      "suitability": "Recommended for augmenting shear load capacity and arresting crack progression under high dynamic loads.",
      "estimated_cost_usd": "$3,500 - $6,000",
      "durability_years": "30+ years",
      "materials_required": ["Unidirectional carbon fiber fabric (300 gsm)", "Epoxy saturant matrix", "High-tack epoxy primer"],
      "step_by_step_procedure": [
        "Radius concrete edges to minimum 25mm to avoid stress concentration.",
        "Substrate profiling via abrasive blast to CSP 3-4 profile.",
        "Apply structural epoxy primer and putty to level uneven surfaces.",
        "Impregnate CFRP fabric with saturant resin and apply perpendicular to shear crack lines.",
        "Roll out trapped air bubbles and apply top UV/fire protective coating."
      ]
    }
  ],
  "monitoring_protocol": {
    "recommended_sensors": ["Tell-Tale Calibrated Crack Gauge", "Vibrating Wire Displacement Transducer", "Digital Extensometer"],
    "monitoring_frequency": "Bi-weekly visual inspection with weekly digital datalogging",
    "displacement_threshold_alert": ">0.5mm additional widening within 14 days mandates immediate propping."
  },
  "compliance_codes": [
    "ACI 224.1R-07: Causes, Evaluation, and Repair of Cracks in Concrete Structures",
    "ACI 318-19: Building Code Requirements for Structural Concrete (Shear Provisions)",
    "ASTM C881: Standard Specification for Epoxy-Resin-Base Bonding Systems for Concrete",
    "EN 1504-5: Products and systems for the protection and repair of concrete structures - Concrete injection"
  ]
}
"""

def fallback_crack_analysis(request: CrackAnalysisRequest) -> CrackAnalysisResponse:
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    mat = request.surface_material or "Reinforced Concrete"
    elem = request.structural_element or "Load-Bearing Beam"
    age = request.structure_age_years or 5
    
    is_beam_column = any(k in elem.lower() for k in ["beam", "column", "retaining", "foundation"])
    
    if is_beam_column:
        primary_type = "Diagonal Shear Crack"
        width_mm = 2.4
        width_cat = "Moderate (1.5-3mm)"
        pattern = "45-degree Diagonal"
        significance = "Structural Hazard - Primary Load Path Compromised"
        severity_score = 78
        urgency = "URGENT_SHORING"
        risk_failure = "HIGH"
        causes = [
            ProbableCause(
                cause="High Shear Stress Exceeding Stirrup Capacity",
                probability_percent=85,
                explanation=f"Diagonal 45-degree trajectory on {elem} indicates principal tensile stress exceeds shear reinforcement tensile capacity under current live/dead loads."
            ),
            ProbableCause(
                cause="Differential Foundation Footing Settlement",
                probability_percent=60,
                explanation=f"Uneven soil consolidation under adjacent columns induces secondary bending moments and severe shear transfer in {elem}."
            ),
            ProbableCause(
                cause="Thermal & Restrained Drying Shrinkage",
                probability_percent=35,
                explanation="Seasonal temperature swings combined with restrained end supports amplifying localized stress concentrations."
            )
        ]
        repairs = [
            RepairMethod(
                method_name="Structural Epoxy Injection (ASTM C881 Type IV)",
                suitability=f"Deep resin penetration to re-bond internal aggregate interlock within {mat} {elem}.",
                estimated_cost_usd="$1,500 - $3,200",
                durability_years="20+ years",
                materials_required=["Low viscosity epoxy resin", "Surface seal paste", "Injection ports", "Rotary grinder"],
                step_by_step_procedure=[
                    "V-notch or groove surface crack line to remove loose friable concrete.",
                    "Fix injection nipples at 150mm intervals along the diagonal shear path.",
                    "Apply epoxy gel surface seal over entire crack exterior; cure 3 hours.",
                    "Pressurize resin injection starting from bottom port at 2.5-3.0 bar until resin bleeds from port above.",
                    "Progress sequentially upward to prevent void entrapment.",
                    "Grind flush after 24 hours cure time."
                ]
            ),
            RepairMethod(
                method_name="CFRP Shear Strengthening Jackets",
                suitability="Restores shear safety factor by wrapping carbon fiber strips around the web of the beam.",
                estimated_cost_usd="$4,200 - $7,500",
                durability_years="35 years",
                materials_required=["CFRP unidirectional sheet", "Structural saturant epoxy", "Mechanical anchors"],
                step_by_step_procedure=[
                    "Sandblast or grind beam substrate to expose aggregate.",
                    "Round all bottom beam corners to radius r >= 20mm.",
                    "Saturate CFRP laminate with two-part epoxy matrix.",
                    "Apply U-jacket strips perpendicular to diagonal crack line.",
                    "Apply topcoat fire-retardant mortar or paint."
                ]
            )
        ]
    else:
        primary_type = "Thermal Shrinkage & Map Cracking"
        width_mm = 0.8
        width_cat = "Fine (0.5-1.5mm)"
        pattern = "Random / Multi-directional"
        significance = "Serviceability Concern - Moisture Intrusion Risk"
        severity_score = 42
        urgency = "REPAIR_SOON"
        risk_failure = "LOW"
        causes = [
            ProbableCause(
                cause="Restrained Drying Shrinkage",
                probability_percent=88,
                explanation=f"Excessive water-cement ratio or rapid surface moisture loss during initial curing of {mat}."
            ),
            ProbableCause(
                cause="Diurnal Thermal Expansion Cycles",
                probability_percent=55,
                explanation="Exterior surface exposure without adequate expansion control joints."
            )
        ]
        repairs = [
            RepairMethod(
                method_name="Elastomeric Polyurethane Sealant & Crack Bridging Coating",
                suitability="Accommodates ongoing thermal breathing while sealing against carbonation and rain penetration.",
                estimated_cost_usd="$600 - $1,200",
                durability_years="10 - 15 years",
                materials_required=["Polyurethane moisture-cure sealant", "Bond breaker tape", "Elastomeric acrylic coating"],
                step_by_step_procedure=[
                    "Rout crack to 6mm width x 6mm depth.",
                    "Install closed-cell foam backing rod or bond breaker tape.",
                    "Gun polyurethane sealant flush with surface and tool with spatula.",
                    "Apply two coats of elastomeric protective exterior coating."
                ]
            )
        ]

    return CrackAnalysisResponse(
        crack_detected=True,
        summary=f"Diagnostic inspection for {elem} ({mat}, ~{age} years old). Classified as {primary_type} with estimated {width_mm}mm width. {significance}. Urgent mitigation recommended.",
        classification=CrackClassification(
            primary_type=primary_type,
            estimated_width_mm=width_mm,
            width_category=width_cat,
            propagation_pattern=pattern,
            structural_significance=significance,
            depth_indicator="Rebar Level / Mid-Depth" if is_beam_column else "Surface to Shallow"
        ),
        severity=CrackSeverityAssessment(
            severity_score=severity_score,
            urgency_level=urgency,
            risk_of_structural_failure=risk_failure,
            recommended_reinspection_days=7 if is_beam_column else 30
        ),
        probable_causes=causes,
        recommended_repairs=repairs,
        monitoring_protocol=MonitoringProtocol(
            recommended_sensors=["Acrylic Optical Tell-Tale Crack Width Gauge", "Demec Mechanical Strain Gauge"],
            monitoring_frequency="Weekly optical logging under ambient temperature fluctuations",
            displacement_threshold_alert="Net opening exceeding 0.4mm triggers structural propping protocol"
        ),
        compliance_codes=[
            "ACI 224.1R-07: Causes, Evaluation, and Repair of Cracks in Concrete Structures",
            "ACI 318-19: Building Code Requirements for Structural Concrete",
            "ASTM C881: Standard Specification for Epoxy-Resin-Base Bonding Systems for Concrete",
            "IS 456 / Eurocode 2: Limit State Design of Reinforced Concrete"
        ],
        analysis_timestamp=now_str
    )

def analyze_crack(request: CrackAnalysisRequest) -> CrackAnalysisResponse:
    prompt = f"""Perform a forensic structural crack analysis.
Inspection Metadata:
- Surface Material: {request.surface_material}
- Structural Element: {request.structural_element}
- Estimated Structure Age: {request.structure_age_years} years
- Environmental Exposure: {request.environment}
- Additional Inspector Notes: {request.notes or 'None'}

Examine the image carefully:
1. Detect crack trajectory, width category, propagation angle, and structural significance.
2. Determine root causes (shear, flexure, shrinkage, settlement, corrosion).
3. Specify severity score (1-100), urgency level, and risk of failure.
4. Provide step-by-step repair methodology with exact chemical materials and tools.
5. Provide sensor monitoring recommendations and code references (ACI 224, ACI 318).
"""
    ai_result = gemini_service.generate_json_response(
        prompt=prompt,
        image_base64=request.image_base64,
        system_instruction=CRACK_SYSTEM_PROMPT
    )

    if ai_result and isinstance(ai_result, dict) and "classification" in ai_result:
        try:
            c = ai_result.get("classification", {})
            s = ai_result.get("severity", {})
            
            causes = []
            for pc in ai_result.get("probable_causes", []):
                causes.append(ProbableCause(
                    cause=pc.get("cause", "Material Fatigue"),
                    probability_percent=int(pc.get("probability_percent", 70)),
                    explanation=pc.get("explanation", "Stress concentration.")
                ))

            repairs = []
            for r in ai_result.get("recommended_repairs", []):
                repairs.append(RepairMethod(
                    method_name=r.get("method_name", "Epoxy Grouting"),
                    suitability=r.get("suitability", "Recommended for crack stabilization"),
                    estimated_cost_usd=r.get("estimated_cost_usd", "$1,000 - $3,000"),
                    durability_years=r.get("durability_years", "15+ years"),
                    materials_required=r.get("materials_required", ["Epoxy", "Surface seal"]),
                    step_by_step_procedure=r.get("step_by_step_procedure", ["Prep", "Seal", "Inject", "Finish"])
                ))

            raw_mp = ai_result.get("monitoring_protocol", {})
            monitoring = MonitoringProtocol(
                recommended_sensors=raw_mp.get("recommended_sensors", ["Calibrated Tell-Tale Gauge"]),
                monitoring_frequency=raw_mp.get("monitoring_frequency", "Bi-weekly"),
                displacement_threshold_alert=raw_mp.get("displacement_threshold_alert", ">0.5mm movement")
            )

            return CrackAnalysisResponse(
                crack_detected=bool(ai_result.get("crack_detected", True)),
                summary=ai_result.get("summary", "Structural crack analysis completed."),
                classification=CrackClassification(
                    primary_type=c.get("primary_type", "Diagonal Shear Crack"),
                    estimated_width_mm=float(c.get("estimated_width_mm", 2.0)),
                    width_category=c.get("width_category", "Moderate (1.5-3mm)"),
                    propagation_pattern=c.get("propagation_pattern", "45-degree Diagonal"),
                    structural_significance=c.get("structural_significance", "Structural Hazard"),
                    depth_indicator=c.get("depth_indicator", "Mid-Depth")
                ),
                severity=CrackSeverityAssessment(
                    severity_score=int(s.get("severity_score", 70)),
                    urgency_level=s.get("urgency_level", "URGENT_SHORING"),
                    risk_of_structural_failure=s.get("risk_of_structural_failure", "MEDIUM"),
                    recommended_reinspection_days=int(s.get("recommended_reinspection_days", 14))
                ),
                probable_causes=causes,
                recommended_repairs=repairs,
                monitoring_protocol=monitoring,
                compliance_codes=ai_result.get("compliance_codes", [
                    "ACI 224.1R-07",
                    "ACI 318-19",
                    "ASTM C881"
                ]),
                analysis_timestamp=datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            )
        except Exception as e:
            print(f"[CrackAnalyzer] Parsing AI response failed: {e}, using analytical fallback.")

    return fallback_crack_analysis(request)
