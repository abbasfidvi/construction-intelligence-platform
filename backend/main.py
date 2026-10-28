import datetime
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import base64

from backend.config import settings
from backend.services.gemini_service import gemini_service
from backend.models.safety_models import SafetyAnalysisRequest, SafetyAnalysisResponse
from backend.models.crack_models import CrackAnalysisRequest, CrackAnalysisResponse
from backend.models.planner_models import PlannerEstimateRequest, PlannerEstimateResponse
from backend.models.valuation_models import ValuationRequest, ValuationResponse
from backend.models.site_daily_models import DailySiteReportRequest, DailySiteReportResponse
from backend.models.weather_models import WeatherAdvisoryRequest, WeatherAdvisoryResponse
from backend.models.knowledge_models import KnowledgeQueryRequest, KnowledgeQueryResponse

from backend.services.safety_analyzer import analyze_safety
from backend.services.crack_analyzer import analyze_crack
from backend.services.project_planner import estimate_project_plan
from backend.services.valuation_service import appraise_property
from backend.services.site_daily_assistant import create_daily_site_report
from backend.services.weather_advisory import evaluate_weather_advisory
from backend.services.knowledge_service import query_construction_knowledge

try:
    from backend.sample_assets.sample_data import SAMPLE_SAFETY_IMAGE_B64, SAMPLE_CRACK_IMAGE_B64
except ImportError:
    SAMPLE_SAFETY_IMAGE_B64 = ""
    SAMPLE_CRACK_IMAGE_B64 = ""

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Multimodal Decision-Support Platform for Construction Planning, Execution, and Monitoring."
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs",
        "status": "online"
    }

@app.get("/api/health")
def health_check():
    ai_status = "connected" if gemini_service.is_configured() else "mock_fallback_mode"
    return {
        "status": "healthy",
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "ai_engine": settings.GEMINI_MODEL,
        "ai_status": ai_status,
        "timestamp": datetime.datetime.now().isoformat()
    }

@app.get("/api/sample-data")
def get_sample_presets():
    """Provides pre-configured demo cases and images for instant 1-click evaluation."""
    return {
        "safety_sample": {
            "title": "Suspended Deck & Scaffolding Perimeter (Unprotected Edge)",
            "site_location": "Tower B - 12th Floor Perimeter Framing",
            "project_phase": "Structural Framing",
            "weather_context": "Clear, Daylight, 24°C",
            "notes": "Workers assembling cantilever formwork; checking tie-off compliance.",
            "image_base64": SAMPLE_SAFETY_IMAGE_B64
        },
        "crack_sample": {
            "title": "Diagonal Shear Crack on Transfer Girder G-12",
            "surface_material": "Reinforced Concrete (M35)",
            "structural_element": "Transfer Girder Web",
            "structure_age_years": 6,
            "environment": "Exterior Coastal Exposure",
            "notes": "Cracking observed near column support face after heavy mechanical plant installation.",
            "image_base64": SAMPLE_CRACK_IMAGE_B64
        },
        "planner_sample": {
            "project_type": "Commercial Complex",
            "built_up_area_sqft": 45000,
            "floors": 6,
            "quality_tier": "Standard / Premium",
            "target_duration_months": 18,
            "location_tier": "Tier 1 Metro",
            "soil_condition": "Medium Clay / Stable",
            "sustainability_target": "LEED Gold / Energy Efficient"
        },
        "valuation_sample": {
            "property_type": "Commercial Office",
            "plot_area_sqft": 20000,
            "built_up_area_sqft": 45000,
            "property_age_years": 2,
            "city_and_submarket": "Financial District, Austin TX",
            "submarket_tier": "Prime CBD",
            "construction_quality": "Grade A / Luxury",
            "construction_stage": "Ready for Occupancy",
            "amenities": ["Multi-Level Parking", "High-Speed Elevators", "Solar Rooftop", "Backup Generators", "LEED Certified"],
            "occupancy_rate_percent": 94.0
        },
        "weather_sample": {
            "location": "Metro Construction Hub",
            "temperature_c": 33.5,
            "humidity_percent": 65.0,
            "rain_probability_percent": 20.0,
            "wind_speed_kmh": 24.0,
            "wind_gusts_kmh": 36.0,
            "uv_index": 9
        },
        "site_daily_sample": {
            "report_date": datetime.date.today().isoformat(),
            "project_name": "Skyline Apex Tower - Phase III",
            "site_location": "West Core Grid C4-E8",
            "weather_summary": "Sunny, 28°C, Wind 16 km/h",
            "total_workers_on_site": 62,
            "trades": [
                {"trade": "Carpentry & Formwork", "headcount": 16, "shift": "Day Shift", "productivity_rating": "HIGH"},
                {"trade": "Rebar Bending & Fixing", "headcount": 18, "shift": "Day Shift", "productivity_rating": "HIGH"},
                {"trade": "Concrete Pumping & Finishing", "headcount": 12, "shift": "Day Shift", "productivity_rating": "NORMAL"},
                {"trade": "MEP & Electrical", "headcount": 10, "shift": "Day Shift", "productivity_rating": "HIGH"},
                {"trade": "General Labor & Housekeeping", "headcount": 6, "shift": "Day Shift", "productivity_rating": "HIGH"}
            ],
            "equipment_operating": ["Tower Crane Potain MDT 219", "Schwing Concrete Boom Pump 38m", "CAT Mini-Excavator 305", "Passenger Hoist"],
            "work_completed_today": "Poured 160 m³ slab on Level 9. Erected formwork for North shear walls. Installed electrical conduits for Zone 3 lighting.",
            "delays_or_incidents": "Minor 30-min delay on second mixer truck due to highway resurfacing. Zero injuries."
        }
    }

# 1. Safety & PPE Analysis Endpoint
@app.post("/api/safety/analyze", response_model=SafetyAnalysisResponse)
def analyze_site_safety(payload: SafetyAnalysisRequest):
    return analyze_safety(payload)

# 2. Crack & Structural Health Endpoint
@app.post("/api/crack/analyze", response_model=CrackAnalysisResponse)
def analyze_structural_crack(payload: CrackAnalysisRequest):
    return analyze_crack(payload)

# 3. Project Planner & Material Estimator Endpoint
@app.post("/api/planner/estimate", response_model=PlannerEstimateResponse)
def generate_project_estimate(payload: PlannerEstimateRequest):
    return estimate_project_plan(payload)

# 4. Real Estate Valuation Endpoint
@app.post("/api/valuation/appraise", response_model=ValuationResponse)
def appraise_real_estate(payload: ValuationRequest):
    return appraise_property(payload)

# 5. Daily Site Operations Report Endpoint
@app.post("/api/daily-site/report", response_model=DailySiteReportResponse)
def process_daily_site_log(payload: DailySiteReportRequest):
    return create_daily_site_report(payload)

# 6. Weather-Aware Advisory Endpoint
@app.post("/api/weather/advisory", response_model=WeatherAdvisoryResponse)
def get_weather_advisory(payload: WeatherAdvisoryRequest):
    return evaluate_weather_advisory(payload)

# 7. Knowledge Assistant Endpoint
@app.post("/api/knowledge/chat", response_model=KnowledgeQueryResponse)
def chat_knowledge_assistant(payload: KnowledgeQueryRequest):
    return query_construction_knowledge(payload)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
