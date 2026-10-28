from typing import List, Optional
from pydantic import BaseModel, Field

class DetectedHazard(BaseModel):
    id: str = Field(..., description="Unique identifier for hazard")
    hazard_type: str = Field(..., description="Type of hazard, e.g., Fall Risk, Scaffolding Defect, Uncovered Trench")
    severity: str = Field(..., description="CRITICAL, HIGH, MEDIUM, LOW")
    location_in_image: str = Field(..., description="Description of where in the image the hazard is located")
    description: str = Field(..., description="Detailed description of the hazard and risk condition")
    standard_violation: str = Field(..., description="Specific OSHA or international standard code, e.g. OSHA 1926.501")
    immediate_action: str = Field(..., description="Immediate mitigating step to take on site")
    box_coordinates: Optional[List[float]] = Field(None, description="[ymin, xmin, ymax, xmax] normalized 0-100")

class PPEItemStatus(BaseModel):
    item: str = Field(..., description="PPE item name, e.g. Hard Hat, Hi-Vis Vest, Steel-Toe Boots, Eye Protection, Safety Harness")
    status: str = Field(..., description="COMPLIANT, NON_COMPLIANT, or NOT_VISIBLE")
    workers_observed: int = Field(default=0)
    workers_compliant: int = Field(default=0)
    notes: str = Field(default="")

class PPEComplianceReport(BaseModel):
    overall_compliance_rate: float = Field(..., description="Percentage 0-100")
    workers_detected: int = Field(default=0)
    workers_fully_compliant: int = Field(default=0)
    items_inspected: List[PPEItemStatus] = Field(default_factory=list)

class CorrectiveAction(BaseModel):
    step_number: int
    priority: str = Field(..., description="IMMEDIATE, TODAY, NEXT_SHIFT, WITHIN_WEEK")
    action: str
    responsible_role: str = Field(..., description="e.g. Site Safety Officer, Scaffolding Supervisor, Project Engineer")
    target_timeframe: str

class SafetyAnalysisRequest(BaseModel):
    image_base64: Optional[str] = Field(None, description="Base64 encoded image or data URL")
    site_location: Optional[str] = Field("Zone A - Main Superstructure", description="Site section or location description")
    project_phase: Optional[str] = Field("Structural Framing", description="e.g. Excavation, Foundation, Framing, MEP, Finishing")
    weather_context: Optional[str] = Field("Dry / Daylight", description="e.g. Wet/Raining, High Wind, Extreme Heat")
    notes: Optional[str] = Field("", description="Additional context from inspector")

class SafetyAnalysisResponse(BaseModel):
    overall_risk_level: str = Field(..., description="CRITICAL, HIGH, MEDIUM, LOW")
    safety_score: int = Field(..., description="0 to 100 overall safety compliance score")
    summary: str = Field(..., description="Executive summary of the safety inspection")
    detected_hazards: List[DetectedHazard] = Field(default_factory=list)
    ppe_compliance: PPEComplianceReport
    corrective_action_plan: List[CorrectiveAction] = Field(default_factory=list)
    regulatory_citations: List[str] = Field(default_factory=list)
    inspection_timestamp: str
    annotated_zones_count: int = 0
