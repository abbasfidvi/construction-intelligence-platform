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
