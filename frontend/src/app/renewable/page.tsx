"use client";
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Sun, Wind, Trees, Sparkles } from 'lucide-react';

export default function RenewablePage() {
  const { user } = useApp();
  const [capacity, setCapacity] = useState('15');
  const [sunHours, setSunHours] = useState('5.5');
  const [windCapacity, setWindCapacity] = useState('20');
  const [windSpeed, setWindSpeed] = useState('6.2');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>({
    solar: {
      daily_generation_kwh: 64.4,
      monthly_generation_kwh: 1932.0,
      annual_generation_kwh: 23184.0,
      annual_carbon_offset_kg: 19706.4,
      equivalent_trees_planted: 895
    },
    wind: {
      daily_generation_kwh: 48.0,
      monthly_generation_kwh: 1440.0,
      annual_generation_kwh: 17520.0,
      annual_carbon_offset_kg: 14892.0,
      equivalent_trees_planted: 676
    },
    combined_annual_generation_kwh: 40704.0,
    combined_annual_carbon_offset_kg: 34598.4
  });

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/renewable-predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          panel_capacity_kw: parseFloat(capacity) || 0,
          direct_sun_hours: parseFloat(sunHours) || 0,
          turbine_capacity_kw: parseFloat(windCapacity) || 0,
          wind_speed_ms: parseFloat(windSpeed) || 0,
          user_id: user?.id || 1
        })
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      }
    } catch (err) {
      console.error("Projections connection failed. Calculating locally.");
      const s_daily = (parseFloat(capacity) || 0) * (parseFloat(sunHours) || 0) * 0.78;
      const s_annual = s_daily * 365;
      const s_carbon = s_annual * 0.85;

      const norm_speed = Math.min(1.0, Math.max(0.0, (parseFloat(windSpeed) || 0) / 12.0));
      const load_factor = Math.pow(norm_speed, 3) * 0.40;
      const w_daily = (parseFloat(windCapacity) || 0) * 24.0 * load_factor;
      const w_annual = w_daily * 365;
      const w_carbon = w_annual * 0.85;

      setResult({
        solar: {
          daily_generation_kwh: s_daily.toFixed(1),
          monthly_generation_kwh: (s_daily * 30).toFixed(1),
          annual_generation_kwh: s_annual.toFixed(1),
          annual_carbon_offset_kg: s_carbon.toFixed(1),
          equivalent_trees_planted: Math.floor(s_carbon / 22.0)
        },
        wind: {
          daily_generation_kwh: w_daily.toFixed(1),
          monthly_generation_kwh: (w_daily * 30).toFixed(1),
          annual_generation_kwh: w_annual.toFixed(1),
          annual_carbon_offset_kg: w_carbon.toFixed(1),
          equivalent_trees_planted: Math.floor(w_carbon / 22.0)
        },
        combined_annual_generation_kwh: (s_annual + w_annual).toFixed(1),
        combined_annual_carbon_offset_kg: (s_carbon + w_carbon).toFixed(1)
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <Sun className="h-6 w-6 text-emerald-400" /> Renewable Energy Predictor
        </h1>
        <p className="text-xs text-gray-400 mt-1 font-medium">Model solar and wind installations to estimate clean electricity generation and carbon offsets.</p>
      </div>

      <form onSubmit={handlePredict} className="space-y-6">
        {/* Side-by-Side Specifications */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Solar Specs Card */}
          <div className="glass-card space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 border-b border-emerald-500/10 pb-2">
              <Sun className="h-4.5 w-4.5 text-amber-400" /> Solar Specification
            </h3>
            <div>
              <label className="block text-gray-400 font-semibold mb-1">Target Panel Capacity (kW)</label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full p-2.5 bg-black/40 border border-emerald-500/10 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-gray-400 font-semibold mb-1">Direct Sun Hours (Daily)</label>
              <input
                type="number"
                step="0.1"
                value={sunHours}
                onChange={(e) => setSunHours(e.target.value)}
                className="w-full p-2.5 bg-black/40 border border-emerald-500/10 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Wind Specs Card */}
          <div className="glass-card space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 border-b border-emerald-500/10 pb-2">
              <Wind className="h-4.5 w-4.5 text-cyan-400" /> Wind Specification
            </h3>
            <div>
              <label className="block text-gray-400 font-semibold mb-1">Turbine Capacity (kW)</label>
              <input
                type="number"
                value={windCapacity}
                onChange={(e) => setWindCapacity(e.target.value)}
                className="w-full p-2.5 bg-black/40 border border-emerald-500/10 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-gray-400 font-semibold mb-1">Average Wind Speed (m/s)</label>
              <input
                type="number"
                step="0.1"
                value={windSpeed}
                onChange={(e) => setWindSpeed(e.target.value)}
                className="w-full p-2.5 bg-black/40 border border-emerald-500/10 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all border border-emerald-400/20 cursor-pointer text-xs"
        >
          {loading ? "Modeling renewable metrics..." : "Predict Solar & Wind Outputs"}
        </button>
      </form>

      {/* Results Panel */}
      <div className="glass-card text-xs">
        {result ? (
          <div className="space-y-6">
            {/* Combined Box */}
            <div className="bg-emerald-950/20 p-4 rounded-xl border border-emerald-500/20 grid grid-cols-2 gap-4 text-center">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Combined Annual Generation</span>
                <div className="text-xl font-black text-emerald-400 mt-1">
                  {parseFloat(result.combined_annual_generation_kwh).toLocaleString()} <span className="text-xs text-gray-400">kWh</span>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Combined Carbon Offset</span>
                <div className="text-xl font-black text-emerald-400 mt-1">
                  {(parseFloat(result.combined_annual_carbon_offset_kg) / 1000.0).toFixed(1)} <span className="text-xs text-gray-400">tonnes</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Solar Outputs */}
              <div className="bg-black/20 p-4 rounded-2xl border border-emerald-500/5 space-y-3">
                <h4 className="font-bold text-white flex items-center gap-1.5 border-b border-emerald-500/10 pb-2">
                  <Sun className="h-4.5 w-4.5 text-amber-400" /> Solar Projections
                </h4>
                <div className="flex justify-between">
                  <span className="text-gray-400">Daily Generation:</span>
                  <span className="font-bold text-white">{result.solar.daily_generation_kwh} kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Monthly Generation:</span>
                  <span className="font-bold text-white">{parseInt(result.solar.monthly_generation_kwh).toLocaleString()} kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Annual Offset:</span>
                  <span className="font-bold text-emerald-400">{(result.solar.annual_carbon_offset_kg / 1000.0).toFixed(1)} tonnes</span>
                </div>
              </div>

              {/* Wind Outputs */}
              <div className="bg-black/20 p-4 rounded-2xl border border-emerald-500/5 space-y-3">
                <h4 className="font-bold text-white flex items-center gap-1.5 border-b border-emerald-500/10 pb-2">
                  <Wind className="h-4.5 w-4.5 text-cyan-400" /> Wind Projections
                </h4>
                <div className="flex justify-between">
                  <span className="text-gray-400">Daily Generation:</span>
                  <span className="font-bold text-white">{result.wind.daily_generation_kwh} kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Monthly Generation:</span>
                  <span className="font-bold text-white">{parseInt(result.wind.monthly_generation_kwh).toLocaleString()} kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Annual Offset:</span>
                  <span className="font-bold text-cyan-400">{(result.wind.annual_carbon_offset_kg / 1000.0).toFixed(1)} tonnes</span>
                </div>
              </div>
            </div>

            {/* Combined equivalent */}
            <div className="p-4 bg-emerald-950/10 rounded-xl border border-emerald-500/10 flex items-center gap-3">
              <span className="text-2xl">🌳</span>
              <div>
                <h4 className="font-bold text-white mb-0.5">Total Ecological Equivalence</h4>
                <p className="text-gray-400 leading-normal">
                  The combined solar and wind setups yield offset values equivalent to planting <strong className="text-emerald-400 font-bold">{parseInt(result.solar.equivalent_trees_planted) + parseInt(result.wind.equivalent_trees_planted)}</strong> mature trees annually.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-12">
            <Sun className="h-12 w-12 text-emerald-500/30 animate-bounce mb-3" />
            <h3 className="text-sm font-bold text-white">Renewable Modeling Offline</h3>
            <p className="text-xs text-gray-400 max-w-sm mt-1">Configure solar and wind specifications above to compute predicted outcomes.</p>
          </div>
        )}
      </div>
    </div>
  );
}
