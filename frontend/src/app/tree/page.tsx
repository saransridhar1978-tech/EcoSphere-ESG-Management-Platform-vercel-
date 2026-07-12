"use client";
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Trees, ShieldAlert, Sparkles, Clock, Target, Gift } from 'lucide-react';

export default function TreePage() {
  const { user } = useApp();
  const [treeCount, setTreeCount] = useState(5); // Start tree count from 5
  const [treeType, setTreeType] = useState('Mangrove');
  const [days, setDays] = useState(5); // Start duration from 5 days
  
  const [targetTimeframe, setTargetTimeframe] = useState('Week'); 
  const [targetCount, setTargetCount] = useState(50);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>({
    annual_co2_absorption_kg: 125,
    total_co2_absorption_kg: 625,
    environmental_impact_rating: 15,
    equivalent_car_miles_saved: 1500
  });

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/tree-impact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tree_count: treeCount,
          tree_type: treeType,
          years: Math.max(1, Math.round(days / 365.0)), // convert days to years for backend format
          user_id: user?.id || 1
        })
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      }
    } catch (err) {
      console.error("Simulation connection failed. Calculating locally.");
      const factor = treeType === 'Mangrove' ? 25.0 : treeType === 'Oak' ? 22.0 : 18.0;
      const annual = treeCount * factor;
      const total = (annual * days) / 365.0;
      setResult({
        annual_co2_absorption_kg: annual,
        total_co2_absorption_kg: total,
        environmental_impact_rating: Math.min(100.0, treeCount * 0.5 + (days / 10.0)),
        equivalent_car_miles_saved: total * 2.4
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateEcoCoinsReward = () => {
    const timeMultiplier = targetTimeframe === 'Day' ? 12 : targetTimeframe === 'Week' ? 6 : targetTimeframe === 'Month' ? 3 : 1;
    const treeMultiplier = treeType === 'Mangrove' ? 1.5 : treeType === 'Oak' ? 1.2 : 1.0;
    return Math.round(targetCount * timeMultiplier * treeMultiplier);
  };

  const scale = Math.min(2.5, 0.5 + (days * 0.005) + (treeCount * 0.005));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <Trees className="h-6 w-6 text-emerald-400" /> Tree Plantation Impact Simulator
        </h1>
        <p className="text-xs text-gray-400 mt-1 font-medium">Simulate tree plantation projects starting from 5 trees and 5 days duration modeling clean metrics.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
        {/* Input Parameters Form */}
        <div className="glass-card lg:col-span-1 h-fit space-y-6">
          <h3 className="text-sm font-bold text-white mb-4">Plantation Parameters</h3>
          <form onSubmit={handleSimulate} className="space-y-4">
            <div>
              <div className="flex justify-between text-gray-400 font-semibold mb-1">
                <span>Number of Trees</span>
                <span className="text-emerald-400 font-bold">{treeCount} trees</span>
              </div>
              <input
                type="range"
                min="5" // Start trees level from 5
                max="1000"
                value={treeCount}
                onChange={(e) => setTreeCount(parseInt(e.target.value))}
                className="eco-slider"
              />
            </div>

            <div>
              <div className="flex justify-between text-gray-400 font-semibold mb-1">
                <span>Simulation Duration (Days)</span>
                <span className="text-emerald-400 font-bold">{days} Days</span>
              </div>
              <input
                type="range"
                min="5" // Start duration level from 5 days
                max="365"
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value))}
                className="eco-slider"
              />
            </div>

            <div>
              <label className="block text-gray-400 font-semibold mb-1.5">Tree Species</label>
              <select
                value={treeType}
                onChange={(e) => setTreeType(e.target.value)}
                className="w-full p-2.5 bg-black/40 border border-emerald-500/10 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-xs"
              >
                <option value="Mangrove" className="bg-[#091612] text-white">Mangrove (High Carbon Capture - 25kg/yr)</option>
                <option value="Oak" className="bg-[#091612] text-white">Oak (Moderate Absorption - 22kg/yr)</option>
                <option value="Pine" className="bg-[#091612] text-white">Pine (Low Absorption - 18kg/yr)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition-all border border-emerald-400/20 cursor-pointer"
            >
              {loading ? "Simulating..." : "Run Simulation"}
            </button>
          </form>
        </div>

        {/* Projections & Target Recommendations Card */}
        <div className="glass-card lg:col-span-2 flex flex-col gap-6">
          {/* Target Planning & Recommendation */}
          <div className="bg-emerald-950/20 p-4 rounded-xl border border-emerald-500/20 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Target className="h-4.5 w-4.5 text-emerald-400" /> Active Plantation Target
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 font-semibold mb-1">Target Tree Count</label>
                <input
                  type="number"
                  value={targetCount}
                  onChange={(e) => setTargetCount(parseInt(e.target.value) || 0)}
                  className="w-full p-2 bg-black/40 border border-emerald-500/10 rounded-lg text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-semibold mb-1">Target Timeframe</label>
                <select
                  value={targetTimeframe}
                  onChange={(e) => setTargetTimeframe(e.target.value)}
                  className="w-full p-2 bg-black/40 border border-emerald-500/10 rounded-lg text-white text-xs"
                >
                  <option value="Day">Day</option>
                  <option value="Week">Week</option>
                  <option value="Month">Month</option>
                  <option value="Year">Year</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-emerald-500/10 border border-emerald-400/20 rounded-xl text-[11px] flex gap-2.5 items-start">
              <Gift className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-white">Gamification Suggestion & Reward</h4>
                <p className="text-gray-300 mt-0.5 leading-normal">
                  If you plant <strong className="text-white">{targetCount}</strong> trees of type <strong className="text-white">{treeType}</strong> in a <strong className="text-white">{targetTimeframe.toLowerCase()}</strong>, you will earn <strong className="text-amber-400 font-bold">{calculateEcoCoinsReward()} Eco Coins</strong> and increase your carbon capture target threshold!
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* SVG Tree Animation Card */}
            <div className="bg-black/30 border border-emerald-500/5 rounded-2xl p-6 h-60 flex items-center justify-center relative overflow-hidden">
              <div className="absolute top-4 left-4 text-xs font-bold text-gray-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-pulse" /> Growth Visualization
              </div>
              
              <svg 
                viewBox="0 0 100 100" 
                className="w-40 h-40 transition-transform duration-500 ease-out" 
                style={{ transform: `scale(${scale})` }}
              >
                {/* Trunk */}
                <rect x="47" y="60" width="6" height="30" fill="#78350f" rx="1" />
                {/* Leaves */}
                <circle cx="50" cy="50" r="16" fill="#047857" opacity="0.9" />
                <circle cx="42" cy="44" r="12" fill="#059669" opacity="0.8" />
                <circle cx="58" cy="44" r="12" fill="#10b981" opacity="0.8" />
                <circle cx="50" cy="36" r="10" fill="#34d399" opacity="0.75" />
              </svg>
            </div>

            {/* Calculations outputs */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">Projected Ecological Benefits</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-emerald-950/20 rounded-xl border border-emerald-500/10">
                  <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">Annual Capture</span>
                  <span className="text-lg font-black text-emerald-400 mt-1 block">{(result.annual_co2_absorption_kg / 1000.0).toFixed(2)} t CO2e</span>
                </div>

                <div className="p-3 bg-emerald-950/20 rounded-xl border border-emerald-500/10">
                  <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">Total Offset</span>
                  <span className="text-lg font-black text-emerald-400 mt-1 block">{(result.total_co2_absorption_kg / 1000.0).toFixed(2)} tonnes</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between border-b border-emerald-500/10 pb-2">
                  <span className="text-gray-400">Environmental Impact Rating:</span>
                  <span className="text-white font-bold">{result.environmental_impact_rating} / 100</span>
                </div>
                <div className="flex justify-between border-b border-emerald-500/10 pb-2">
                  <span className="text-gray-400">Equivalent Car Miles Saved:</span>
                  <span className="text-white font-bold">{result.equivalent_car_miles_saved.toLocaleString()} miles</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
