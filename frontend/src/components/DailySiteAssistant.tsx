import React, { useState } from 'react';
import {
  ClipboardList,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Download,
  Truck,
  Wrench,
  FileText
} from 'lucide-react';
import { DailySiteReportResponse } from '../types';
import { generateDailyReport } from '../services/api';

interface DailySiteAssistantProps {
  sampleData?: any;
}

export const DailySiteAssistant: React.FC<DailySiteAssistantProps> = ({ sampleData }) => {
  const [reportDate, setReportDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [projectName, setProjectName] = useState<string>('Skyline Apex Tower - Phase III');
  const [siteLocation, setSiteLocation] = useState<string>('West Core Grid C4-E8');
  const [weatherSummary, setWeatherSummary] = useState<string>('Sunny, 28°C, Wind 16 km/h');
  const [totalWorkers, setTotalWorkers] = useState<number>(62);
  const [workCompleted, setWorkCompleted] = useState<string>(
    'Poured 160 m³ slab on Level 9. Erected formwork for North shear walls. Installed electrical conduits for Zone 3 lighting.'
  );
  const [delays, setDelays] = useState<string>(
    'Minor 30-min delay on second mixer truck due to highway resurfacing. Zero injuries.'
  );

  const [equipmentList, setEquipmentList] = useState<string[]>([
    'Tower Crane Potain MDT 219',
    'Schwing Concrete Boom Pump 38m',
    'CAT Mini-Excavator 305',
    'Passenger Hoist',
  ]);

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<DailySiteReportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadSample = () => {
    if (sampleData?.site_daily_sample) {
      setReportDate(sampleData.site_daily_sample.report_date || new Date().toISOString().split('T')[0]);
      setProjectName(sampleData.site_daily_sample.project_name || 'Skyline Apex Tower - Phase III');
      setSiteLocation(sampleData.site_daily_sample.site_location || 'West Core Grid C4-E8');
      setWeatherSummary(sampleData.site_daily_sample.weather_summary || 'Sunny, 28°C, Wind 16 km/h');
      setTotalWorkers(sampleData.site_daily_sample.total_workers_on_site || 62);
      setWorkCompleted(sampleData.site_daily_sample.work_completed_today || '');
      setDelays(sampleData.site_daily_sample.delays_or_incidents || '');
      setEquipmentList(sampleData.site_daily_sample.equipment_operating || equipmentList);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await generateDailyReport({
        report_date: reportDate,
        project_name: projectName,
        site_location: siteLocation,
        weather_summary: weatherSummary,
        total_workers_on_site: totalWorkers,
        trades: [
          { trade: 'Carpentry & Formwork', headcount: 16, shift: 'Day Shift', productivity_rating: 'HIGH' },
          { trade: 'Rebar Bending & Fixing', headcount: 18, shift: 'Day Shift', productivity_rating: 'HIGH' },
          { trade: 'Concrete Pumping & Finishing', headcount: 12, shift: 'Day Shift', productivity_rating: 'NORMAL' },
          { trade: 'MEP & Electrical', headcount: 10, shift: 'Day Shift', productivity_rating: 'HIGH' },
          { trade: 'General Labor & Housekeeping', headcount: 6, shift: 'Day Shift', productivity_rating: 'HIGH' },
        ],
        equipment_operating: equipmentList,
        work_completed_today: workCompleted,
        delays_or_incidents: delays,
      });
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Report generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!result) return;
    const blob = new Blob([result.ready_for_export_pdf_markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Daily_Report_${reportDate}_${projectName.replace(/\s+/g, '_')}.md`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <ClipboardList className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white">Daily Field Log Assistant & Site Intelligence</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automates daily operations reporting, trade productivity scoring, blocker tracking, and shift handovers.
          </p>
        </div>

        <button
          onClick={loadSample}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-purple-400 border border-purple-500/30 text-xs font-semibold transition"
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Load Active Field Log Sample</span>
        </button>
      </div>

      {/* Input Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Daily Field Log Entry
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Log Date
            </label>
            <input
              type="date"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Project Name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Active Zone / Section
            </label>
            <input
              type="text"
              value={siteLocation}
              onChange={(e) => setSiteLocation(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Total Workforce on Site
            </label>
            <input
              type="number"
              min="1"
              max="2000"
              value={totalWorkers}
              onChange={(e) => setTotalWorkers(parseInt(e.target.value) || 1)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Work Completed Today
            </label>
            <textarea
              rows={3}
              value={workCompleted}
              onChange={(e) => setWorkCompleted(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 leading-relaxed"
              placeholder="e.g. Completed level 9 slab pour, formwork erection..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Delays, Material Bottlenecks & Safety Notes
            </label>
            <textarea
              rows={3}
              value={delays}
              onChange={(e) => setDelays(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 leading-relaxed"
              placeholder="e.g. Transit mixer delayed 30 mins. Zero safety incidents."
            />
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-400 hover:to-violet-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-purple-500/20 disabled:opacity-50 transition cursor-pointer"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Analyzing Field Performance & Compiling Brief...</span>
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              <span>Compile Executive Daily Field Report</span>
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
                Productivity Score
              </span>
              <div className="mt-2 flex items-baseline space-x-1.5">
                <span className={`text-3xl font-extrabold ${result.site_productivity_score >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {result.site_productivity_score}
                </span>
                <span className="text-xs text-slate-500">/ 100</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Output efficiency index</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Milestone Pace
              </span>
              <div className="mt-2 text-sm font-bold text-white truncate">
                {result.milestone_pace}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Baseline schedule adherence</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Active Workforce
              </span>
              <div className="mt-2 flex items-baseline space-x-1.5">
                <span className="text-3xl font-extrabold text-purple-400">
                  {Object.values(result.labor_analytics).reduce((a, b) => a + b, 0)}
                </span>
                <span className="text-xs text-slate-500">workers</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Across 5 specialized trades</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Active Blockers
              </span>
              <div className="mt-2 flex items-baseline space-x-1.5">
                <span className={`text-3xl font-extrabold ${result.identified_risks_and_blockers.length > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {result.identified_risks_and_blockers.length}
                </span>
                <span className="text-xs text-slate-500">bottlenecks</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Mitigations assigned</p>
            </div>
          </div>

          {/* Executive Overview */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Executive Field Summary ({result.report_date})
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
                {result.executive_overview}
              </p>
            </div>

            <button
              onClick={downloadReport}
              className="shrink-0 flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition"
            >
              <Download className="w-4 h-4" />
              <span>Download Report (MD)</span>
            </button>
          </div>

          {/* Trade Labor Distribution & Blockers Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Labor Distribution */}
            <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span>Trade Labor Allocation</span>
              </h3>

              <div className="space-y-2.5">
                {Object.entries(result.labor_analytics).map(([trade, count]) => {
                  const total = Object.values(result.labor_analytics).reduce((a, b) => a + b, 0);
                  const pct = Math.round((count / (total || 1)) * 100);
                  return (
                    <div key={trade} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200">{trade}</span>
                        <span className="font-mono text-purple-400 font-bold">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-purple-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Blockers & Mitigations */}
            <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Identified Bottlenecks & Required Actions</span>
              </h3>

              <div className="space-y-3">
                {result.identified_risks_and_blockers.map((b, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{b.title}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded border text-amber-400 bg-amber-500/10 border-amber-500/30">
                        Delay: {b.impact_delay_hours}h
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{b.cause}</p>
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-emerald-400">Action: {b.recommended_mitigation}</span>
                      <span className="text-slate-500 font-medium">Owner: {b.owner}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Shift Directives (Next 24 Hours) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Next Shift Directives (24-Hour Lookahead)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {result.next_shift_directives.map((directive, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start space-x-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span className="text-slate-300 leading-relaxed">{directive}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
