import React, { useState } from 'react';
import {
  CalendarDays,
  DollarSign,
  TrendingUp,
  Clock,
  Layers,
  Sparkles,
  Download,
  AlertCircle,
  Building,
  CheckCircle2
} from 'lucide-react';
import { PlannerEstimateResponse } from '../types';
import { estimateProjectPlan } from '../services/api';

interface ProjectPlannerProps {
  sampleData?: any;
}

export const ProjectPlanner: React.FC<ProjectPlannerProps> = ({ sampleData }) => {
  const [projectType, setProjectType] = useState<string>('Commercial Complex');
  const [builtUpArea, setBuiltUpArea] = useState<number>(35000);
  const [floors, setFloors] = useState<number>(5);
  const [qualityTier, setQualityTier] = useState<string>('Standard / Premium');
  const [targetDuration, setTargetDuration] = useState<number>(16);
  const [locationTier, setLocationTier] = useState<string>('Tier 1 Metro');
  const [soilCondition, setSoilCondition] = useState<string>('Medium Clay / Stable');
  const [sustainability, setSustainability] = useState<string>('LEED Gold / Energy Efficient');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<PlannerEstimateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const loadSample = () => {
    if (sampleData?.planner_sample) {
      setProjectType(sampleData.planner_sample.project_type || 'Commercial Complex');
      setBuiltUpArea(sampleData.planner_sample.built_up_area_sqft || 45000);
      setFloors(sampleData.planner_sample.floors || 6);
      setQualityTier(sampleData.planner_sample.quality_tier || 'Standard / Premium');
      setTargetDuration(sampleData.planner_sample.target_duration_months || 18);
      setLocationTier(sampleData.planner_sample.location_tier || 'Tier 1 Metro');
      setSoilCondition(sampleData.planner_sample.soil_condition || 'Medium Clay / Stable');
      setSustainability(sampleData.planner_sample.sustainability_target || 'LEED Gold / Energy Efficient');
    }
  };

  const handleEstimate = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await estimateProjectPlan({
        project_type: projectType,
        built_up_area_sqft: builtUpArea,
        floors: floors,
        quality_tier: qualityTier,
        target_duration_months: targetDuration,
        location_tier: locationTier,
        soil_condition: soilCondition,
        sustainability_target: sustainability,
      });
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Estimation failed.');
    } finally {
      setLoading(false);
    }
  };

  const categories = result
    ? ['ALL', ...Array.from(new Set(result.bill_of_materials.map((m) => m.category)))]
    : ['ALL'];

  const filteredBOM = result
    ? filterCategory === 'ALL'
      ? result.bill_of_materials
      : result.bill_of_materials.filter((m) => m.category === filterCategory)
    : [];

  const exportCSV = () => {
    if (!result) return;
    const headers = 'Category,Item,Quantity,Unit,Unit Rate (USD),Total Cost (USD),Specifications\n';
    const rows = result.bill_of_materials
      .map(
        (m) =>
          `"${m.category}","${m.item_name}",${m.quantity},"${m.unit}",${m.unit_rate_usd},${m.total_cost_usd},"${m.specifications}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Bill_of_Materials_${projectType.replace(/\s+/g, '_')}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <CalendarDays className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white">Project Planner & Material Estimator</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated Bill of Quantities (BOM), itemized cost estimation, and Critical Path Gantt schedule sequencing.
          </p>
        </div>

        <button
          onClick={loadSample}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-blue-400 border border-blue-500/30 text-xs font-semibold transition"
        >
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span>Load 6-Story Commercial Complex Preset</span>
        </button>
      </div>

      {/* Input Parameters Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Project Specification Parameters
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Project Type
            </label>
            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="Residential Villa">Residential Villa</option>
              <option value="Multi-Family Apartment">Multi-Family Apartment</option>
              <option value="Commercial Complex">Commercial Complex</option>
              <option value="Industrial Warehouse">Industrial Warehouse</option>
              <option value="Infrastructure">Infrastructure</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Gross Built-up Area (sq.ft.)
            </label>
            <input
              type="number"
              min="500"
              max="2000000"
              step="500"
              value={builtUpArea}
              onChange={(e) => setBuiltUpArea(parseFloat(e.target.value) || 1000)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Number of Stories / Floors
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={floors}
              onChange={(e) => setFloors(parseInt(e.target.value) || 1)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Specification Quality Tier
            </label>
            <select
              value={qualityTier}
              onChange={(e) => setQualityTier(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="Economy / Budget">Economy / Budget</option>
              <option value="Standard / Premium">Standard / Premium</option>
              <option value="Luxury / High-End">Luxury / High-End</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Target Duration (Months)
            </label>
            <input
              type="number"
              min="3"
              max="60"
              value={targetDuration}
              onChange={(e) => setTargetDuration(parseInt(e.target.value) || 6)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Location Tier
            </label>
            <select
              value={locationTier}
              onChange={(e) => setLocationTier(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="Tier 1 Metro">Tier 1 Metro</option>
              <option value="Tier 2 City">Tier 2 City</option>
              <option value="Suburban">Suburban</option>
              <option value="Rural / Remote">Rural / Remote</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Subsurface Soil Profile
            </label>
            <select
              value={soilCondition}
              onChange={(e) => setSoilCondition(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="Medium Clay / Stable">Medium Clay / Stable</option>
              <option value="Sandy / High Water Table">Sandy / High Water Table</option>
              <option value="Dense Hard Rock">Dense Hard Rock</option>
              <option value="Soft Organic Clay">Soft Organic Clay</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Sustainability Rating
            </label>
            <select
              value={sustainability}
              onChange={(e) => setSustainability(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="Standard Building Code">Standard Building Code</option>
              <option value="LEED Gold / Energy Efficient">LEED Gold / Energy Efficient</option>
              <option value="Net-Zero Ready">Net-Zero Ready</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleEstimate}
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/20 disabled:opacity-50 transition cursor-pointer"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Calculating Quantities, Budget & Critical Path...</span>
            </>
          ) : (
            <>
              <DollarSign className="w-4 h-4" />
              <span>Generate Bill of Quantities & Project Schedule</span>
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Total Estimated Budget
              </span>
              <div className="mt-2 text-2xl font-extrabold text-blue-400">
                ${result.cost_breakdown.total_estimated_budget_usd.toLocaleString()}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">All trades inclusive</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Cost Per Square Foot
              </span>
              <div className="mt-2 flex items-baseline space-x-1">
                <span className="text-2xl font-extrabold text-white">
                  ${result.cost_breakdown.cost_per_sqft_usd.toFixed(2)}
                </span>
                <span className="text-xs text-slate-500">/ sq.ft.</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">{result.project_type} base</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Execution Timeline
              </span>
              <div className="mt-2 flex items-baseline space-x-1">
                <span className="text-2xl font-extrabold text-amber-400">
                  {result.total_duration_weeks}
                </span>
                <span className="text-xs text-slate-500">weeks</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">~{(result.total_duration_weeks / 4.3).toFixed(1)} calendar months</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Contingency Reserve
              </span>
              <div className="mt-2 text-2xl font-extrabold text-emerald-400">
                ${result.cost_breakdown.contingency_reserve_usd.toLocaleString()}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Risk buffer (10%)</p>
            </div>
          </div>

          {/* Cost Allocation Breakdown Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Itemized Cost Allocation
            </h3>

            <div className="w-full bg-slate-950 h-6 rounded-xl overflow-hidden flex border border-slate-800">
              <div
                style={{ width: `${(result.cost_breakdown.materials_cost_usd / result.cost_breakdown.total_estimated_budget_usd) * 100}%` }}
                className="bg-blue-500 h-full flex items-center justify-center text-[10px] font-bold text-slate-950 px-1"
                title={`Materials: $${result.cost_breakdown.materials_cost_usd.toLocaleString()}`}
              >
                Materials
              </div>
              <div
                style={{ width: `${(result.cost_breakdown.labor_cost_usd / result.cost_breakdown.total_estimated_budget_usd) * 100}%` }}
                className="bg-amber-500 h-full flex items-center justify-center text-[10px] font-bold text-slate-950 px-1"
                title={`Labor: $${result.cost_breakdown.labor_cost_usd.toLocaleString()}`}
              >
                Labor
              </div>
              <div
                style={{ width: `${(result.cost_breakdown.equipment_and_machinery_cost_usd / result.cost_breakdown.total_estimated_budget_usd) * 100}%` }}
                className="bg-indigo-500 h-full flex items-center justify-center text-[10px] font-bold text-white px-1"
                title={`Equipment: $${result.cost_breakdown.equipment_and_machinery_cost_usd.toLocaleString()}`}
              >
                Plant
              </div>
              <div
                style={{ width: `${(result.cost_breakdown.architectural_and_permits_usd / result.cost_breakdown.total_estimated_budget_usd) * 100}%` }}
                className="bg-emerald-500 h-full flex items-center justify-center text-[10px] font-bold text-slate-950 px-1"
                title={`Permits: $${result.cost_breakdown.architectural_and_permits_usd.toLocaleString()}`}
              >
                Permits
              </div>
              <div
                style={{ width: `${(result.cost_breakdown.contingency_reserve_usd / result.cost_breakdown.total_estimated_budget_usd) * 100}%` }}
                className="bg-rose-500 h-full flex items-center justify-center text-[10px] font-bold text-white px-1"
                title={`Contingency: $${result.cost_breakdown.contingency_reserve_usd.toLocaleString()}`}
              >
                Risk
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs pt-2">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded bg-blue-500 shrink-0" />
                <span className="text-slate-400">Materials: <strong className="text-white">${result.cost_breakdown.materials_cost_usd.toLocaleString()}</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded bg-amber-500 shrink-0" />
                <span className="text-slate-400">Labor: <strong className="text-white">${result.cost_breakdown.labor_cost_usd.toLocaleString()}</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded bg-indigo-500 shrink-0" />
                <span className="text-slate-400">Equipment: <strong className="text-white">${result.cost_breakdown.equipment_and_machinery_cost_usd.toLocaleString()}</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded bg-emerald-500 shrink-0" />
                <span className="text-slate-400">Permits & Arch: <strong className="text-white">${result.cost_breakdown.architectural_and_permits_usd.toLocaleString()}</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded bg-rose-500 shrink-0" />
                <span className="text-slate-400">Contingency: <strong className="text-white">${result.cost_breakdown.contingency_reserve_usd.toLocaleString()}</strong></span>
              </div>
            </div>
          </div>

          {/* Interactive Gantt Chart */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>Project Master Schedule & Critical Path Sequencing</span>
              </h3>
              <span className="text-[10px] text-amber-400 font-mono font-semibold">
                Critical Path Tasks Highlighted
              </span>
            </div>

            <div className="space-y-3">
              {result.schedule_gantt.map((task) => {
                const totalW = Math.max(result.total_duration_weeks, 1);
                const leftPercent = Math.max(0, ((task.start_week - 1) / totalW) * 100);
                const widthPercent = Math.max(3, (task.duration_weeks / totalW) * 100);

                return (
                  <div key={task.task_id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-slate-500 font-bold">{task.task_id}</span>
                        <span className="font-bold text-white">{task.task_name}</span>
                        {task.critical_path && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30">
                            CRITICAL PATH
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center space-x-3">
                        <span>W{task.start_week} - W{task.end_week} ({task.duration_weeks} wks)</span>
                        <span className="text-blue-400 font-semibold">{task.assigned_crew}</span>
                      </div>
                    </div>

                    {/* Timeline bar */}
                    <div className="w-full bg-slate-900 h-3 rounded-full relative overflow-hidden">
                      <div
                        style={{
                          left: `${leftPercent}%`,
                          width: `${widthPercent}%`,
                        }}
                        className={`absolute top-0 bottom-0 rounded-full ${
                          task.critical_path
                            ? 'bg-gradient-to-r from-red-500 to-amber-500'
                            : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bill of Materials (BOM) Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Bill of Quantities / Materials Takeoff
                </h3>
              </div>

              <div className="flex items-center space-x-2">
                {/* Filter */}
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <button
                  onClick={exportCSV}
                  className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 text-[11px] uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Category</th>
                    <th className="pb-3 font-semibold">Item & Description</th>
                    <th className="pb-3 font-semibold text-right">Quantity</th>
                    <th className="pb-3 font-semibold">Unit</th>
                    <th className="pb-3 font-semibold text-right">Unit Rate ($)</th>
                    <th className="pb-3 font-semibold text-right">Total ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredBOM.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30 text-slate-300">
                      <td className="py-2.5 font-sans text-xs text-blue-400 font-medium">{item.category}</td>
                      <td className="py-2.5 font-sans">
                        <div className="text-xs font-semibold text-white">{item.item_name}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{item.specifications}</div>
                      </td>
                      <td className="py-2.5 text-right font-bold text-white">{item.quantity.toLocaleString()}</td>
                      <td className="py-2.5 text-slate-400 text-[11px]">{item.unit}</td>
                      <td className="py-2.5 text-right text-slate-300">${item.unit_rate_usd.toFixed(2)}</td>
                      <td className="py-2.5 text-right font-bold text-emerald-400">${item.total_cost_usd.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Architectural & Value Engineering Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center space-x-1.5">
                <Building className="w-4 h-4" />
                <span>Architectural & Structural Insights</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {result.architectural_insights.map((ins, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{ins}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
                <TrendingUp className="w-4 h-4" />
                <span>Value Engineering & Cost Optimization</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {result.value_engineering_tips.map((tip, i) => (
                  <li key={i} className="flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
