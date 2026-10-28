from typing import List, Optional
from pydantic import BaseModel, Field

class MaterialItem(BaseModel):
    category: str = Field(..., description="e.g. Concrete, Steel Rebar, Masonry, Finishing, Plumbing, Electrical")
    item_name: str
    quantity: float
    unit: str
    unit_rate_usd: float
    total_cost_usd: float
    specifications: str

class GanttTask(BaseModel):
    task_id: str
    task_name: str
    start_week: int
    duration_weeks: int
    end_week: int
    phase: str = Field(..., description="Pre-construction, Substructure, Superstructure, MEP, Finishes, Commissioning")
    critical_path: bool
    dependencies: List[str] = Field(default_factory=list)
    progress_percent: int = 0
    assigned_crew: str

class CostBreakdown(BaseModel):
    materials_cost_usd: float
    labor_cost_usd: float
    equipment_and_machinery_cost_usd: float
    architectural_and_permits_usd: float
    contingency_reserve_usd: float
    total_estimated_budget_usd: float
    cost_per_sqft_usd: float

class PlannerEstimateRequest(BaseModel):
    project_type: str = Field("Commercial Complex", description="Residential Villa, Multi-Family Apartment, Commercial Complex, Industrial Warehouse, Infrastructure")
    built_up_area_sqft: float = Field(25000, description="Gross floor area in sqft")
    floors: int = Field(4, description="Number of stories")
    quality_tier: str = Field("Standard / Premium", description="Economy / Budget, Standard / Premium, Luxury / High-End")
    target_duration_months: int = Field(14, description="Desired completion timeline in months")
    location_tier: str = Field("Tier 1 Metro", description="Tier 1 Metro, Tier 2 City, Suburban, Rural / Remote")
    soil_condition: Optional[str] = Field("Medium Clay / Stable", description="Sandy, Soft Clay, Hard Rock, Medium Clay")
    sustainability_target: Optional[str] = Field("LEED Gold / Energy Efficient", description="Standard Building Code, LEED Certified, Net-Zero Ready")

class PlannerEstimateResponse(BaseModel):
    project_type: str
    built_up_area_sqft: float
    floors: int
    total_duration_weeks: int
    cost_breakdown: CostBreakdown
    bill_of_materials: List[MaterialItem] = Field(default_factory=list)
    schedule_gantt: List[GanttTask] = Field(default_factory=list)
    architectural_insights: List[str] = Field(default_factory=list)
    value_engineering_tips: List[str] = Field(default_factory=list)
    generated_timestamp: str
