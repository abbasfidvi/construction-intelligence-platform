# AI-Powered Multimodal Construction Intelligence Platform (BuildIntel AI)

BuildIntel AI is an enterprise-grade, full-stack decision-support system designed to assist construction managers, site safety officers, structural engineers, and real estate appraisers across multiple stages of planning, execution, and field monitoring.

The platform integrates **multimodal artificial intelligence** (powered by Google Gemini 3.8 Flash via `google-genai` with deterministic analytical fallbacks), analyzing images, text descriptions, and structured engineering parameters through strict JSON data contracts.

---

## 🏗️ Core Intelligence Modules

1. **Site Safety & PPE Compliance Monitor (OSHA 1926)**
   - Visual detection of fall risks, unprotected leading edges, scaffolding defects, and hazardous site clutter.
   - Granular PPE compliance auditing (Hard hats, High-vis vests, Fall arrest harnesses, Steel-toe footwear, Eye protection).
   - Dynamic bounding box coordinate mapping over uploaded site photographs.
   - Prioritized corrective action schedules with assigned roles and target timeframes.

2. **Structural Defect & Crack Diagnostics (ACI 224 / ASTM C881)**
   - NDT visual classification of crack types: Diagonal shear, flexural tension, shrinkage, differential settlement, and map cracking.
   - Crack width quantification (mm) and structural significance rating.
   - Root-cause probability attribution and displacement monitoring protocols (Tell-tale optical gauges, vibrating wire transducers).
   - Engineered repair recipes: ASTM C881 structural epoxy injection, CFRP carbon fiber wrap strengthening, and polyurethane grouting.

3. **Project Planner & Material Estimator**
   - Automated Bill of Quantities (BOM) takeoff for Concrete (cu.yds), TMT Steel Rebar (tons), AAC blocks, glazing, and finishes.
   - Itemized budget allocation (Materials, Labor, Machinery, Permits, Contingency Reserve).
   - Critical Path Gantt schedule sequencing with dependency tracking and phase duration planning.
   - One-click export to CSV for procurement workflows.

4. **Real Estate Asset Valuation & Appraisal**
   - Dual-method appraisal: Sales Comparison Approach and Depreciated Replacement Cost Method.
   - Depreciation schedules and indicated asset values.
   - Financial yield metrics: Gross rental yield %, Capitalization rates, 5-year appreciation projections, and payback period.
   - Submarket driver adjustments and local benchmark comp sales.

5. **Daily Field Log Assistant & Site Intelligence**
   - Trade-wise labor headcount tracking (Carpentry, Rebar, Concrete pumping, MEP, General labor).
   - Bottleneck, delay, and blocker impact tracking with mitigation assignment.
   - Automated compilation of exportable Executive Daily Field Reports (Markdown / Print-ready).

6. **Weather-Aware Operational Advisory**
   - ACI 305R concrete pour suitability calculation with plastic shrinkage evaporation modeling.
   - OSHA 1926 crane gust threshold limits (38 km/h hard limit) and boom operation guidance.
   - Worker thermal heat-stress work/rest cycling schedules and trench collapse risk alerts.
   - 24-hour operations outlook and indoor task shifting recommendations.

7. **Multimodal Engineering Knowledge Assistant**
   - Conversational AI citing ACI 318-19, OSHA 29 CFR 1926, IBC 2024, and ASTM standards.
   - Multi-turn technical discussions and image attachment support for defect/blueprint verification.

---

## ⚙️ Tech Stack

- **Backend:** Python 3.9+, FastAPI, Uvicorn, Pydantic v2, Google GenAI SDK (`google-genai`), Pillow, Pytest.
- **Frontend:** React 18+, Vite, TypeScript, Tailwind CSS v4, Lucide React icons.
- **AI Model:** Google Gemini 3.8 Flash (`gemini-3.8-flash`) with resilient analytical engineering engines.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Python 3.9 or higher (Python 3.14 verified)
- Node.js 18+ and npm

### 2. Backend Setup
```bash
cd backend

# Create virtual environment (optional)
python -m venv venv
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Configure .env file
# Ensure GOOGLE_API_KEY is defined in .env:
# GOOGLE_API_KEY=your_key_here
# GEMINI_MODEL=gemini-3.8-flash

# Start FastAPI Server
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```
The interactive Swagger API documentation will be available at: `http://127.0.0.1:8000/docs`

### 3. Frontend Setup
```bash
cd frontend

# Install node dependencies
npm install

# Run Vite development server
npm run dev
```
Open `http://localhost:5173` in your browser.

### Deploy to Render and Streamlit Community Cloud

**You do not need a second GitHub repository, and you do not need to upload folders or files manually.** Push the whole project, including `streamlit_app.py`, to this one GitHub repository. Then create two separate hosted services from that same repository:

- Render runs the **FastAPI backend** from `backend/main.py`.
- Streamlit Community Cloud runs the **Streamlit frontend** from the root-level `streamlit_app.py`.

#### 1. Push the project to GitHub

Commit and push the project changes to the GitHub repository you want to deploy. Make sure `render.yaml`, the root `requirements.txt`, and `streamlit_app.py` are included. Never commit `.env` files or API keys.

#### 2. Deploy the FastAPI backend on Render

1. Sign in to Render and choose **New → Blueprint**.
2. Connect the **same GitHub repository** that contains this project and select the branch to deploy.
3. Render will read the root-level `render.yaml` and create the `buildintel-api` web service. Leave its root directory at the repository root; the configured commands install `backend/requirements.txt` and start `backend.main:app`.
4. In the service's **Environment** settings, add `GOOGLE_API_KEY` with your active Gemini API key. Add it as a secret/private environment variable; do not put it in GitHub or in `render.yaml`.
5. Deploy the service. When it is live, copy its public service URL, for example `https://buildintel-api.onrender.com`.
6. Confirm the backend responds by opening `https://<your-render-service-url>/api/health`. Keep the base URL (without `/api/health`) for the next step.

#### 3. Deploy the Streamlit frontend on Streamlit Community Cloud

1. Sign in to [Streamlit Community Cloud](https://share.streamlit.io/) and choose **Create app**.
2. Select the **same GitHub repository and branch** used above.
3. Set **Main file path** to `streamlit_app.py` (it is at the repository root, not inside `backend` or `frontend`).
4. Open **Advanced settings** before deploying. Add this to the **Secrets** field, replacing the example URL with the Render URL copied above:

   ```toml
   API_BASE_URL = "https://your-api-service.onrender.com"
   ```

5. Choose **Deploy**. Streamlit Community Cloud will install the root `requirements.txt` and start `streamlit_app.py`.
6. Open the Streamlit app. Use **Check API connection** in the sidebar. If the check succeeds, the Streamlit frontend is connected to your Render backend.

If you prefer, you can enter the Render API URL directly in the Streamlit app sidebar instead of setting `API_BASE_URL` in Streamlit secrets.

#### Local development

Install dependencies from the repository root with `pip install -r requirements.txt`. In one terminal, start FastAPI with `uvicorn backend.main:app --host 127.0.0.1 --port 8000`; in another, run `streamlit run streamlit_app.py`. Enter `http://localhost:8000` in the app's **FastAPI base URL** sidebar field. Set `GOOGLE_API_KEY` in your local environment if you want to enable Gemini features.

---

## 🧪 Automated Testing & Validation

Run the test suite covering all API endpoints, edge cases, and data contracts:
```bash
python -m pytest backend/tests/test_api.py -v
```

---

## 📋 Strict JSON Data Contracts
All AI endpoints enforce typed Pydantic models with validated fields:
- `POST /api/safety/analyze` -> `SafetyAnalysisResponse`
- `POST /api/crack/analyze` -> `CrackAnalysisResponse`
- `POST /api/planner/estimate` -> `PlannerEstimateResponse`
- `POST /api/valuation/appraise` -> `ValuationResponse`
- `POST /api/daily-site/report` -> `DailySiteReportResponse`
- `POST /api/weather/advisory` -> `WeatherAdvisoryResponse`
- `POST /api/knowledge/chat` -> `KnowledgeQueryResponse`

---

## ⚠️ Engineering Disclaimers & Known Limitations
- BuildIntel AI generates decision-support intelligence. Final structural modifications, shoring interventions, and high-risk lifting authorizations must be ratified by a licensed Professional Engineer (PE) or designated Site Competent Person.
- In low-bandwidth or offline scenarios, the platform automatically engages its internal analytical engineering engine to ensure uninterrupted operations.
