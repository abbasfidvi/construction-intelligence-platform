// Types matching backend Pydantic contracts

export interface DetectedHazard {
  id: string;
  hazard_type: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  location_in_image: string;
  description: string;
  standard_violation: string;
  immediate_action: string;
  box_coordinates?: [number, number, number, number] | null;
}

export interface PPEItemStatus {
  item: string;
  status: 'COMPLIANT' | 'NON_COMPLIANT' | 'NOT_VISIBLE';
  workers_observed: number;
  workers_compliant: number;
  notes: string;
}

export interface PPEComplianceReport {
  overall_compliance_rate: number;
  workers_detected: number;
  workers_fully_compliant: number;
  items_inspected: PPEItemStatus[];
}

export interface CorrectiveAction {
  step_number: number;
  priority: 'IMMEDIATE' | 'TODAY' | 'NEXT_SHIFT' | 'WITHIN_WEEK';
  action: string;
  responsible_role: string;
  target_timeframe: string;
}

export interface SafetyAnalysisResponse {
  overall_risk_level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  safety_score: number;
  summary: string;
  detected_hazards: DetectedHazard[];
  ppe_compliance: PPEComplianceReport;
  corrective_action_plan: CorrectiveAction[];
  regulatory_citations: string[];
  inspection_timestamp: string;
  annotated_zones_count: number;
}

export interface ProbableCause {
  cause: string;
  probability_percent: number;
  explanation: string;
}

export interface RepairMethod {
  method_name: string;
  suitability: string;
  estimated_cost_usd: string;
  durability_years: string;
  materials_required: string[];
  step_by_step_procedure: string[];
}

export interface CrackClassification {
  primary_type: string;
  estimated_width_mm: number;
  width_category: string;
  propagation_pattern: string;
  structural_significance: string;
  depth_indicator: string;
}

export interface CrackSeverityAssessment {
  severity_score: number;
  urgency_level: 'CRITICAL_EVACUATION' | 'URGENT_SHORING' | 'REPAIR_SOON' | 'MONITOR_PERIODICALLY';
  risk_of_structural_failure: 'HIGH' | 'MEDIUM' | 'LOW' | 'NEGLIGIBLE';
  recommended_reinspection_days: number;
}

export interface MonitoringProtocol {
  recommended_sensors: string[];
  monitoring_frequency: string;
  displacement_threshold_alert: string;
}

export interface CrackAnalysisResponse {
  crack_detected: boolean;
  summary: string;
  classification: CrackClassification;
  severity: CrackSeverityAssessment;
  probable_causes: ProbableCause[];
  recommended_repairs: RepairMethod[];
  monitoring_protocol: MonitoringProtocol;
  compliance_codes: string[];
  analysis_timestamp: string;
}

export interface MaterialItem {
  category: string;
  item_name: string;
  quantity: number;
  unit: string;
  unit_rate_usd: number;
  total_cost_usd: number;
  specifications: string;
}

export interface GanttTask {
  task_id: string;
  task_name: string;
  start_week: number;
  duration_weeks: number;
  end_week: number;
  phase: string;
  critical_path: boolean;
  dependencies: string[];
  progress_percent: number;
  assigned_crew: string;
}

export interface CostBreakdown {
  materials_cost_usd: number;
  labor_cost_usd: number;
  equipment_and_machinery_cost_usd: number;
  architectural_and_permits_usd: number;
  contingency_reserve_usd: number;
  total_estimated_budget_usd: number;
  cost_per_sqft_usd: number;
}

export interface PlannerEstimateResponse {
  project_type: string;
  built_up_area_sqft: number;
  floors: number;
  total_duration_weeks: number;
  cost_breakdown: CostBreakdown;
  bill_of_materials: MaterialItem[];
  schedule_gantt: GanttTask[];
  architectural_insights: string[];
  value_engineering_tips: string[];
  generated_timestamp: string;
}

export interface ValuationSummary {
  estimated_market_value_usd: number;
  valuation_range_min_usd: number;
  valuation_range_max_usd: number;
  price_per_sqft_usd: number;
  confidence_score_percent: number;
}

export interface ReplacementCostAnalysis {
  land_value_usd: number;
  replacement_cost_new_usd: number;
  accumulated_depreciation_usd: number;
  depreciated_structure_value_usd: number;
  indicated_value_by_cost_approach_usd: number;
  depreciation_rate_annual_percent: number;
}

export interface FinancialMetrics {
  potential_annual_rental_income_usd: number;
  estimated_monthly_rent_usd: number;
  gross_rental_yield_percent: number;
  capitalization_rate_percent: number;
  projected_5yr_appreciation_percent: number;
  payback_period_years: number;
}

export interface ValuationFactor {
  factor_name: string;
  impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  adjustment_percentage: number;
  description: string;
}

export interface ValuationResponse {
  property_type: string;
  city_and_submarket: string;
  valuation_summary: ValuationSummary;
  replacement_cost_method: ReplacementCostAnalysis;
  financial_metrics: FinancialMetrics;
  key_drivers_and_adjustments: ValuationFactor[];
  investment_recommendation: string;
  rationale: string;
  comparable_benchmark_sales: Array<{
    property_name: string;
    sale_price_usd: number;
    price_per_sqft: number;
    sale_date: string;
    similarity_index: string;
  }>;
  appraisal_timestamp: string;
}

export interface BlockerItem {
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  cause: string;
  impact_delay_hours: number;
  recommended_mitigation: string;
  owner: string;
}

export interface DailySiteReportResponse {
  project_name: string;
  report_date: string;
  executive_overview: string;
  site_productivity_score: number;
  milestone_pace: string;
  labor_analytics: Record<string, number>;
  completed_milestones_verified: string[];
  identified_risks_and_blockers: BlockerItem[];
  safety_compliance_check: string;
  next_shift_directives: string[];
  ready_for_export_pdf_markdown: string;
}

export interface PourSuitability {
  status: 'OPTIMAL' | 'CAUTION' | 'PROHIBITED';
  suitability_score: number;
  plastic_shrinkage_cracking_risk: 'LOW' | 'MODERATE' | 'CRITICAL';
  curing_protocol_adjustments: string[];
  max_allowable_slump_retention_minutes: number;
}

export interface CraneSafety {
  safe_to_operate: boolean;
  current_wind_speed_kmh: number;
  max_safe_wind_speed_kmh: number;
  wind_gust_risk: string;
  derating_factor_percent: number;
  boom_guidelines: string;
}

export interface WeatherAdvisoryResponse {
  site_advisory_level: 'GREEN_NORMAL' | 'YELLOW_CAUTION' | 'ORANGE_RESTRICTED' | 'RED_SUSPENSION';
  overall_guidance: string;
  temperature_heat_index: string;
  pour_suitability: PourSuitability;
  crane_and_rigging: CraneSafety;
  earthworks_and_excavation_risk: string;
  heat_stress_regime: string;
  scheduled_task_recommendations: Array<{
    task: string;
    status: string;
    guidance?: string;
    time_window?: string;
  }>;
  twenty_four_hour_outlook: Array<{
    time: string;
    temp_c: number;
    rain_prob: number;
    wind_kmh: number;
    condition: string;
  }>;
}

export interface KnowledgeQueryResponse {
  reply: string;
  referenced_codes_and_standards: string[];
  suggested_followup_topics: string[];
  confidence_level: string;
}
