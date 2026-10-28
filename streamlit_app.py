import base64
import json
import os
from datetime import date
from typing import Any

import requests
import streamlit as st


st.set_page_config(
    page_title="BuildIntel AI",
    page_icon="🏗️",
    layout="wide",
)


def configured_api_url() -> str:
    return os.getenv("API_BASE_URL", "").strip()


def api_url() -> str:
    return st.sidebar.text_input(
        "FastAPI base URL",
        value=configured_api_url(),
        placeholder="https://your-api-service.onrender.com",
        help="Set API_BASE_URL in Streamlit secrets, or enter your deployed API URL here.",
    ).rstrip("/")


def request_api(
    base_url: str,
    method: str,
    path: str,
    payload: dict[str, Any] | None = None,
) -> dict[str, Any] | None:
    if not base_url:
        st.error("Configure the FastAPI base URL in the sidebar before using this feature.")
        return None

    try:
        response = requests.request(
            method,
            f"{base_url}{path}",
            json=payload,
            timeout=120,
        )
        response.raise_for_status()
        return response.json()
    except requests.HTTPError as error:
        detail = error.response.text if error.response is not None else str(error)
        st.error(f"API request failed: {detail}")
    except requests.RequestException as error:
        st.error(f"Could not reach the API: {error}")
    except ValueError as error:
        st.error(f"The API returned an invalid JSON response: {error}")
    return None


def encode_upload(upload: Any) -> str | None:
    if upload is None:
        return None
    return base64.b64encode(upload.getvalue()).decode("ascii")


def submit_form(
    base_url: str,
    path: str,
    payload: dict[str, Any],
) -> None:
    result = request_api(base_url, "POST", path, payload)
    if result is not None:
        st.session_state[f"result:{path}"] = result


def show_result(path: str) -> None:
    result = st.session_state.get(f"result:{path}")
    if result is None:
        return
    st.subheader("Analysis result")
    st.json(result)
    st.download_button(
        "Download result as JSON",
        data=json.dumps(result, indent=2),
        file_name="buildintel-result.json",
        mime="application/json",
    )


def get_samples(base_url: str) -> dict[str, Any]:
    samples = request_api(base_url, "GET", "/api/sample-data")
    return samples or {}


def sample_image(
    base_url: str,
    selected: bool,
    key: str,
) -> str | None:
    if not selected:
        return None
    samples = get_samples(base_url)
    image = samples.get(key, {}).get("image_base64")
    if not image:
        st.error("The API did not provide the requested sample image.")
        return None
    return image


def render_safety(base_url: str) -> None:
    st.header("Site safety & PPE monitor")
    with st.form("safety_form"):
        site_location = st.text_input(
            "Site location", "Tower B - 12th Floor Perimeter Framing"
        )
        project_phase = st.text_input("Project phase", "Structural Framing")
        weather_context = st.text_input("Weather context", "Clear, Daylight, 24°C")
        notes = st.text_area(
            "Inspection notes",
            "Workers assembling cantilever formwork; checking tie-off compliance.",
        )
        image = st.file_uploader(
            "Site photo (optional)", type=["jpg", "jpeg", "png"], key="safety_image"
        )
        use_sample = st.checkbox("Use the API's sample safety photo")
        submitted = st.form_submit_button("Analyze safety")

    if submitted:
        payload = {
            "site_location": site_location,
            "project_phase": project_phase,
            "weather_context": weather_context,
            "notes": notes,
        }
        image_base64 = encode_upload(image)
        if image_base64:
            payload["image_base64"] = image_base64
        elif use_sample:
            sample = sample_image(base_url, True, "safety_sample")
            if sample:
                payload["image_base64"] = sample
            else:
                return
        submit_form(base_url, "/api/safety/analyze", payload)
    show_result("/api/safety/analyze")


def render_crack(base_url: str) -> None:
    st.header("Structural crack diagnostics")
    with st.form("crack_form"):
        surface = st.text_input("Surface material", "Reinforced Concrete (M35)")
        element = st.text_input("Structural element", "Transfer Girder Web")
        age = st.number_input("Structure age (years)", min_value=0, value=6)
        environment = st.text_input("Environment", "Exterior Coastal Exposure")
        notes = st.text_area(
            "Inspection notes",
            "Cracking observed near column support face after heavy mechanical plant installation.",
        )
        image = st.file_uploader(
            "Crack photo (optional)", type=["jpg", "jpeg", "png"], key="crack_image"
        )
        use_sample = st.checkbox("Use the API's sample crack photo")
        submitted = st.form_submit_button("Analyze crack")

    if submitted:
        payload = {
            "surface_material": surface,
            "structural_element": element,
            "structure_age_years": int(age),
            "environment": environment,
            "notes": notes,
        }
        image_base64 = encode_upload(image)
        if image_base64:
            payload["image_base64"] = image_base64
        elif use_sample:
            sample = sample_image(base_url, True, "crack_sample")
            if sample:
                payload["image_base64"] = sample
            else:
                return
        submit_form(base_url, "/api/crack/analyze", payload)
    show_result("/api/crack/analyze")


def render_planner(base_url: str) -> None:
    st.header("Project planner & material estimator")
    with st.form("planner_form"):
        project_type = st.text_input("Project type", "Commercial Complex")
        area = st.number_input("Built-up area (sq ft)", min_value=1.0, value=45000.0)
        floors = st.number_input("Floors", min_value=1, value=6)
        quality = st.text_input("Quality tier", "Standard / Premium")
        duration = st.number_input("Target duration (months)", min_value=1, value=18)
        location = st.text_input("Location tier", "Tier 1 Metro")
        soil = st.text_input("Soil condition", "Medium Clay / Stable")
        sustainability = st.text_input(
            "Sustainability target", "LEED Gold / Energy Efficient"
        )
        submitted = st.form_submit_button("Generate estimate")

    if submitted:
        submit_form(
            base_url,
            "/api/planner/estimate",
            {
                "project_type": project_type,
                "built_up_area_sqft": area,
                "floors": int(floors),
                "quality_tier": quality,
                "target_duration_months": int(duration),
                "location_tier": location,
                "soil_condition": soil,
                "sustainability_target": sustainability,
            },
        )
    show_result("/api/planner/estimate")


def render_valuation(base_url: str) -> None:
    st.header("Real estate valuation")
    amenities_default = [
        "Multi-Level Parking",
        "High-Speed Elevators",
        "Solar Rooftop",
        "Backup Generators",
        "LEED Certified",
    ]
    with st.form("valuation_form"):
        property_type = st.text_input("Property type", "Commercial Office")
        plot_area = st.number_input("Plot area (sq ft)", min_value=1.0, value=20000.0)
        built_area = st.number_input(
            "Built-up area (sq ft)", min_value=1.0, value=45000.0
        )
        age = st.number_input("Property age (years)", min_value=0, value=2)
        submarket = st.text_input(
            "City and submarket", "Financial District, Austin TX"
        )
        tier = st.text_input("Submarket tier", "Prime CBD")
        quality = st.text_input("Construction quality", "Grade A / Luxury")
        stage = st.text_input("Construction stage", "Ready for Occupancy")
        amenities = st.multiselect("Amenities", amenities_default, amenities_default)
        occupancy = st.number_input(
            "Occupancy rate (%)", min_value=0.0, max_value=100.0, value=94.0
        )
        submitted = st.form_submit_button("Appraise property")

    if submitted:
        submit_form(
            base_url,
            "/api/valuation/appraise",
            {
                "property_type": property_type,
                "plot_area_sqft": plot_area,
                "built_up_area_sqft": built_area,
                "property_age_years": int(age),
                "city_and_submarket": submarket,
                "submarket_tier": tier,
                "construction_quality": quality,
                "construction_stage": stage,
                "amenities": amenities,
                "occupancy_rate_percent": occupancy,
            },
        )
    show_result("/api/valuation/appraise")


def render_daily_site(base_url: str) -> None:
    st.header("Daily site report")
    sample_trades = [
        {
            "trade": "Carpentry & Formwork",
            "headcount": 16,
            "shift": "Day Shift",
            "productivity_rating": "HIGH",
        },
        {
            "trade": "Rebar Bending & Fixing",
            "headcount": 18,
            "shift": "Day Shift",
            "productivity_rating": "HIGH",
        },
        {
            "trade": "Concrete Pumping & Finishing",
            "headcount": 12,
            "shift": "Day Shift",
            "productivity_rating": "NORMAL",
        },
    ]
    with st.form("daily_site_form"):
        report_date = st.date_input("Report date", date.today())
        project = st.text_input("Project name", "Skyline Apex Tower - Phase III")
        location = st.text_input("Site location", "West Core Grid C4-E8")
        weather = st.text_input("Weather summary", "Sunny, 28°C, Wind 16 km/h")
        workers = st.number_input("Total workers on site", min_value=0, value=62)
        trades_json = st.text_area(
            "Trade headcounts (JSON list)",
            json.dumps(sample_trades, indent=2),
            height=220,
        )
        equipment = st.text_area(
            "Equipment operating (one item per line)",
            "Tower Crane Potain MDT 219\nSchwing Concrete Boom Pump 38m\nPassenger Hoist",
        )
        completed = st.text_area(
            "Work completed today",
            "Poured 160 m³ slab on Level 9. Erected formwork for North shear walls. "
            "Installed electrical conduits for Zone 3 lighting.",
        )
        delays = st.text_area(
            "Delays or incidents",
            "Minor 30-min delay on second mixer truck due to highway resurfacing. Zero injuries.",
        )
        submitted = st.form_submit_button("Generate daily report")

    if submitted:
        try:
            trades = json.loads(trades_json)
            if not isinstance(trades, list):
                raise ValueError("Trade headcounts must be a JSON list.")
        except (json.JSONDecodeError, ValueError) as error:
            st.error(f"Invalid trade headcounts: {error}")
        else:
            submit_form(
                base_url,
                "/api/daily-site/report",
                {
                    "report_date": report_date.isoformat(),
                    "project_name": project,
                    "site_location": location,
                    "weather_summary": weather,
                    "total_workers_on_site": int(workers),
                    "trades": trades,
                    "equipment_operating": [
                        line.strip() for line in equipment.splitlines() if line.strip()
                    ],
                    "work_completed_today": completed,
                    "delays_or_incidents": delays,
                },
            )
    show_result("/api/daily-site/report")
    result = st.session_state.get("result:/api/daily-site/report")
    if result and result.get("ready_for_export_pdf_markdown"):
        st.download_button(
            "Download daily report (Markdown)",
            data=result["ready_for_export_pdf_markdown"],
            file_name="daily-site-report.md",
            mime="text/markdown",
        )


def render_weather(base_url: str) -> None:
    st.header("Weather-aware operations advisory")
    with st.form("weather_form"):
        location = st.text_input("Project location", "Metro Construction Hub")
        temperature = st.number_input("Temperature (°C)", value=33.5)
        humidity = st.number_input(
            "Humidity (%)", min_value=0.0, max_value=100.0, value=65.0
        )
        rain = st.number_input(
            "Rain probability (%)", min_value=0.0, max_value=100.0, value=20.0
        )
        wind = st.number_input("Wind speed (km/h)", min_value=0.0, value=24.0)
        gusts = st.number_input("Wind gusts (km/h)", min_value=0.0, value=36.0)
        uv = st.number_input("UV index", min_value=0, value=9)
        submitted = st.form_submit_button("Generate advisory")

    if submitted:
        submit_form(
            base_url,
            "/api/weather/advisory",
            {
                "location": location,
                "temperature_c": temperature,
                "humidity_percent": humidity,
                "rain_probability_percent": rain,
                "wind_speed_kmh": wind,
                "wind_gusts_kmh": gusts,
                "uv_index": int(uv),
            },
        )
    show_result("/api/weather/advisory")


def render_knowledge(base_url: str) -> None:
    st.header("Engineering knowledge assistant")
    history = st.session_state.setdefault("knowledge_history", [])
    for message in history:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])

    image = st.file_uploader(
        "Optional construction photo or blueprint",
        type=["jpg", "jpeg", "png"],
        key="knowledge_image",
    )
    domain = st.selectbox(
        "Engineering domain",
        [
            "Structural & Site Engineering",
            "Structural",
            "Geotechnical",
            "OSHA/Safety",
            "Building Codes",
            "MEP",
            "Project Management",
        ],
    )
    query = st.chat_input("Ask a construction engineering question")
    if query:
        history.append({"role": "user", "content": query})
        payload: dict[str, Any] = {
            "query": query,
            "conversation_history": history[:-1],
            "engineering_domain": domain,
        }
        image_base64 = encode_upload(image)
        if image_base64:
            payload["image_base64"] = image_base64
        result = request_api(base_url, "POST", "/api/knowledge/chat", payload)
        if result is not None:
            reply = result.get("reply", "")
            history.append({"role": "assistant", "content": reply})
            st.rerun()


st.title("BuildIntel AI")
st.caption("Construction planning, site operations, safety, and engineering intelligence")
base_url = api_url()

if st.sidebar.button("Check API connection"):
    health = request_api(base_url, "GET", "/api/health")
    if health:
        st.sidebar.success(
            f"API online · AI: {health.get('ai_status', 'unknown')}"
        )

pages = {
    "Site safety": render_safety,
    "Crack diagnostics": render_crack,
    "Project planner": render_planner,
    "Property valuation": render_valuation,
    "Daily site report": render_daily_site,
    "Weather advisory": render_weather,
    "Knowledge assistant": render_knowledge,
}
selected_page = st.sidebar.radio("Platform module", list(pages))
pages[selected_page](base_url)
