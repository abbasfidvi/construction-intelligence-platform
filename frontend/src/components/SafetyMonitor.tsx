import React, { useState } from 'react';
import {
  Upload,
  AlertOctagon,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  FileText,
  Sparkles,
  Maximize2
} from 'lucide-react';
import { SafetyAnalysisResponse } from '../types';
import { analyzeSafety } from '../services/api';

interface SafetyMonitorProps {
  sampleData?: any;
}

export const SafetyMonitor: React.FC<SafetyMonitorProps> = ({ sampleData }) => {
  const [imagePreview, setImagePreview] = useState<string>('');
  const [location, setLocation] = useState<string>('Zone A - 12th Floor Perimeter Framing');
  const [phase, setPhase] = useState<string>('Structural Framing');
  const [weatherContext, setWeatherContext] = useState<string>('Clear / Daylight');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<SafetyAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedHazardId, setSelectedHazardId] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const loadSample = () => {
    if (sampleData?.safety_sample) {
      setImagePreview(sampleData.safety_sample.image_base64 || '');
      setLocation(sampleData.safety_sample.site_location || 'Zone A - 12th Floor Perimeter Framing');
      setPhase(sampleData.safety_sample.project_phase || 'Structural Framing');
      setWeatherContext(sampleData.safety_sample.weather_context || 'Clear / Daylight');
      setNotes(sampleData.safety_sample.notes || '');
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeSafety({
        image_base64: imagePreview || undefined,
        site_location: location,
        project_phase: phase,
        weather_context: weatherContext,
        notes: notes,
      });
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'HIGH':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'MEDIUM':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      default:
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white">Site Safety & PPE Compliance Monitor</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Multimodal visual inspection detecting fall hazards, scaffolding defects, missing PPE, and OSHA 1926 code breaches.
          </p>
        </div>

        <button
          onClick={loadSample}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-amber-400 border border-amber-500/30 text-xs font-semibold transition"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Load Active Site Inspection Sample</span>
        </button>
      </div>

      {/* Input Configuration & Upload Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Image Upload & Visual Canvas Preview */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              1. Site Photograph / Inspection Feed
            </span>

            <div className="mt-3 relative">
              {imagePreview ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950 group">
                  <img
                    src={imagePreview}
                    alt="Site Inspection Preview"
                    className="w-full h-72 object-contain bg-slate-950"
                  />

                  {/* Visual Overlay of Hazard Boxes if Result Available */}
                  {result &&
                    result.detected_hazards.map((h, idx) => {
                      if (!h.box_coordinates || h.box_coordinates.length !== 4) return null;
                      const [ymin, xmin, ymax, xmax] = h.box_coordinates;
                      const isSelected = selectedHazardId === h.id;
                      return (
                        <div
                          key={h.id || idx}
                          onClick={() => setSelectedHazardId(h.id)}
                          style={{
                            top: `${ymin}%`,
                            left: `${xmin}%`,
                            width: `${xmax - xmin}%`,
                            height: `${ymax - ymin}%`,
                          }}
                          className={`absolute cursor-pointer border-2 transition-all ${
                            isSelected
                              ? 'border-red-400 bg-red-500/30 shadow-lg shadow-red-500/40 ring-2 ring-red-400'
                              : 'border-amber-400/80 bg-amber-500/15 hover:bg-amber-500/25'
                          }`}
                        >
                          <span className="absolute -top-5 left-0 text-[10px] bg-slate-900/90 text-amber-300 font-mono px-1.5 py-0.5 rounded border border-amber-500/40 font-bold whitespace-nowrap">
                            #{idx + 1} {h.hazard_type.slice(0, 16)}...
                          </span>
                        </div>
                      );
                    })}

                  <button
                    onClick={() => setImagePreview('')}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-900/80 hover:bg-red-500/80 text-white text-xs transition"
                  >
                    Clear Photo
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition bg-slate-950/40 hover:bg-slate-900/40">
                  <Upload className="w-10 h-10 text-slate-500 mb-3" />
                  <span className="text-xs font-semibold text-slate-300">
                    Click to browse or drop site inspection photo
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1">
                    Supports high-resolution JPG, PNG, WEBP (up to 25MB)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Visual Bounding Box Mapping: Active</span>
            <span className="text-amber-400/80 font-mono">OSHA 1926 Standard</span>
          </div>
        </div>

        {/* Right: Inspection Parameters & Trigger */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              2. Field Metadata & Context
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Site Section / Zone
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  placeholder="e.g. Zone A - 12th Floor Perimeter"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Project Phase
                </label>
                <select
                  value={phase}
                  onChange={(e) => setPhase(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Excavation & Trenching">Excavation & Trenching</option>
                  <option value="Substructure & Footings">Substructure & Footings</option>
                  <option value="Structural Framing">Structural Framing</option>
                  <option value="MEP & Enclosure">MEP & Enclosure</option>
                  <option value="Interior Finishing">Interior Finishing</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Weather / Ambient Lighting
                </label>
                <input
                  type="text"
                  value={weatherContext}
                  onChange={(e) => setWeatherContext(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  placeholder="e.g. Daylight, Dry, Wind 14 km/h"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Inspector Observation
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  placeholder="e.g. Check tie-off compliance on deck"
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            {error && (
              <div className="mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
                <AlertOctagon className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 transition cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Scanning Multimodal Visual Feeds...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Execute AI Safety & PPE Inspection</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Results Display */}
      {result && (
        <div className="space-y-6 animate-fadeIn">
          {/* KPI Dashboard Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Overall Safety Score
              </span>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className={`text-3xl font-extrabold ${result.safety_score >= 80 ? 'text-emerald-400' : result.safety_score >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                  {result.safety_score}
                </span>
                <span className="text-xs text-slate-500">/ 100</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Site compliance rating</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Site Risk Level
              </span>
              <div className="mt-2">
                <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold border ${getRiskColor(result.overall_risk_level)}`}>
                  {result.overall_risk_level}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">OSHA classification</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                PPE Compliance Rate
              </span>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-blue-400">
                  {result.ppe_compliance.overall_compliance_rate.toFixed(1)}%
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                {result.ppe_compliance.workers_fully_compliant} of {result.ppe_compliance.workers_detected} workers fully protected
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Hazards Identified
              </span>
              <div className="mt-2 flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold text-amber-400">
                  {result.detected_hazards.length}
                </span>
                <span className="text-xs text-slate-500">active alerts</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Requires supervisor action</p>
            </div>
          </div>

          {/* Executive Overview */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Inspector Executive Summary
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {result.summary}
            </p>
          </div>

          {/* Detected Hazards & PPE Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Hazards List */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                  <AlertOctagon className="w-4 h-4 text-amber-400" />
                  <span>Detected Hazards & Violations ({result.detected_hazards.length})</span>
                </h3>
                <span className="text-[10px] text-slate-500">Click a hazard to highlight</span>
              </div>

              <div className="space-y-3">
                {result.detected_hazards.map((hazard, idx) => {
                  const isSelected = selectedHazardId === hazard.id;
                  return (
                    <div
                      key={hazard.id || idx}
                      onClick={() => setSelectedHazardId(isSelected ? null : hazard.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono font-bold text-amber-400">
                            #{idx + 1}
                          </span>
                          <span className="text-xs font-bold text-white">
                            {hazard.hazard_type}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getRiskColor(hazard.severity)}`}>
                          {hazard.severity}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        {hazard.description}
                      </p>

                      <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                        <span className="text-slate-400">
                          Violation: <span className="font-mono text-amber-400 font-semibold">{hazard.standard_violation}</span>
                        </span>
                        <span className="text-red-400 font-medium">
                          Immediate: {hazard.immediate_action}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PPE Breakdown */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-blue-400" />
                <span>PPE Compliance Verification</span>
              </h3>

              <div className="space-y-2.5">
                {result.ppe_compliance.items_inspected.map((ppe, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        {ppe.status === 'COMPLIANT' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : ppe.status === 'NON_COMPLIANT' ? (
                          <XCircle className="w-4 h-4 text-red-400" />
                        ) : (
                          <span className="w-4 h-4 rounded-full bg-slate-700 inline-block" />
                        )}
                        <span className="text-xs font-semibold text-slate-200">{ppe.item}</span>
                      </div>
                      {ppe.notes && (
                        <p className="text-[10px] text-slate-500 mt-1 pl-6">{ppe.notes}</p>
                      )}
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        ppe.status === 'COMPLIANT'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : ppe.status === 'NON_COMPLIANT'
                          ? 'bg-red-500/10 text-red-400 border-red-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {ppe.status}
                    </span>
                  </div>
                ))}
              </div>

              {/* Regulatory Standards Banner */}
              <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
                <span className="text-slate-300 font-semibold block">Regulatory References Cited:</span>
                <ul className="list-disc list-inside space-y-0.5 text-[10px] text-slate-400 font-mono">
                  {result.regulatory_citations.map((cite, i) => (
                    <li key={i} className="truncate">{cite}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Corrective Action Plan Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-orange-400" />
              <span>Recommended Corrective Action Plan</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 text-[11px] uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Step</th>
                    <th className="pb-3 font-semibold">Priority</th>
                    <th className="pb-3 font-semibold">Corrective Action Required</th>
                    <th className="pb-3 font-semibold">Responsible Role</th>
                    <th className="pb-3 font-semibold">Target Timeframe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {result.corrective_action_plan.map((act) => (
                    <tr key={act.step_number} className="text-slate-300 hover:bg-slate-800/30">
                      <td className="py-3 font-mono text-amber-400 font-bold">{act.step_number}</td>
                      <td className="py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          act.priority === 'IMMEDIATE'
                            ? 'bg-red-500/10 text-red-400 border-red-500/30'
                            : act.priority === 'TODAY'
                            ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}>
                          {act.priority}
                        </span>
                      </td>
                      <td className="py-3 font-medium text-white">{act.action}</td>
                      <td className="py-3 text-slate-400">{act.responsible_role}</td>
                      <td className="py-3 font-mono text-[11px] text-amber-400/90">{act.target_timeframe}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
