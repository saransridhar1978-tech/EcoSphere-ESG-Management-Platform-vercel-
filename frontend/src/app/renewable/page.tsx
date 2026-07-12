"use client";
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Sun, Wind, Trees, Sparkles, Droplets, Trash2, Clock } from 'lucide-react';

export default function RenewablePage() {
  const { user } = useApp();
  
  // Specs state
  const [capacity, setCapacity] = useState('15');
  const [sunHours, setSunHours] = useState('5.5');
  const [solarDuration, setSolarDuration] = useState('12'); // Time bar for solar hours
  
  const [windCapacity, setWindCapacity] = useState('20');
  const [windSpeed, setWindSpeed] = useState('6.2');
  const [windDuration, setWindDuration] = useState('12'); // Time bar for wind hours

  const [flowRate, setFlowRate] = useState('1.5');
  const [headHeight, setHeadHeight] = useState('10');
  
  const [wasteFeedstock, setWasteFeedstock] = useState('150');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>({
    solar: { daily_generation_kwh: 64.4, monthly_generation_kwh: 1932.0, annual_generation_kwh: 23184.0, annual_carbon_offset_kg: 19706.4, equivalent_trees_planted: 895 },
    wind: { daily_generation_kwh: 48.0, monthly_generation_kwh: 1440.0, annual_generation_kwh: 17520.0, annual_carbon_offset_kg: 14892.0, equivalent_trees_planted: 676 },
    water: { daily_generation_kwh: 300.2, monthly_generation_kwh: 9006.0, annual_generation_kwh: 109573.0, annual_carbon_offset_kg: 93137.0, equivalent_trees_planted: 4233 },
    biogas: { daily_generation_kwh: 135.0, monthly_generation_kwh: 4050.0, annual_generation_kwh: 49275.0, annual_carbon_offset_kg: 41883.8, equivalent_trees_planted: 1903 },
    combined_annual_generation_kwh: 199552.0,
    combined_annual_carbon_offset_kg: 169619.2
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
          flow_rate_m3s: parseFloat(flowRate) || 0,
          head_height_m: parseFloat(headHeight) || 0,
          waste_feedstock_kg: parseFloat(wasteFeedstock) || 0,
          user_id: user?.id || 1
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Apply duration factor (hours / 24) on the returned daily values
        const solarFactor = parseFloat(solarDuration) / 24.0;
        const windFactor = parseFloat(windDuration) / 24.0;

        const adjSolarDaily = data.solar.daily_generation_kwh * solarFactor;
        const adjWindDaily = data.wind.daily_generation_kwh * windFactor;

        setResult({
          ...data,
          solar: {
            ...data.solar,
            daily_generation_kwh: adjSolarDaily.toFixed(1),
            monthly_generation_kwh: (adjSolarDaily * 30).toFixed(1),
            annual_generation_kwh: (adjSolarDaily * 365).toFixed(1),
            annual_carbon_offset_kg: (adjSolarDaily * 365 * 0.85).toFixed(1),
            equivalent_trees_planted: Math.floor((adjSolarDaily * 365 * 0.85) / 22.0)
          },
          wind: {
            ...data.wind,
            daily_generation_kwh: adjWindDaily.toFixed(1),
            monthly_generation_kwh: (adjWindDaily * 30).toFixed(1),
            annual_generation_kwh: (adjWindDaily * 365).toFixed(1),
            annual_carbon_offset_kg: (adjWindDaily * 365 * 0.85).toFixed(1),
            equivalent_trees_planted: Math.floor((adjWindDaily * 365 * 0.85) / 22.0)
          },
          combined_annual_generation_kwh: (
            (adjSolarDaily * 365) + 
            (adjWindDaily * 365) + 
            data.water.annual_generation_kwh + 
            data.biogas.annual_generation_kwh
          ).toFixed(1),
          combined_annual_carbon_offset_kg: (
            ((adjSolarDaily * 365) + (adjWindDaily * 365) + data.water.annual_generation_kwh + data.biogas.annual_generation_kwh) * 0.85
          ).toFixed(1)
        });
      }
    } catch (err) {
      console.error("Projections connection failed. Calculating locally.");
      
      const s_daily = (parseFloat(capacity) || 0) * (parseFloat(sunHours) || 0) * 0.78 * (parseFloat(solarDuration) / 24.0);
      const s_annual = s_daily * 365;
      const s_carbon = s_annual * 0.85;

      const norm_speed = Math.min(1.0, Math.max(0.0, (parseFloat(windSpeed) || 0) / 12.0));
      const load_factor = Math.pow(norm_speed, 3) * 0.40;
      const w_daily = (parseFloat(windCapacity) || 0) * 24.0 * load_factor * (parseFloat(windDuration) / 24.0);
      const w_annual = w_daily * 365;
      const w_carbon = w_annual * 0.85;

      const hydro_kw = (parseFloat(flowRate) || 0) * (parseFloat(headHeight) || 0) * 9.81 * 0.85;
      const hydro_daily = hydro_kw * 24.0;
      const hydro_annual = hydro_daily * 365;
      const hydro_carbon = hydro_annual * 0.85;

      const biogas_daily = (parseFloat(wasteFeedstock) || 0) * 0.15 * 6.0 * 0.60;
      const biogas_annual = biogas_daily * 365;
      const biogas_carbon = biogas_annual * 0.85;

      setResult({
        solar: { daily_generation_kwh: s_daily.toFixed(1), monthly_generation_kwh: (s_daily * 30).toFixed(1), annual_generation_kwh: s_annual.toFixed(1), annual_carbon_offset_kg: s_carbon.toFixed(1), equivalent_trees_planted: Math.floor(s_carbon / 22.0) },
        wind: { daily_generation_kwh: w_daily.toFixed(1), monthly_generation_kwh: (w_daily * 30).toFixed(1), annual_generation_kwh: w_annual.toFixed(1), annual_carbon_offset_kg: w_carbon.toFixed(1), equivalent_trees_planted: Math.floor(w_carbon / 22.0) },
        water: { daily_generation_kwh: hydro_daily.toFixed(1), monthly_generation_kwh: (hydro_daily * 30).toFixed(1), annual_generation_kwh: hydro_annual.toFixed(1), annual_carbon_offset_kg: hydro_carbon.toFixed(1), equivalent_trees_planted: Math.floor(hydro_carbon / 22.0) },
        biogas: { daily_generation_kwh: biogas_daily.toFixed(1), monthly_generation_kwh: (biogas_daily * 30).toFixed(1), annual_generation_kwh: biogas_annual.toFixed(1), annual_carbon_offset_kg: biogas_carbon.toFixed(1), equivalent_trees_planted: Math.floor(biogas_carbon / 22.0) },
        combined_annual_generation_kwh: (s_annual + w_annual + hydro_annual + biogas_annual).toFixed(1),
        combined_annual_carbon_offset_kg: (s_carbon + w_carbon + hydro_carbon + biogas_carbon).toFixed(1)
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
        <p className="text-xs text-gray-400 mt-1 font-medium">Model solar, wind, hydro water flow, and organic biogas installations side-by-side.</p>
      </div>

      <form onSubmit={handlePredict} className="space-y-6">
        {/* Four Specifications Side-by-Side Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
          
          {/* Solar Specs Card */}
          <div className="glass-card space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 border-b border-emerald-500/10 pb-2">
              <Sun className="h-4.5 w-4.5 text-amber-400" /> Solar Specs
            </h3>
            <div>
              <label className="block text-gray-400 font-semibold mb-1">Panel Capacity (kW)</label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full p-2 bg-black/40 border border-emerald-500/10 rounded-xl text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-gray-400 font-semibold mb-1">Sun Hours (Daily)</label>
              <input
                type="number"
                step="0.1"
                value={sunHours}
                onChange={(e) => setSunHours(e.target.value)}
                className="w-full p-2 bg-black/40 border border-emerald-500/10 rounded-xl text-white text-xs"
              />
            </div>
            {/* Solar Time Bar */}
            <div>
              <div className="flex justify-between text-gray-400 font-semibold mb-1">
                <span>Active Target (Hours)</span>
                <span className="text-emerald-400 font-bold">{solarDuration}h</span>
              </div>
              <input
                type="range"
                min="1"
                max="24"
                value={solarDuration}
                onChange={(e) => setSolarDuration(e.target.value)}
                className="eco-slider"
              />
            </div>
          </div>

          {/* Wind Specs Card */}
          <div className="glass-card space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 border-b border-emerald-500/10 pb-2">
              <Wind className="h-4.5 w-4.5 text-cyan-400" /> Wind Specs
            </h3>
            <div>
              <label className="block text-gray-400 font-semibold mb-1">Turbine Capacity (kW)</label>
              <input
                type="number"
                value={windCapacity}
                onChange={(e) => setWindCapacity(e.target.value)}
                className="w-full p-2 bg-black/40 border border-emerald-500/10 rounded-xl text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-gray-400 font-semibold mb-1">Wind Speed (m/s)</label>
              <input
                type="number"
                step="0.1"
                value={windSpeed}
                onChange={(e) => setWindSpeed(e.target.value)}
                className="w-full p-2 bg-black/40 border border-emerald-500/10 rounded-xl text-white text-xs"
              />
            </div>
            {/* Wind Time Bar */}
            <div>
              <div className="flex justify-between text-gray-400 font-semibold mb-1">
                <span>Active Target (Hours)</span>
                <span className="text-emerald-400 font-bold">{windDuration}h</span>
              </div>
              <input
                type="range"
                min="1"
                max="24"
                value={windDuration}
                onChange={(e) => setWindDuration(e.target.value)}
                className="eco-slider"
              />
            </div>
          </div>

          {/* Water Specs Card */}
          <div className="glass-card space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 border-b border-emerald-500/10 pb-2">
              <Droplets className="h-4.5 w-4.5 text-blue-400" /> Water Hydro Specs
            </h3>
            <div>
              <label className="block text-gray-400 font-semibold mb-1">Flow Rate (m³/s)</label>
              <input
                type="number"
                step="0.1"
                value={flowRate}
                onChange={(e) => setFlowRate(e.target.value)}
                className="w-full p-2 bg-black/40 border border-emerald-500/10 rounded-xl text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-gray-400 font-semibold mb-1">Head Height (meters)</label>
              <input
                type="number"
                value={headHeight}
                onChange={(e) => setHeadHeight(e.target.value)}
                className="w-full p-2 bg-black/40 border border-emerald-500/10 rounded-xl text-white text-xs"
              />
            </div>
            <div className="pt-2 text-[10px] text-gray-400 italic">
              Uses continuous water flow kinetic energy for electricity generation.
            </div>
          </div>

          {/* Biogas Specs Card */}
          <div className="glass-card space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 border-b border-emerald-500/10 pb-2">
              <Trash2 className="h-4.5 w-4.5 text-lime-400" /> Biogas Specs
            </h3>
            <div>
              <label className="block text-gray-400 font-semibold mb-1">Waste Feedstock (kg/day)</label>
              <input
                type="number"
                value={wasteFeedstock}
                onChange={(e) => setWasteFeedstock(e.target.value)}
                className="w-full p-2 bg-black/40 border border-emerald-500/10 rounded-xl text-white text-xs"
              />
            </div>
            <div className="pt-2 text-[10px] text-gray-400 leading-normal">
              Converts food waste or biomass feedstock into methane heating energy and grid power offsets.
            </div>
          </div>

        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all border border-emerald-400/20 cursor-pointer text-xs"
        >
          {loading ? "Modeling clean energy metrics..." : "Predict Solar, Wind, Water & Biogas Outputs"}
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Solar Outputs */}
              <div className="bg-black/20 p-4 rounded-2xl border border-emerald-500/5 space-y-3">
                <h4 className="font-bold text-white flex items-center gap-1.5 border-b border-emerald-500/10 pb-2">
                  <Sun className="h-4.5 w-4.5 text-amber-400" /> Solar Projections
                </h4>
                <div className="flex justify-between">
                  <span className="text-gray-400">Daily Gen:</span>
                  <span className="font-bold text-white">{result.solar.daily_generation_kwh} kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Annual Offset:</span>
                  <span className="font-bold text-emerald-400">{(result.solar.annual_carbon_offset_kg / 1000.0).toFixed(1)} t</span>
                </div>
              </div>

              {/* Wind Outputs */}
              <div className="bg-black/20 p-4 rounded-2xl border border-emerald-500/5 space-y-3">
                <h4 className="font-bold text-white flex items-center gap-1.5 border-b border-emerald-500/10 pb-2">
                  <Wind className="h-4.5 w-4.5 text-cyan-400" /> Wind Projections
                </h4>
                <div className="flex justify-between">
                  <span className="text-gray-400">Daily Gen:</span>
                  <span className="font-bold text-white">{result.wind.daily_generation_kwh} kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Annual Offset:</span>
                  <span className="font-bold text-cyan-400">{(result.wind.annual_carbon_offset_kg / 1000.0).toFixed(1)} t</span>
                </div>
              </div>

              {/* Water Outputs */}
              <div className="bg-black/20 p-4 rounded-2xl border border-emerald-500/5 space-y-3">
                <h4 className="font-bold text-white flex items-center gap-1.5 border-b border-emerald-500/10 pb-2">
                  <Droplets className="h-4.5 w-4.5 text-blue-400" /> Hydro Projections
                </h4>
                <div className="flex justify-between">
                  <span className="text-gray-400">Daily Gen:</span>
                  <span className="font-bold text-white">{result.water.daily_generation_kwh} kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Annual Offset:</span>
                  <span className="font-bold text-blue-400">{(result.water.annual_carbon_offset_kg / 1000.0).toFixed(1)} t</span>
                </div>
              </div>

              {/* Biogas Outputs */}
              <div className="bg-black/20 p-4 rounded-2xl border border-emerald-500/5 space-y-3">
                <h4 className="font-bold text-white flex items-center gap-1.5 border-b border-emerald-500/10 pb-2">
                  <Trash2 className="h-4.5 w-4.5 text-lime-400" /> Biogas Projections
                </h4>
                <div className="flex justify-between">
                  <span className="text-gray-400">Daily Gen:</span>
                  <span className="font-bold text-white">{result.biogas.daily_generation_kwh} kWh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Annual Offset:</span>
                  <span className="font-bold text-lime-400">{(result.biogas.annual_carbon_offset_kg / 1000.0).toFixed(1)} t</span>
                </div>
              </div>
            </div>

            {/* Combined equivalent */}
            <div className="p-4 bg-emerald-950/10 rounded-xl border border-emerald-500/10 flex items-center gap-3">
              <span className="text-2xl">🌱</span>
              <div>
                <h4 className="font-bold text-white mb-0.5">Total Ecological Equivalence</h4>
                <p className="text-gray-400 leading-normal">
                  The combined solar, wind, water, and biogas setups yield offset values equivalent to planting <strong className="text-emerald-400 font-bold">{
                    parseInt(result.solar.equivalent_trees_planted) + 
                    parseInt(result.wind.equivalent_trees_planted) + 
                    parseInt(result.water.equivalent_trees_planted) + 
                    parseInt(result.biogas.equivalent_trees_planted)
                  }</strong> mature trees annually.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-12">
            <Sun className="h-12 w-12 text-emerald-500/30 animate-bounce mb-3" />
            <h3 className="text-sm font-bold text-white">Renewable Modeling Offline</h3>
            <p className="text-xs text-gray-400 max-w-sm mt-1">Configure renewable specifications above to compute predicted outcomes.</p>
          </div>
        )}
      </div>
    </div>
  );
}
