from typing import List, Optional
from pydantic import BaseModel, Field

class ValuationSummary(BaseModel):
    estimated_market_value_usd: float
    valuation_range_min_usd: float
    valuation_range_max_usd: float
    price_per_sqft_usd: float
    confidence_score_percent: int

class ReplacementCostAnalysis(BaseModel):
    land_value_usd: float
    replacement_cost_new_usd: float
    accumulated_depreciation_usd: float
    depreciated_structure_value_usd: float
    indicated_value_by_cost_approach_usd: float
    depreciation_rate_annual_percent: float

class FinancialMetrics(BaseModel):
    potential_annual_rental_income_usd: float
    estimated_monthly_rent_usd: float
    gross_rental_yield_percent: float
    capitalization_rate_percent: float
    projected_5yr_appreciation_percent: float
    payback_period_years: float

class ValuationFactor(BaseModel):
    factor_name: str
    impact: str = Field(..., description="POSITIVE, NEGATIVE, NEUTRAL")
    adjustment_percentage: float
    description: str

class ValuationRequest(BaseModel):
    property_type: str = Field("Commercial Office", description="Residential Single-Family, Luxury Condo, Commercial Office, Retail Mall, Industrial Facility")
    plot_area_sqft: float = Field(15000, description="Total land area in sqft")
    built_up_area_sqft: float = Field(32000, description="Total built up area in sqft")
    property_age_years: int = Field(3, description="Age of structure in years (0 for under-construction)")
    city_and_submarket: str = Field("Tech Hub CBD, Austin TX", description="City and submarket name")
    submarket_tier: str = Field("Prime CBD", description="Prime CBD, Emerging Growth Corridor, Established Suburb, Outer Metro")
    construction_quality: str = Field("Grade A / Luxury", description="Economy, Standard, Grade A / Luxury, Ultra Luxury")
    construction_stage: str = Field("Ready for Occupancy", description="Planning / Permitting, Structural Shell, Under Fit-out, Ready for Occupancy")
    amenities: List[str] = Field(default_factory=lambda: ["Multi-Level Parking", "High-Speed Elevators", "Solar Rooftop", "Backup Generators", "LEED Certified"])
    occupancy_rate_percent: Optional[float] = Field(92.0, description="Current or expected occupancy rate")

class ValuationResponse(BaseModel):
    property_type: str
    city_and_submarket: str
    valuation_summary: ValuationSummary
    replacement_cost_method: ReplacementCostAnalysis
    financial_metrics: FinancialMetrics
    key_drivers_and_adjustments: List[ValuationFactor] = Field(default_factory=list)
    investment_recommendation: str = Field(..., description="STRONG BUY, ACCUMULATE, HOLD / FAIR VALUE, CAUTION")
    rationale: str
    comparable_benchmark_sales: List[dict] = Field(default_factory=list)
    appraisal_timestamp: str
