from typing import List, Optional
from pydantic import BaseModel, Field

class PourSuitability(BaseModel):
    status: str = Field(..., description="OPTIMAL, CAUTION, PROHIBITED")
    suitability_score: int = Field(..., description="0 to 100 pour suitability rating")
    plastic_shrinkage_cracking_risk: str = Field(..., description="LOW, MODERATE, CRITICAL")
    curing_protocol_adjustments: List[str]
    max_allowable_slump_retention_minutes: int

class CraneSafety(BaseModel):
    safe_to_operate: bool
    current_wind_speed_kmh: float
    max_safe_wind_speed_kmh: float = 38.0
    wind_gust_risk: str = Field(..., description="SAFE, GUST_WATCH, MANDATORY_SHUTDOWN")
    derating_factor_percent: int
    boom_guidelines: str

class WeatherAdvisoryRequest(BaseModel):
    location: str = Field("Austin Construction Hub", description="Project geographical location")
    temperature_c: float = Field(32.5, description="Ambient temperature in Celsius")
    humidity_percent: float = Field(68.0, description="Relative humidity %")
    rain_probability_percent: float = Field(25.0, description="Precipitation probability %")
    wind_speed_kmh: float = Field(22.0, description="Sustained wind speed km/h")
    wind_gusts_kmh: Optional[float] = Field(None, description="Peak gusts km/h")
    uv_index: Optional[int] = Field(8, description="UV index 1-11+")
    forecast_days: Optional[List[dict]] = Field(default_factory=list)

class WeatherAdvisoryResponse(BaseModel):
    site_advisory_level: str = Field(..., description="GREEN_NORMAL, YELLOW_CAUTION, ORANGE_RESTRICTED, RED_SUSPENSION")
    overall_guidance: str
    temperature_heat_index: str
    pour_suitability: PourSuitability
    crane_and_rigging: CraneSafety
    earthworks_and_excavation_risk: str
    heat_stress_regime: str
    scheduled_task_recommendations: List[dict]
    twenty_four_hour_outlook: List[dict]
