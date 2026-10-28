import React, { useState } from 'react';
import {
  SearchCheck,
  Upload,
  AlertTriangle,
  Wrench,
  Activity,
  Layers,
  Sparkles,
  CheckCircle,
  FileSearch,
  Gauge
} from 'lucide-react';
import { CrackAnalysisResponse } from '../types';
import { analyzeCrack } from '../services/api';

interface CrackAnalyzerProps {
  sampleData?: any;
}

export const CrackAnalyzer: React.FC<CrackAnalyzerProps> = ({ sampleData }) => {
  const [imagePreview, setImagePreview] = useState<string>('');
  const [material, setMaterial] = useState<string>('Reinforced Concrete');
  const [element, setElement] = useState<string>('Load-Bearing Transfer Girder');
  const [ageYears, setAgeYears] = useState<number>(6);
  const [environment, setEnvironment] = useState<string>('Exterior Coastal Exposure');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<CrackAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeRepairTab, setActiveRepairTab] = useState<number>(0);

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
    if (sampleData?.crack_sample) {
      setImagePreview(sampleData.crack_sample.image_base64 || '');
      setMaterial(sampleData.crack_sample.surface_material || 'Reinforced Concrete');
      setElement(sampleData.crack_sample.structural_element || 'Transfer Girder Web');
      setAgeYears(sampleData.crack_sample.structure_age_years || 6);
      setEnvironment(sampleData.crack_sample.environment || 'Exterior Coastal Exposure');
      setNotes(sampleData.crack_sample.notes || '');
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeCrack({
        image_base64: imagePreview || undefined,
        surface_material: material,
        structural_element: element,
        structure_age_years: ageYears,
        environment: environment,
        notes: notes,
      });
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Crack analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'CRITICAL_EVACUATION':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'URGENT_SHORING':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'REPAIR_SOON':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      default:
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
              <SearchCheck className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white">Crack Detection & Structural Health Diagnostics</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Forensic defect classification, width quantification, structural significance, and ACI 224 engineering repair procedures.
          </p>
        </div>

        <button
          onClick={loadSample}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-orange-400 border border-orange-500/30 text-xs font-semibold transition"
        >
          <Sparkles className="w-4 h-4 text-orange-400" />
          <span>Load Girder Shear Defect Sample</span>
        </button>
      </div>

      {/* Input Configuration & Upload */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Defect Photo */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              1. Structural Defect Photography
            </span>

            <div className="mt-3">
              {imagePreview ? (
                <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
                  <img
                    src={imagePreview}
                    alt="Crack Inspection Preview"
                    className="w-full h-72 object-contain bg-slate-950"
                  />
                  <button
                    onClick={() => setImagePreview('')}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-900/80 hover:bg-red-500/80 text-white text-xs transition"
                  >
                    Clear Photo
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-700 hover:border-orange-500/50 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition bg-slate-950/40 hover:bg-slate-900/40">
                  <Upload className="w-10 h-10 text-slate-500 mb-3" />
                  <span className="text-xs font-semibold text-slate-300">
                    Upload concrete, beam, or masonry crack image
                  </span>
                  <span className="text-[10px] text-slate-500 mt-1">
                    Accepts NDT, drone, or close-up optical photos
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
            <span>Visual NDT Resolution: Verified</span>
            <span className="text-orange-400/90 font-mono">ACI 224.1R Compliance</span>
          </div>
        </div>

        {/* Right: Structural Parameters */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              2. Structural Context & History
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Surface Material
                </label>
                <select
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="Reinforced Concrete">Reinforced Concrete</option>
                  <option value="Prestressed Concrete">Prestressed Concrete</option>
                  <option value="Brick Masonry Wall">Brick Masonry Wall</option>
                  <option value="Concrete Block (CMU)">Concrete Block (CMU)</option>
                  <option value="Stone Foundation">Stone Foundation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Structural Element
                </label>
                <input
                  type="text"
                  value={element}
                  onChange={(e) => setElement(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  placeholder="e.g. Load-Bearing Transfer Girder"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Structure Age (Years)
                </label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={ageYears}
                  onChange={(e) => setAgeYears(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Environmental Exposure
                </label>
                <input
                  type="text"
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  placeholder="e.g. Exterior Coastal Exposure"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Recent Load / Seismic Events
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
                placeholder="e.g. Heavy vibration from adjacent tower pile driving"
              />
            </div>
          </div>

          <div className="mt-6">
            {error && (
              <div className="mb-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/20 disabled:opacity-50 transition cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Computing Crack Morphology & Mechanics...</span>
                </>
              ) : (
                <>
                  <FileSearch className="w-4 h-4" />
                  <span>Execute Structural Defect Diagnostics</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Classification
              </span>
              <div className="mt-2 text-sm font-bold text-white truncate">
                {result.classification.primary_type}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">{result.classification.propagation_pattern}</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Estimated Crack Width
              </span>
              <div className="mt-2 flex items-baseline space-x-1.5">
                <span className="text-3xl font-extrabold text-orange-400">
                  {result.classification.estimated_width_mm}
                </span>
                <span className="text-xs text-slate-500 font-mono">mm</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">{result.classification.width_category}</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Severity Score
              </span>
              <div className="mt-2 flex items-baseline space-x-1.5">
                <span className={`text-3xl font-extrabold ${result.severity.severity_score >= 70 ? 'text-red-400' : result.severity.severity_score >= 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {result.severity.severity_score}
                </span>
                <span className="text-xs text-slate-500">/ 100</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Hazard index</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Urgency Action
              </span>
              <div className="mt-2">
                <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold border ${getUrgencyBadge(result.severity.urgency_level)}`}>
                  {result.severity.urgency_level.replace('_', ' ')}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Re-inspect in {result.severity.recommended_reinspection_days} days</p>
            </div>
          </div>

          {/* Forensic Summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Forensic Structural Summary
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {result.summary}
            </p>
          </div>

          {/* Probable Causes & Monitoring */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Causes */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <Activity className="w-4 h-4 text-orange-400" />
                <span>Forensic Root Causes & Probability Distribution</span>
              </h3>

              <div className="space-y-3">
                {result.probable_causes.map((c, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{c.cause}</span>
                      <span className="font-mono text-orange-400 font-bold">{c.probability_percent}% Probability</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${c.probability_percent}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {c.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Monitoring Protocol */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <Gauge className="w-4 h-4 text-blue-400" />
                <span>Structural Monitoring Protocol</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Recommended Sensors</span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {result.monitoring_protocol.recommended_sensors.map((s, i) => (
                      <span key={i} className="px-2 py-1 rounded-md bg-slate-800 text-slate-300 text-[10px] font-mono border border-slate-700">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Monitoring Frequency</span>
                  <p className="text-xs text-slate-300 mt-1">{result.monitoring_protocol.monitoring_frequency}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 border-l-4 border-l-red-500">
                  <span className="text-[10px] uppercase font-bold text-red-400 block">Threshold Alert Trigger</span>
                  <p className="text-xs text-slate-300 mt-1">{result.monitoring_protocol.displacement_threshold_alert}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-[10px] font-mono text-slate-400">
                  <span className="font-sans font-semibold text-slate-300 block mb-1">Standard Specifications:</span>
                  {result.compliance_codes.map((code, i) => (
                    <div key={i} className="truncate">• {code}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Repair Methodology Tabs */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <Wrench className="w-4 h-4 text-emerald-400" />
                <span>Engineered Repair Methodologies ({result.recommended_repairs.length} Options)</span>
              </h3>
            </div>

            {/* Repair tabs */}
            <div className="flex space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
              {result.recommended_repairs.map((r, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveRepairTab(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    activeRepairTab === idx
                      ? 'bg-orange-500 text-slate-950'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-800'
                  }`}
                >
                  Option {idx + 1}: {r.method_name.slice(0, 24)}...
                </button>
              ))}
            </div>

            {result.recommended_repairs[activeRepairTab] && (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-white">
                    {result.recommended_repairs[activeRepairTab].method_name}
                  </h4>
                  <div className="flex items-center space-x-3 text-xs">
                    <span className="text-slate-400">
                      Est. Cost: <span className="font-mono text-emerald-400 font-bold">{result.recommended_repairs[activeRepairTab].estimated_cost_usd}</span>
                    </span>
                    <span className="text-slate-400">
                      Lifespan: <span className="font-mono text-orange-400 font-bold">{result.recommended_repairs[activeRepairTab].durability_years}</span>
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300">
                  {result.recommended_repairs[activeRepairTab].suitability}
                </p>

                {/* Materials required */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1.5">
                    Chemical Materials & Hardware Required
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {result.recommended_repairs[activeRepairTab].materials_required.map((mat, i) => (
                      <span key={i} className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-[10px] font-mono border border-slate-700">
                        {mat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Step by step procedure */}
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-2">
                    Step-by-Step Field Execution Procedure
                  </span>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300">
                    {result.recommended_repairs[activeRepairTab].step_by_step_procedure.map((step, i) => (
                      <li key={i} className="leading-relaxed pl-1">{step}</li>
                    ))}
                  </ol>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
