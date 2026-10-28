import {
  SafetyAnalysisResponse,
  CrackAnalysisResponse,
  PlannerEstimateResponse,
  ValuationResponse,
  DailySiteReportResponse,
  WeatherAdvisoryResponse,
  KnowledgeQueryResponse,
} from '../types';

const API_BASE = '/api';

export async function fetchHealth(): Promise<{ status: string; platform: string; ai_engine: string; ai_status: string }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
  return res.json();
}

export async function fetchSamplePresets(): Promise<any> {
  const res = await fetch(`${API_BASE}/sample-data`);
  if (!res.ok) throw new Error(`Failed to load sample presets: ${res.statusText}`);
  return res.json();
}

export async function analyzeSafety(payload: {
  image_base64?: string;
  site_location?: string;
  project_phase?: string;
  weather_context?: string;
  notes?: string;
}): Promise<SafetyAnalysisResponse> {
  const res = await fetch(`${API_BASE}/safety/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Safety analysis failed: ${res.statusText}`);
  return res.json();
}

export async function analyzeCrack(payload: {
  image_base64?: string;
  surface_material?: string;
  structural_element?: string;
  structure_age_years?: number;
  environment?: string;
  notes?: string;
}): Promise<CrackAnalysisResponse> {
  const res = await fetch(`${API_BASE}/crack/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Crack analysis failed: ${res.statusText}`);
  return res.json();
}

export async function estimateProjectPlan(payload: {
  project_type: string;
  built_up_area_sqft: number;
  floors: number;
  quality_tier: string;
  target_duration_months: number;
  location_tier: string;
  soil_condition?: string;
  sustainability_target?: string;
}): Promise<PlannerEstimateResponse> {
  const res = await fetch(`${API_BASE}/planner/estimate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Project planning failed: ${res.statusText}`);
  return res.json();
}

export async function appraiseRealEstate(payload: {
  property_type: string;
  plot_area_sqft: number;
  built_up_area_sqft: number;
  property_age_years: number;
  city_and_submarket: string;
  submarket_tier: string;
  construction_quality: string;
  construction_stage: string;
  amenities: string[];
  occupancy_rate_percent?: number;
}): Promise<ValuationResponse> {
  const res = await fetch(`${API_BASE}/valuation/appraise`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Valuation appraisal failed: ${res.statusText}`);
  return res.json();
}

export async function generateDailyReport(payload: {
  report_date: string;
  project_name: string;
  site_location: string;
  weather_summary: string;
  total_workers_on_site: number;
  trades: Array<{ trade: string; headcount: number; shift: string; productivity_rating: string }>;
  equipment_operating: string[];
  work_completed_today: string;
  delays_or_incidents?: string;
  photos_base64?: string[];
}): Promise<DailySiteReportResponse> {
  const res = await fetch(`${API_BASE}/daily-site/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Daily site reporting failed: ${res.statusText}`);
  return res.json();
}

export async function getLiveWeatherAdvisory(payload: {
  location: string;
  temperature_c: number;
  humidity_percent: number;
  rain_probability_percent: number;
  wind_speed_kmh: number;
  wind_gusts_kmh?: number;
  uv_index?: number;
}): Promise<WeatherAdvisoryResponse> {
  const res = await fetch(`${API_BASE}/weather/advisory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Weather advisory failed: ${res.statusText}`);
  return res.json();
}

export async function queryKnowledgeBot(payload: {
  query: string;
  conversation_history?: Array<{ role: string; content: string }>;
  image_base64?: string;
  engineering_domain?: string;
}): Promise<KnowledgeQueryResponse> {
  const res = await fetch(`${API_BASE}/knowledge/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Knowledge assistant failed: ${res.statusText}`);
  return res.json();
}
