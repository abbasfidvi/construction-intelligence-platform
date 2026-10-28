from typing import List, Optional, Dict
from pydantic import BaseModel, Field

class TradeHeadcount(BaseModel):
    trade: str = Field(..., description="Carpentry & Formwork, Rebar Bending, Concrete Masonry, MEP & Electrical, Glazing, General Labor")
    headcount: int
    shift: str = Field("Day Shift", description="Day Shift, Night Shift, Overtime")
    productivity_rating: str = Field("HIGH", description="HIGH, NORMAL, SLUGGISH, HALTED")

class BlockerItem(BaseModel):
    title: str
    severity: str = Field(..., description="CRITICAL, HIGH, MEDIUM, LOW")
    cause: str
    impact_delay_hours: float
    recommended_mitigation: str
    owner: str

class DailySiteReportRequest(BaseModel):
    report_date: str = Field("2026-10-28", description="YYYY-MM-DD")
    project_name: str = Field("Skyline Tower 2 - Phase II")
    site_location: str = Field("North District, Sector 4")
    weather_summary: str = Field("Partly Sunny, 26°C, Wind 14 km/h")
    total_workers_on_site: int = Field(54)
    trades: List[TradeHeadcount] = Field(default_factory=list)
    equipment_operating: List[str] = Field(default_factory=lambda: ["Tower Crane 1", "Boom Concrete Pump 42m", "Excavator CAT 320", "Forklift 3T"])
    work_completed_today: str = Field("Completed 8th-floor suspended slab rebar placement; concrete pour commenced 14:00; completed North column forms stripping.")
    delays_or_incidents: Optional[str] = Field("Ready-mix transit mixer delayed by 45 mins due to city traffic. Temporary pressure drop on hydraulic pump resolved in 20 mins.")
    photos_base64: Optional[List[str]] = Field(default_factory=list)

class DailySiteReportResponse(BaseModel):
    project_name: str
    report_date: str
    executive_overview: str
    site_productivity_score: int = Field(..., description="0-100 productivity score")
    milestone_pace: str = Field(..., description="Ahead of Schedule, On Track, Minor Variance (-2 days), Critical Delay")
    labor_analytics: Dict[str, int]
    completed_milestones_verified: List[str]
    identified_risks_and_blockers: List[BlockerItem]
    safety_compliance_check: str
    next_shift_directives: List[str]
    ready_for_export_pdf_markdown: str
