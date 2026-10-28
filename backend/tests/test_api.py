import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "ai_engine" in data

def test_sample_data():
    response = client.get("/api/sample-data")
    assert response.status_code == 200
    data = response.json()
    assert "safety_sample" in data
    assert "crack_sample" in data
    assert "planner_sample" in data
    assert "valuation_sample" in data

def test_safety_analysis_endpoint():
    payload = {
        "site_location": "Level 4 Perimeter",
        "project_phase": "Structural Framing",
        "weather_context": "Clear",
        "notes": "Testing safety compliance"
    }
    response = client.post("/api/safety/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "overall_risk_level" in data
    assert "safety_score" in data
    assert isinstance(data["detected_hazards"], list)
    assert "ppe_compliance" in data
    assert "corrective_action_plan" in data

def test_crack_analysis_endpoint():
    payload = {
        "surface_material": "Reinforced Concrete",
        "structural_element": "Load-Bearing Beam",
        "structure_age_years": 4,
        "environment": "Exterior Coastal"
    }
    response = client.post("/api/crack/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["crack_detected"] is True
    assert "classification" in data
    assert "severity" in data
    assert len(data["recommended_repairs"]) > 0

def test_planner_estimate_endpoint():
    payload = {
        "project_type": "Commercial Complex",
        "built_up_area_sqft": 30000,
        "floors": 5,
        "quality_tier": "Standard / Premium",
        "target_duration_months": 15,
        "location_tier": "Tier 1 Metro"
    }
    response = client.post("/api/planner/estimate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["cost_breakdown"]["total_estimated_budget_usd"] > 0
    assert len(data["bill_of_materials"]) > 0
    assert len(data["schedule_gantt"]) > 0

def test_valuation_endpoint():
    payload = {
        "property_type": "Commercial Office",
        "plot_area_sqft": 15000,
        "built_up_area_sqft": 30000,
        "property_age_years": 2,
        "city_and_submarket": "Downtown Financial District",
        "submarket_tier": "Prime CBD",
        "construction_quality": "Grade A / Luxury",
        "construction_stage": "Ready for Occupancy",
        "amenities": ["Parking", "Solar", "Elevators"]
    }
    response = client.post("/api/valuation/appraise", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["valuation_summary"]["estimated_market_value_usd"] > 0
    assert data["financial_metrics"]["gross_rental_yield_percent"] > 0

def test_weather_advisory_endpoint():
    payload = {
        "location": "Central Metro",
        "temperature_c": 34.0,
        "humidity_percent": 70.0,
        "rain_probability_percent": 15.0,
        "wind_speed_kmh": 22.0
    }
    response = client.post("/api/weather/advisory", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "pour_suitability" in data
    assert "crane_and_rigging" in data
    assert "site_advisory_level" in data

def test_daily_site_report_endpoint():
    payload = {
        "report_date": "2026-10-28",
        "project_name": "Skyline Project",
        "site_location": "Core West",
        "weather_summary": "Clear, 25C",
        "total_workers_on_site": 40,
        "trades": [
            {"trade": "Carpentry", "headcount": 10, "shift": "Day Shift", "productivity_rating": "HIGH"}
        ],
        "equipment_operating": ["Crane 1"],
        "work_completed_today": "Formwork setup complete"
    }
    response = client.post("/api/daily-site/report", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["site_productivity_score"] > 0
    assert "ready_for_export_pdf_markdown" in data

def test_knowledge_chat_endpoint():
    payload = {
        "query": "What is the minimum rebar lap length for Grade 60 rebar in ACI 318?",
        "engineering_domain": "Structural Engineering"
    }
    response = client.post("/api/knowledge/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["reply"]) > 50
    assert len(data["referenced_codes_and_standards"]) > 0

def test_edge_cases():
    # 1. Edge case: extreme weather values
    extreme_weather = {
        "location": "Extreme Zone",
        "temperature_c": 52.0, # Extreme heat
        "humidity_percent": 95.0,
        "rain_probability_percent": 98.0,
        "wind_speed_kmh": 65.0 # Gale wind
    }
    resp = client.post("/api/weather/advisory", json=extreme_weather)
    assert resp.status_code == 200
    w_data = resp.json()
    assert w_data["crane_and_rigging"]["safe_to_operate"] is False
    assert w_data["pour_suitability"]["status"] in ["CAUTION", "PROHIBITED"]

    # 2. Edge case: minimal planner request
    minimal_plan = {
        "project_type": "Industrial Warehouse",
        "built_up_area_sqft": 1000,
        "floors": 1,
        "quality_tier": "Economy / Budget",
        "target_duration_months": 6,
        "location_tier": "Suburban"
    }
    resp2 = client.post("/api/planner/estimate", json=minimal_plan)
    assert resp2.status_code == 200
    assert resp2.json()["cost_breakdown"]["total_estimated_budget_usd"] > 0
