from typing import List, Optional
from pydantic import BaseModel, Field

class ProbableCause(BaseModel):
    cause: str = Field(..., description="Root cause name, e.g., Differential Foundation Settlement, Thermal Shrinkage")
    probability_percent: int = Field(..., description="Confidence percentage 0-100")
    explanation: str = Field(..., description="Mechanistic explanation of how this cause created the crack")

class RepairMethod(BaseModel):
    method_name: str = Field(..., description="e.g. Low-Pressure Epoxy Injection, Polyurethane Grout Injection, Carbon Fiber Polymer Wrapping")
    suitability: str = Field(..., description="Why this method is recommended for this crack")
    estimated_cost_usd: str = Field(..., description="Estimated cost range")
    durability_years: str = Field(..., description="Expected lifespan of repair")
    materials_required: List[str] = Field(default_factory=list)
    step_by_step_procedure: List[str] = Field(default_factory=list)

class CrackClassification(BaseModel):
    primary_type: str = Field(..., description="Diagonal Shear, Flexural, Thermal Shrinkage, Settlement, Craze, Spalling")
    estimated_width_mm: float = Field(..., description="Estimated average or max width in millimeters")
    width_category: str = Field(..., description="Hairline (<0.5mm), Fine (0.5-1.5mm), Moderate (1.5-3mm), Wide (>3mm), Critical (>5mm)")
    propagation_pattern: str = Field(..., description="45-degree Diagonal, Stepped Masonry, Horizontal, Vertical, Map/Spiderweb")
    structural_significance: str = Field(..., description="Aesthetic / Non-structural, Serviceability Concern, or Structural Hazard")
    depth_indicator: str = Field(..., description="Surface only, Rebar depth, Through-slab")

class CrackSeverityAssessment(BaseModel):
    severity_score: int = Field(..., description="1-100 hazard score")
    urgency_level: str = Field(..., description="CRITICAL_EVACUATION, URGENT_SHORING, REPAIR_SOON, MONITOR_PERIODICALLY")
    risk_of_structural_failure: str = Field(..., description="HIGH, MEDIUM, LOW, NEGLIGIBLE")
    recommended_reinspection_days: int

class MonitoringProtocol(BaseModel):
    recommended_sensors: List[str]
    monitoring_frequency: str
    displacement_threshold_alert: str

class CrackAnalysisRequest(BaseModel):
    image_base64: Optional[str] = Field(None, description="Base64 encoded crack photograph")
    surface_material: Optional[str] = Field("Reinforced Concrete", description="Concrete, Brick Masonry, Stone, Drywall, Plaster")
    structural_element: Optional[str] = Field("Load-Bearing Beam", description="Beam, Column, Slab, Retaining Wall, Foundation Footing, Masonry Wall")
    structure_age_years: Optional[int] = Field(5, description="Approximate age of the structure in years")
    environment: Optional[str] = Field("Exterior / Coastal Exposure", description="e.g., Interior Air Conditioned, Basement / High Moisture, Exterior Coastal")
    notes: Optional[str] = Field("", description="Any recent seismic, blast, or heavy load events")

class CrackAnalysisResponse(BaseModel):
    crack_detected: bool
    summary: str
    classification: CrackClassification
    severity: CrackSeverityAssessment
    probable_causes: List[ProbableCause] = Field(default_factory=list)
    recommended_repairs: List[RepairMethod] = Field(default_factory=list)
    monitoring_protocol: MonitoringProtocol
    compliance_codes: List[str] = Field(default_factory=list)
    analysis_timestamp: str
