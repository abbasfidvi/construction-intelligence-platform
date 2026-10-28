import React, { useState } from 'react';
import {
  CloudSun,
  Wind,
  Droplets,
  Thermometer,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Calendar,
  Construction
} from 'lucide-react';
import { WeatherAdvisoryResponse } from '../types';
import { getLiveWeatherAdvisory } from '../services/api';

interface WeatherAdvisoryProps {
  sampleData?: any;
}

export const WeatherAdvisory: React.FC<WeatherAdvisoryProps> = ({ sampleData }) => {
  const [location, setLocation] = useState<string>('Austin Metro Construction Hub');
  const [tempC, setTempC] = useState<number>(33.5);
  const [humidity, setHumidity] = useState<number>(65.0);
  const [rainProb, setRainProb] = useState<number>(20.0);
  const [windSpeed, setWindSpeed] = useState<number>(24.0);
  const [windGusts, setWindGusts] = useState<number>(36.0);
  const [uvIndex, setUvIndex] = useState<number>(9);

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<WeatherAdvisoryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadSample = () => {
    if (sampleData?.weather_sample) {
      setLocation(sampleData.weather_sample.location || 'Austin Metro Construction Hub');
      setTempC(sampleData.weather_sample.temperature_c || 33.5);
      setHumidity(sampleData.weather_sample.humidity_percent || 65.0);
      setRainProb(sampleData.weather_sample.rain_probability_percent || 20.0);
      setWindSpeed(sampleData.weather_sample.wind_speed_kmh || 24.0);
      setWindGusts(sampleData.weather_sample.wind_gusts_kmh || 36.0);
      setUvIndex(sampleData.weather_sample.uv_index || 9);
    }
  };

  const handleEvaluate = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLiveWeatherAdvisory({
        location: location,
        temperature_c: tempC,
        humidity_percent: humidity,
        rain_probability_percent: rainProb,
        wind_speed_kmh: windSpeed,
        wind_gusts_kmh: windGusts,
        uv_index: uvIndex,
      });
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Weather evaluation failed.');
    } finally {
      setLoading(false);
    }
  };

  const getAdvisoryBadge = (level: string) => {
    switch (level) {
      case 'RED_SUSPENSION':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'ORANGE_RESTRICTED':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'YELLOW_CAUTION':
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
            <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <CloudSun className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white">Weather-Aware Construction Advisory</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time evaluation of ACI 305R concrete pour suitability, OSHA 1926 crane wind limits, and worker heat-stress schedules.
          </p>
        </div>

        <button
          onClick={loadSample}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-cyan-400 border border-cyan-500/30 text-xs font-semibold transition"
        >
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Load Hot & Breezy Weather Sample</span>
        </button>
      </div>

      {/* Input Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Climatic Observation Data
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Jobsite Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Ambient Temperature (°C)
            </label>
            <input
              type="number"
              step="0.5"
              value={tempC}
              onChange={(e) => setTempC(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Relative Humidity (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={humidity}
              onChange={(e) => setHumidity(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Precipitation Chance (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={rainProb}
              onChange={(e) => setRainProb(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Sustained Wind Speed (km/h)
            </label>
            <input
              type="number"
              min="0"
              max="150"
              value={windSpeed}
              onChange={(e) => setWindSpeed(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Peak Wind Gusts (km/h)
            </label>
            <input
              type="number"
              min="0"
              max="200"
              value={windGusts}
              onChange={(e) => setWindGusts(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Solar UV Index
            </label>
            <input
              type="number"
              min="1"
              max="12"
              value={uvIndex}
              onChange={(e) => setUvIndex(parseInt(e.target.value) || 1)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleEvaluate}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Calculating Weather Risks...</span>
                </>
              ) : (
                <>
                  <Wind className="w-4 h-4" />
                  <span>Evaluate Field Advisories</span>
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Site Advisory Level
              </span>
              <div className="mt-2">
                <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold border ${getAdvisoryBadge(result.site_advisory_level)}`}>
                  {result.site_advisory_level.replace('_', ' ')}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">General field safety status</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Concrete Pour Rating
              </span>
              <div className="mt-2 flex items-baseline space-x-1.5">
                <span className={`text-3xl font-extrabold ${result.pour_suitability.status === 'OPTIMAL' ? 'text-emerald-400' : result.pour_suitability.status === 'CAUTION' ? 'text-amber-400' : 'text-red-400'}`}>
                  {result.pour_suitability.suitability_score}
                </span>
                <span className="text-xs text-slate-500">/ 100</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Status: {result.pour_suitability.status}</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Crane Lifting Ops
              </span>
              <div className="mt-2">
                <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold border ${result.crane_and_rigging.safe_to_operate ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-red-400 bg-red-500/10 border-red-500/30'}`}>
                  {result.crane_and_rigging.safe_to_operate ? 'SAFE TO OPERATE' : 'LIFTING SUSPENDED'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Limit: 38 km/h ({result.crane_and_rigging.wind_gust_risk})</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Thermal Heat Index
              </span>
              <div className="mt-2 text-sm font-bold text-white truncate">
                {result.temperature_heat_index}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">OSHA hydration protocol</p>
            </div>
          </div>

          {/* Operational Guidance Overview */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Field Operations Advisory Summary
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {result.overall_guidance}
            </p>
          </div>

          {/* Two Deep Panels: Concrete Pour Analysis & Crane/Earthwork */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Concrete Pouring Analysis (ACI 305R) */}
            <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <Construction className="w-4 h-4 text-cyan-400" />
                <span>Concrete Pour Feasibility (ACI 305R Guidelines)</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">Plastic Shrinkage Cracking Risk</span>
                  <span className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                    result.pour_suitability.plastic_shrinkage_cracking_risk === 'LOW'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : result.pour_suitability.plastic_shrinkage_cracking_risk === 'MODERATE'
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'bg-red-500/10 text-red-400'
                  }`}>
                    {result.pour_suitability.plastic_shrinkage_cracking_risk}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center">
                  <span className="text-slate-400">Slump Retention Time Limit</span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {result.pour_suitability.max_allowable_slump_retention_minutes} Minutes
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Mandatory Curing & Placement Adjustments
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {result.pour_suitability.curing_protocol_adjustments.map((adj, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{adj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Crane & Worker Thermal Stress */}
            <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <Wind className="w-4 h-4 text-blue-400" />
                <span>Rigging, Earthworks & Workforce Safety</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Crane Boom & Hook Instructions</span>
                  <p className="text-slate-300">{result.crane_and_rigging.boom_guidelines}</p>
                  {result.crane_and_rigging.derating_factor_percent > 0 && (
                    <span className="text-[10px] font-mono text-amber-400 font-bold block">
                      Capacity Derated by: {result.crane_and_rigging.derating_factor_percent}% due to gust velocity
                    </span>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Worker Heat-Stress Regimen</span>
                  <p className="text-slate-300">{result.heat_stress_regime}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Subgrade & Trenching Status</span>
                  <p className="text-slate-300">{result.earthworks_and_excavation_risk}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Task Rescheduling Matrix */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Weather-Adaptive Task Scheduling Directives
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {result.scheduled_task_recommendations.map((t, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-2 text-xs">
                  <div>
                    <span className="font-bold text-white">{t.task}</span>
                    {t.guidance && <p className="text-[11px] text-slate-400 mt-1">{t.guidance}</p>}
                    {t.time_window && <p className="text-[10px] text-cyan-400 font-mono mt-1">{t.time_window}</p>}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border shrink-0 ${
                    t.status === 'APPROVED' || t.status === 'OPTIMAL'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : t.status === 'CAUTION'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-red-500/10 text-red-400 border-red-500/30'
                  }`}>
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 24-Hour Outlook */}
          {result.twenty_four_hour_outlook && result.twenty_four_hour_outlook.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                24-Hour Operations Outlook
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {result.twenty_four_hour_outlook.map((hour, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-center space-y-1">
                    <span className="text-[11px] font-mono text-cyan-400 font-bold block">{hour.time}</span>
                    <div className="text-lg font-bold text-white">{hour.temp_c}°C</div>
                    <div className="text-[10px] text-slate-400">{hour.condition}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Rain: {hour.rain_prob}% | Wind: {hour.wind_kmh}km/h
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
