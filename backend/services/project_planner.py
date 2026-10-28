import datetime
from typing import List, Dict, Any
from backend.models.planner_models import (
    PlannerEstimateRequest,
    PlannerEstimateResponse,
    MaterialItem,
    GanttTask,
    CostBreakdown
)
from backend.services.gemini_service import gemini_service

PLANNER_SYSTEM_PROMPT = """You are a certified Lead Construction Estimator and Senior Project Controls Manager (AACE / PMP certified).
Compute a rigorous construction estimate, Bill of Materials (BOM), cost breakdown, and Critical Path Gantt schedule for the project specifications provided.
Respond ONLY with a JSON object strictly matching this schema:
{
  "total_duration_weeks": 52,
  "cost_breakdown": {
    "materials_cost_usd": 1250000.0,
    "labor_cost_usd": 850000.0,
    "equipment_and_machinery_cost_usd": 320000.0,
    "architectural_and_permits_usd": 180000.0,
    "contingency_reserve_usd": 260000.0,
    "total_estimated_budget_usd": 2860000.0,
    "cost_per_sqft_usd": 114.4
  },
  "bill_of_materials": [
    {
      "category": "Structural Concrete",
      "item_name": "Ready-Mix Concrete Grade C30/37",
      "quantity": 2450.0,
      "unit": "Cubic Yards",
      "unit_rate_usd": 145.0,
      "total_cost_usd": 355250.0,
      "specifications": "High early-strength portland cement with silica fume"
    }
  ],
  "schedule_gantt": [
    {
      "task_id": "TSK-01",
      "task_name": "Geotechnical Survey & Site Clearing",
      "start_week": 1,
      "duration_weeks": 4,
      "end_week": 4,
      "phase": "Pre-construction",
      "critical_path": true,
      "dependencies": [],
      "progress_percent": 100,
      "assigned_crew": "Earthmoving Team"
    }
  ],
  "architectural_insights": [
    "Utilize post-tensioned flat plate slabs to reduce floor-to-floor height by 250mm, saving facade costs."
  ],
  "value_engineering_tips": [
    "Standardizing window panel dimensions allows 14% bulk procurement discount on curtain wall glazing."
  ]
}
"""

def generate_analytical_plan(request: PlannerEstimateRequest) -> PlannerEstimateResponse:
    area = request.built_up_area_sqft
    floors = max(1, request.floors)
    
    # Cost per sqft base rate based on quality tier & project type
    base_rate_map = {
        "Economy / Budget": 95.0,
        "Standard / Premium": 145.0,
        "Luxury / High-End": 230.0
    }
    type_multiplier_map = {
        "Residential Villa": 1.15,
        "Multi-Family Apartment": 1.0,
        "Commercial Complex": 1.25,
        "Industrial Warehouse": 0.85,
        "Infrastructure": 1.35
    }
    
    tier_rate = base_rate_map.get(request.quality_tier, 145.0)
    type_mult = type_multiplier_map.get(request.project_type, 1.0)
    rate_per_sqft = round(tier_rate * type_mult, 2)
    total_budget = round(area * rate_per_sqft, 2)
    
    # Cost distribution
    materials_cost = round(total_budget * 0.44, 2)
    labor_cost = round(total_budget * 0.28, 2)
    equipment_cost = round(total_budget * 0.12, 2)
    permits_arch = round(total_budget * 0.06, 2)
    contingency = round(total_budget * 0.10, 2)
    
    # Material takeoff heuristics based on square footage
    concrete_cuyds = round(area * 0.038 * (1 + (floors * 0.04)), 1)
    rebar_tons = round(concrete_cuyds * 0.095, 1)
    masonry_sqft = round(area * 0.65, 1)
    structural_steel_tons = round(area * 0.004 * floors, 1)
    glazing_sqft = round(area * 0.22, 1)
    flooring_sqft = round(area * 0.90, 1)
    paint_sqft = round(area * 2.8, 1)
    
    bom = [
        MaterialItem(
            category="Structural Concrete",
            item_name="Ready-Mix Concrete Grade M30 / C30-37",
            quantity=concrete_cuyds,
            unit="Cubic Yards",
            unit_rate_usd=148.0,
            total_cost_usd=round(concrete_cuyds * 148.0, 2),
            specifications="High durability Portland Pozzolana Cement, 28-day 4500 PSI"
        ),
        MaterialItem(
            category="Reinforcement Steel",
            item_name="TMT Fe500D Thermo-Mechanically Treated Rebar",
            quantity=rebar_tons,
            unit="Metric Tons",
            unit_rate_usd=840.0,
            total_cost_usd=round(rebar_tons * 840.0, 2),
            specifications="High ductility corrosion-resistant rebars, ASTM A615 Grade 60"
        ),
        MaterialItem(
            category="Masonry & Partitions",
            item_name="Autoclaved Aerated Concrete (AAC) Lightweight Blocks",
            quantity=masonry_sqft,
            unit="Square Feet",
            unit_rate_usd=4.20,
            total_cost_usd=round(masonry_sqft * 4.20, 2),
            specifications="Thermal insulating blocks, 600x200x150mm with polymer adhesive"
        ),
        MaterialItem(
            category="Structural Framing",
            item_name="Structural Steel Sections & Decking Sheets",
            quantity=structural_steel_tons,
            unit="Metric Tons",
            unit_rate_usd=1650.0,
            total_cost_usd=round(structural_steel_tons * 1650.0, 2),
            specifications="Galvanized profiled composite steel deck & shear studs"
        ),
        MaterialItem(
            category="Building Facade & Glazing",
            item_name="Double-Glazed Low-E Performance Curtain Wall",
            quantity=glazing_sqft,
            unit="Square Feet",
            unit_rate_usd=42.0,
            total_cost_usd=round(glazing_sqft * 42.0, 2),
            specifications="Argon filled, U-value <= 1.4 W/m²K, solar factor SHGC 0.28"
        ),
        MaterialItem(
            category="Interior Finishes",
            item_name="Vitrified Porcelain Tiles & Acoustic Ceiling Panels",
            quantity=flooring_sqft,
            unit="Square Feet",
            unit_rate_usd=8.50,
            total_cost_usd=round(flooring_sqft * 8.50, 2),
            specifications="Heavy commercial abrasion Class PEI-V with non-slip R10 finish"
        ),
        MaterialItem(
            category="Protective Coatings",
            item_name="Low-VOC Elastomeric Weatherproof Paint & Primer",
            quantity=paint_sqft,
            unit="Square Feet",
            unit_rate_usd=1.35,
            total_cost_usd=round(paint_sqft * 1.35, 2),
            specifications="Anti-fungal, crack-bridging elastomeric coating with 10-yr warranty"
        )
    ]
    
    # Calculate duration
    weeks_total = max(24, int(request.target_duration_months * 4.3))
    
    # Build Gantt tasks across standard construction lifecycle
    w1 = max(2, int(weeks_total * 0.08))
    w2 = max(3, int(weeks_total * 0.12))
    w3 = max(4, int(weeks_total * 0.28))
    w4 = max(4, int(weeks_total * 0.20))
    w5 = max(3, int(weeks_total * 0.18))
    w6 = max(2, int(weeks_total * 0.10))
    w7 = max(1, weeks_total - (w1 + w2 + w3 + w4 + w5 + w6))
    if w7 < 2:
        w7 = 2
        weeks_total = w1 + w2 + w3 + w4 + w5 + w6 + w7

    s1 = 1
    e1 = s1 + w1 - 1
    s2 = e1
    e2 = s2 + w2 - 1
    s3 = e2
    e3 = s3 + w3 - 1
    s4 = int(s3 + w3 * 0.4)
    e4 = s4 + w4 - 1
    s5 = int(s4 + w4 * 0.3)
    e5 = s5 + w5 - 1
    s6 = int(e5 - 2)
    e6 = s6 + w6 - 1
    s7 = e6
    e7 = s7 + w7 - 1
    
    tasks = [
        GanttTask(task_id="TSK-01", task_name="Geotechnical Investigation & Site Mobilization", start_week=s1, duration_weeks=w1, end_week=e1, phase="Pre-construction", critical_path=True, dependencies=[], progress_percent=100, assigned_crew="Site Engineering & Earthworks"),
        GanttTask(task_id="TSK-02", task_name="Substructure Excavation, Piling & Foundation Footings", start_week=s2, duration_weeks=w2, end_week=e2, phase="Substructure", critical_path=True, dependencies=["TSK-01"], progress_percent=85, assigned_crew="Heavy Excavation & Rebar Piling"),
        GanttTask(task_id="TSK-03", task_name=f"Superstructure Concrete Columns, Beams & Slabs (L1 to L{floors})", start_week=s3, duration_weeks=w3, end_week=e3, phase="Superstructure", critical_path=True, dependencies=["TSK-02"], progress_percent=40, assigned_crew="Formwork & Structural Concrete Team"),
        GanttTask(task_id="TSK-04", task_name="Building Envelope, External Masonry & Curtain Wall Glazing", start_week=s4, duration_weeks=w4, end_week=e4, phase="Superstructure", critical_path=False, dependencies=["TSK-03"], progress_percent=15, assigned_crew="Facade Specialists & Masonry"),
        GanttTask(task_id="TSK-05", task_name="MEP Rough-in: Electrical Conduits, HVAC Ducting & Plumbing Stacks", start_week=s5, duration_weeks=w5, end_week=e5, phase="MEP", critical_path=True, dependencies=["TSK-03"], progress_percent=10, assigned_crew="MEP Mechanical/Electrical Crew"),
        GanttTask(task_id="TSK-06", task_name="Interior Drywall Partitions, Flooring, Tiling & Architectural Finishes", start_week=s6, duration_weeks=w6, end_week=e6, phase="Finishes", critical_path=False, dependencies=["TSK-05"], progress_percent=0, assigned_crew="Interior Fit-Out & Joinery"),
        GanttTask(task_id="TSK-07", task_name="Testing, Commissioning, Fire Marshall Clearance & Handover", start_week=s7, duration_weeks=w7, end_week=e7, phase="Commissioning", critical_path=True, dependencies=["TSK-05", "TSK-06"], progress_percent=0, assigned_crew="Quality QA/QC & Commissioning")
    ]
    
    insights = [
        f"For a {floors}-story {request.project_type}, adopting pre-fabricated post-tensioned slabs will shave approximately 4 weeks from structural frame assembly.",
        f"Soil condition ({request.soil_condition}) allows shallow raft foundation with localized column thickening, avoiding costly deep micro-piling.",
        f"Building envelope orientation should optimize North-South glazing to lower lifetime HVAC chiller loads by up to 22%."
    ]
    
    ve_tips = [
        "Procure Grade Fe500D rebar in standardized custom cut lengths directly from the primary rolling mill to cut site scrap loss from 6% to under 1.8%.",
        "Replace conventional wet plastering with gypsum skim-coat boards for internal drywalls, accelerating curing dry times by 14 days per floor.",
        "Implement high-volume fly ash concrete (HVFA 30% cement replacement) for substructure footings to achieve cost reduction and LEED carbon credits."
    ]
    
    return PlannerEstimateResponse(
        project_type=request.project_type,
        built_up_area_sqft=area,
        floors=floors,
        total_duration_weeks=e7,
        cost_breakdown=CostBreakdown(
            materials_cost_usd=materials_cost,
            labor_cost_usd=labor_cost,
            equipment_and_machinery_cost_usd=equipment_cost,
            architectural_and_permits_usd=permits_arch,
            contingency_reserve_usd=contingency,
            total_estimated_budget_usd=total_budget,
            cost_per_sqft_usd=rate_per_sqft
        ),
        bill_of_materials=bom,
        schedule_gantt=tasks,
        architectural_insights=insights,
        value_engineering_tips=ve_tips,
        generated_timestamp=datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )

def estimate_project_plan(request: PlannerEstimateRequest) -> PlannerEstimateResponse:
    prompt = f"""Generate a detailed construction estimate, Bill of Quantities (BOM), cost breakdown, and Gantt schedule.
Parameters:
- Project Type: {request.project_type}
- Built-up Area: {request.built_up_area_sqft} sq.ft.
- Number of Stories/Floors: {request.floors}
- Construction Quality Tier: {request.quality_tier}
- Target Timeline: {request.target_duration_months} months
- Geographical / Location Tier: {request.location_tier}
- Soil Condition: {request.soil_condition}
- Sustainability Goal: {request.sustainability_target}

Deliver realistic industry unit rates, itemized quantities for major construction trades, and sequential Gantt tasks with critical path flags.
"""
    ai_result = gemini_service.generate_json_response(
        prompt=prompt,
        system_instruction=PLANNER_SYSTEM_PROMPT
    )

    if ai_result and isinstance(ai_result, dict) and "cost_breakdown" in ai_result:
        try:
            raw_cb = ai_result.get("cost_breakdown", {})
            cb = CostBreakdown(
                materials_cost_usd=float(raw_cb.get("materials_cost_usd", 1000000.0)),
                labor_cost_usd=float(raw_cb.get("labor_cost_usd", 600000.0)),
                equipment_and_machinery_cost_usd=float(raw_cb.get("equipment_and_machinery_cost_usd", 250000.0)),
                architectural_and_permits_usd=float(raw_cb.get("architectural_and_permits_usd", 120000.0)),
                contingency_reserve_usd=float(raw_cb.get("contingency_reserve_usd", 180000.0)),
                total_estimated_budget_usd=float(raw_cb.get("total_estimated_budget_usd", 2150000.0)),
                cost_per_sqft_usd=float(raw_cb.get("cost_per_sqft_usd", round(2150000.0 / max(1, request.built_up_area_sqft), 2)))
            )

            bom = []
            for item in ai_result.get("bill_of_materials", []):
                bom.append(MaterialItem(
                    category=item.get("category", "Materials"),
                    item_name=item.get("item_name", "Building Material"),
                    quantity=float(item.get("quantity", 100)),
                    unit=item.get("unit", "Units"),
                    unit_rate_usd=float(item.get("unit_rate_usd", 50)),
                    total_cost_usd=float(item.get("total_cost_usd", 5000)),
                    specifications=item.get("specifications", "Standard specification")
                ))

            schedule = []
            for t in ai_result.get("schedule_gantt", []):
                schedule.append(GanttTask(
                    task_id=t.get("task_id", f"TSK-{len(schedule)+1:02d}"),
                    task_name=t.get("task_name", "Construction Activity"),
                    start_week=int(t.get("start_week", 1)),
                    duration_weeks=int(t.get("duration_weeks", 4)),
                    end_week=int(t.get("end_week", 4)),
                    phase=t.get("phase", "Superstructure"),
                    critical_path=bool(t.get("critical_path", False)),
                    dependencies=t.get("dependencies", []),
                    progress_percent=int(t.get("progress_percent", 0)),
                    assigned_crew=t.get("assigned_crew", "General Contractor Crew")
                ))

            return PlannerEstimateResponse(
                project_type=request.project_type,
                built_up_area_sqft=request.built_up_area_sqft,
                floors=request.floors,
                total_duration_weeks=int(ai_result.get("total_duration_weeks", 52)),
                cost_breakdown=cb,
                bill_of_materials=bom if bom else generate_analytical_plan(request).bill_of_materials,
                schedule_gantt=schedule if schedule else generate_analytical_plan(request).schedule_gantt,
                architectural_insights=ai_result.get("architectural_insights", []),
                value_engineering_tips=ai_result.get("value_engineering_tips", []),
                generated_timestamp=datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            )
        except Exception as e:
            print(f"[ProjectPlanner] Parsing AI response failed: {e}, using analytical fallback.")

    return generate_analytical_plan(request)
