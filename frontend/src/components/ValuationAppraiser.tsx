import React, { useState } from 'react';
import {
  BadgeDollarSign,
  TrendingUp,
  Building2,
  Percent,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  PieChart,
  ShieldCheck,
  Scale
} from 'lucide-react';
import { ValuationResponse } from '../types';
import { appraiseRealEstate } from '../services/api';

interface ValuationAppraiserProps {
  sampleData?: any;
}

export const ValuationAppraiser: React.FC<ValuationAppraiserProps> = ({ sampleData }) => {
  const [propertyType, setProjectType] = useState<string>('Commercial Office');
  const [plotArea, setPlotArea] = useState<number>(20000);
  const [builtUpArea, setBuiltUpArea] = useState<number>(45000);
  const [propertyAge, setPropertyAge] = useState<number>(2);
  const [citySubmarket, setCitySubmarket] = useState<string>('Financial District, Austin TX');
  const [submarketTier, setSubmarketTier] = useState<string>('Prime CBD');
  const [constructionQuality, setConstructionQuality] = useState<string>('Grade A / Luxury');
  const [constructionStage, setConstructionStage] = useState<string>('Ready for Occupancy');
  const [amenities, setAmenities] = useState<string[]>([
    'Multi-Level Parking',
    'High-Speed Elevators',
    'Solar Rooftop',
    'Backup Generators',
    'LEED Certified',
  ]);
  const [occupancyRate, setOccupancyRate] = useState<number>(94.0);

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ValuationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const availableAmenities = [
    'Multi-Level Parking',
    'High-Speed Elevators',
    'Solar Rooftop',
    'Backup Generators',
    'LEED Certified',
    'Rainwater Harvesting',
    'Fiber Optic Backbone',
    'Executive Lounge & Gym',
  ];

  const toggleAmenity = (name: string) => {
    if (amenities.includes(name)) {
      setAmenities(amenities.filter((a) => a !== name));
    } else {
      setAmenities([...amenities, name]);
    }
  };

  const loadSample = () => {
    if (sampleData?.valuation_sample) {
      setProjectType(sampleData.valuation_sample.property_type || 'Commercial Office');
      setPlotArea(sampleData.valuation_sample.plot_area_sqft || 20000);
      setBuiltUpArea(sampleData.valuation_sample.built_up_area_sqft || 45000);
      setPropertyAge(sampleData.valuation_sample.property_age_years || 2);
      setCitySubmarket(sampleData.valuation_sample.city_and_submarket || 'Financial District, Austin TX');
      setSubmarketTier(sampleData.valuation_sample.submarket_tier || 'Prime CBD');
      setConstructionQuality(sampleData.valuation_sample.construction_quality || 'Grade A / Luxury');
      setConstructionStage(sampleData.valuation_sample.construction_stage || 'Ready for Occupancy');
      setAmenities(sampleData.valuation_sample.amenities || availableAmenities.slice(0, 5));
      setOccupancyRate(sampleData.valuation_sample.occupancy_rate_percent || 94.0);
    }
  };

  const handleAppraisal = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await appraiseRealEstate({
        property_type: propertyType,
        plot_area_sqft: plotArea,
        built_up_area_sqft: builtUpArea,
        property_age_years: propertyAge,
        city_and_submarket: citySubmarket,
        submarket_tier: submarketTier,
        construction_quality: constructionQuality,
        construction_stage: constructionStage,
        amenities: amenities,
        occupancy_rate_percent: occupancyRate,
      });
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Appraisal failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <BadgeDollarSign className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white">Real Estate Valuation & Asset Appraisal</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Dual-method appraisal combining Sales Comparison Market Approach and Depreciated Replacement Cost Method.
          </p>
        </div>

        <button
          onClick={loadSample}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition"
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Load Prime Austin CBD Office Asset</span>
        </button>
      </div>

      {/* Input Parameters */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Asset Specification & Market Attributes
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Property Asset Type
            </label>
            <select
              value={propertyType}
              onChange={(e) => setProjectType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="Commercial Office">Commercial Office</option>
              <option value="Residential Single-Family">Residential Single-Family</option>
              <option value="Luxury Condo">Luxury Condo</option>
              <option value="Retail Mall">Retail Mall</option>
              <option value="Industrial Facility">Industrial Facility</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Gross Built-up Area (sq.ft.)
            </label>
            <input
              type="number"
              min="500"
              max="1000000"
              value={builtUpArea}
              onChange={(e) => setBuiltUpArea(parseFloat(e.target.value) || 1000)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Land / Plot Area (sq.ft.)
            </label>
            <input
              type="number"
              min="500"
              max="2000000"
              value={plotArea}
              onChange={(e) => setPlotArea(parseFloat(e.target.value) || 1000)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Structure Age (Years)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={propertyAge}
              onChange={(e) => setPropertyAge(parseInt(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              City & Submarket
            </label>
            <input
              type="text"
              value={citySubmarket}
              onChange={(e) => setCitySubmarket(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              placeholder="e.g. Austin CBD, TX"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Submarket Grade
            </label>
            <select
              value={submarketTier}
              onChange={(e) => setSubmarketTier(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="Prime CBD">Prime CBD</option>
              <option value="Emerging Growth Corridor">Emerging Growth Corridor</option>
              <option value="Established Suburb">Established Suburb</option>
              <option value="Outer Metro">Outer Metro</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Construction Quality
            </label>
            <select
              value={constructionQuality}
              onChange={(e) => setConstructionQuality(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="Standard">Standard</option>
              <option value="Grade A / Luxury">Grade A / Luxury</option>
              <option value="Ultra Luxury">Ultra Luxury</option>
              <option value="Economy">Economy</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Construction Stage
            </label>
            <select
              value={constructionStage}
              onChange={(e) => setConstructionStage(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="Planning / Permitting">Planning / Permitting</option>
              <option value="Structural Shell">Structural Shell</option>
              <option value="Under Fit-out">Under Fit-out</option>
              <option value="Ready for Occupancy">Ready for Occupancy</option>
            </select>
          </div>
        </div>

        {/* Amenities Selection Chips */}
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-2">
            Asset Features & Amenities
          </label>
          <div className="flex flex-wrap gap-2">
            {availableAmenities.map((amenity) => {
              const active = amenities.includes(amenity);
              return (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    active
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {active ? '✓ ' : '+ '} {amenity}
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleAppraisal}
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition cursor-pointer"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Synthesizing Submarket Comps & Replacement Costs...</span>
            </>
          ) : (
            <>
              <BadgeDollarSign className="w-4 h-4" />
              <span>Compute Multimodal Real Estate Valuation</span>
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
                Estimated Market Value
              </span>
              <div className="mt-2 text-2xl font-extrabold text-emerald-400">
                ${result.valuation_summary.estimated_market_value_usd.toLocaleString()}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Range: ${result.valuation_summary.valuation_range_min_usd.toLocaleString()} - ${result.valuation_summary.valuation_range_max_usd.toLocaleString()}
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Price Per Sq.Ft.
              </span>
              <div className="mt-2 flex items-baseline space-x-1">
                <span className="text-2xl font-extrabold text-white">
                  ${result.valuation_summary.price_per_sqft_usd.toFixed(2)}
                </span>
                <span className="text-xs text-slate-500">/ sq.ft.</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Confidence: {result.valuation_summary.confidence_score_percent}%</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Gross Rental Yield
              </span>
              <div className="mt-2 flex items-baseline space-x-1">
                <span className="text-2xl font-extrabold text-teal-400">
                  {result.financial_metrics.gross_rental_yield_percent.toFixed(2)}%
                </span>
                <span className="text-xs text-slate-500 font-mono">p.a.</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Cap Rate: {result.financial_metrics.capitalization_rate_percent}%</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Investment Rating
              </span>
              <div className="mt-2">
                <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold border text-emerald-400 bg-emerald-500/10 border-emerald-500/30">
                  {result.investment_recommendation}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">5-Yr Appr: +{result.financial_metrics.projected_5yr_appreciation_percent}%</p>
            </div>
          </div>

          {/* Investment Rationale Summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Appraiser Rationale & Investment Thesis
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {result.rationale}
            </p>
          </div>

          {/* Replacement Cost Breakdown vs Financial Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Depreciated Replacement Cost Method */}
            <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <Scale className="w-4 h-4 text-emerald-400" />
                <span>Depreciated Replacement Cost Method</span>
              </h3>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between">
                  <span className="text-slate-400 font-sans">Underlying Land Value</span>
                  <span className="text-white font-bold">${result.replacement_cost_method.land_value_usd.toLocaleString()}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between">
                  <span className="text-slate-400 font-sans">Replacement Cost New (RCN)</span>
                  <span className="text-white font-bold">${result.replacement_cost_method.replacement_cost_new_usd.toLocaleString()}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between text-rose-400">
                  <span className="text-slate-400 font-sans">Less: Accumulated Depreciation</span>
                  <span className="font-bold">-${result.replacement_cost_method.accumulated_depreciation_usd.toLocaleString()}</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between">
                  <span className="text-slate-400 font-sans">Depreciated Structure Value</span>
                  <span className="text-teal-400 font-bold">${result.replacement_cost_method.depreciated_structure_value_usd.toLocaleString()}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex justify-between text-sm">
                  <span className="text-emerald-300 font-sans font-bold">Total Indicated Value (Cost Method)</span>
                  <span className="text-emerald-400 font-bold">${result.replacement_cost_method.indicated_value_by_cost_approach_usd.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Right: Cashflow & Returns Analytics */}
            <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-teal-400" />
                <span>Yield & Financial Cashflow Projections</span>
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Annual Rental Income</span>
                  <div className="text-lg font-bold text-white mt-1">
                    ${result.financial_metrics.potential_annual_rental_income_usd.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-400">~${result.financial_metrics.estimated_monthly_rent_usd.toLocaleString()} / mo</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Estimated Payback Period</span>
                  <div className="text-lg font-bold text-amber-400 mt-1">
                    {result.financial_metrics.payback_period_years.toFixed(1)} Years
                  </div>
                  <span className="text-[10px] text-slate-400">Unlevered recovery</span>
                </div>
              </div>

              {/* Value Drivers & Adjustments */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Submarket Value Drivers</span>
                {result.key_drivers_and_adjustments.map((driver, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-start justify-between gap-2 text-xs">
                    <div>
                      <span className="font-semibold text-slate-200">{driver.factor_name}</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">{driver.description}</p>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                      driver.impact === 'POSITIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {driver.adjustment_percentage > 0 ? `+${driver.adjustment_percentage}%` : `${driver.adjustment_percentage}%`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Comparable Sales */}
          {result.comparable_benchmark_sales && result.comparable_benchmark_sales.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Submarket Comparable Transactions (Sales Comparison Approach)
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 text-[11px] uppercase tracking-wider font-sans">
                      <th className="pb-3 font-semibold">Comparable Property</th>
                      <th className="pb-3 font-semibold text-right">Transaction Value ($)</th>
                      <th className="pb-3 font-semibold text-right">Rate / Sq.Ft.</th>
                      <th className="pb-3 font-semibold">Sale Window</th>
                      <th className="pb-3 font-semibold text-right">Similarity Index</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {result.comparable_benchmark_sales.map((comp, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30 text-slate-300">
                        <td className="py-2.5 font-sans font-medium text-white">{comp.property_name}</td>
                        <td className="py-2.5 text-right font-bold text-emerald-400">${comp.sale_price_usd.toLocaleString()}</td>
                        <td className="py-2.5 text-right">${comp.price_per_sqft}</td>
                        <td className="py-2.5 font-sans text-slate-400">{comp.sale_date}</td>
                        <td className="py-2.5 text-right font-sans text-teal-400 font-bold">{comp.similarity_index}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
