"use client";
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Sparkles, Trophy, CheckSquare, Zap, RefreshCw, Award, MapPin } from 'lucide-react';

export default function EcoGiniPage() {
  const { user } = useApp();
  const [energy, setEnergy] = useState(4800);
  const [recycle, setRecycle] = useState(65);
  const [renewable, setRenewable] = useState(30);
  const [carbon, setCarbon] = useState(24.5);
  const [social, setSocial] = useState(85);
  const [gov, setGov] = useState(80);
  const [location, setLocation] = useState('Tamil Nadu, India'); // Default to Tamil Nadu, India
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>({
    overall_esg_score: 84.5,
    environmental_rating: 81.2,
    sustainability_level: "Gold",
    roadmap: [
      "Increase renewable energy contract capacity from current levels to target >40% by Year 1.",
      "Implement Zero-Waste policy in packaging procurement to hit 80% recycling rate by Q3."
    ]
  });

  const handleScore = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/calculate-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          energy_usage: energy,
          waste_recycle_rate: recycle,
          renewable_pct: renewable,
          carbon_emission: carbon,
          social_score: social,
          gov_score: gov,
          user_id: user?.id || 1
        })
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      }
    } catch (err) {
      console.error("Connection failed. Using mock algorithms.");
      const e_score = Math.max(10.0, Math.min(100.0, 60.0 + (recycle - 50.0) * 0.3 + renewable * 0.4 - carbon * 0.2));
      const overall = (e_score * 0.5) + (social * 0.25) + (gov * 0.25);
      let level = "Bronze";
      if (overall >= 85) level = "Platinum";
      else if (overall >= 70) level = "Gold";
      else if (overall >= 55) level = "Silver";
      
      setResult({
        overall_esg_score: overall.toFixed(1),
        environmental_rating: e_score.toFixed(1),
        sustainability_level: level,
        roadmap: [
          "Increase renewable energy contract capacity from current levels to target >40% by Year 1.",
          "Implement Zero-Waste policy in packaging procurement to hit 80% recycling rate by Q3."
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const getBadgeColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'platinum': return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
      case 'gold': return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
      case 'silver': return 'text-slate-300 border-slate-500/30 bg-slate-500/10';
      default: return 'text-amber-500 border-amber-500/30 bg-amber-500/10';
    }
  };

  const getLevelImage = (level: string) => {
    const lvl = level ? level.toLowerCase() : 'gold';
    if (lvl === 'platinum' || lvl === 'gold') {
      return "/images/eco_thriving_city.png";
    }
    return "/images/eco_deforested_land.png";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-emerald-400" /> Eco-Gini AI Sustainability Score
        </h1>
        <p className="text-xs text-gray-400 mt-1">Simulate corporate metrics to generate an audited ESG rating and structured improvement roadmap.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
        {/* Sliders Input Form */}
        <div className="glass-card lg:col-span-1 h-fit space-y-4">
          <h3 className="text-sm font-bold text-white mb-4">Organization Metrics</h3>
          <form onSubmit={handleScore} className="space-y-4">
            <div>
              <label className="block text-gray-400 font-semibold mb-1.5 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-emerald-400" /> Audit Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2.5 bg-black/40 border border-emerald-500/10 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-xs"
                placeholder="e.g. Tamil Nadu, India"
              />
            </div>

            <div>
              <div className="flex justify-between text-gray-400 font-semibold mb-1">
                <span>Energy Usage</span>
                <span className="text-emerald-400 font-bold">{energy} kWh</span>
              </div>
              <input
                type="range"
                min="1000"
                max="10000"
                value={energy}
                onChange={(e) => setEnergy(parseInt(e.target.value))}
                className="eco-slider"
              />
            </div>

            <div>
              <div className="flex justify-between text-gray-400 font-semibold mb-1">
                <span>Waste Recycle Rate</span>
                <span className="text-emerald-400 font-bold">{recycle}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={recycle}
                onChange={(e) => setRecycle(parseInt(e.target.value))}
                className="eco-slider"
              />
            </div>

            <div>
              <div className="flex justify-between text-gray-400 font-semibold mb-1">
                <span>Renewable Energy Share</span>
                <span className="text-emerald-400 font-bold">{renewable}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={renewable}
                onChange={(e) => setRenewable(parseInt(e.target.value))}
                className="eco-slider"
              />
            </div>

            <div>
              <div className="flex justify-between text-gray-400 font-semibold mb-1">
                <span>Carbon Emission Intensity</span>
                <span className="text-emerald-400 font-bold">{carbon} tCO2e</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="0.5"
                value={carbon}
                onChange={(e) => setCarbon(parseFloat(e.target.value))}
                className="eco-slider"
              />
            </div>

            <div>
              <div className="flex justify-between text-gray-400 font-semibold mb-1">
                <span>Social Responsibility Score</span>
                <span className="text-emerald-400 font-bold">{social}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={social}
                onChange={(e) => setSocial(parseInt(e.target.value))}
                className="eco-slider"
              />
            </div>

            <div>
              <div className="flex justify-between text-gray-400 font-semibold mb-1">
                <span>Governance Integrity Score</span>
                <span className="text-emerald-400 font-bold">{gov}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={gov}
                onChange={(e) => setGov(parseInt(e.target.value))}
                className="eco-slider"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition-all border border-emerald-400/20 cursor-pointer"
            >
              {loading ? "Re-calculating ESG score..." : "Generate AI ESG Audit"}
            </button>
          </form>
        </div>

        {/* Results Panel */}
        <div className="glass-card lg:col-span-2 space-y-6">
          {result ? (
            <div className="space-y-6 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Award className="text-emerald-400" /> Audit Results Summary
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-emerald-400" /> Audited Location: <strong>{location}</strong>
                  </p>
                </div>
                
                <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border ${getBadgeColor(result.sustainability_level)}`}>
                  {result.sustainability_level} Achievement Level
                </span>
              </div>

              {/* Real Google Maps embed for target location */}
              <div className="rounded-xl overflow-hidden border border-emerald-500/10 h-48 bg-black/40 relative">
                <iframe
                  title="Google Map Location View"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(location)}&t=&z=8&ie=UTF8&iwloc=&output=embed`}
                  className="w-full h-full border-none opacity-80"
                  allowFullScreen
                ></iframe>
                <div className="absolute top-2 left-2 bg-black/85 px-2.5 py-1 rounded-lg text-[9px] text-emerald-400 font-bold border border-emerald-500/20">
                  🗺️ Google Maps Location Feed Active
                </div>
              </div>

              {/* Dynamic Interactive Landscape Image */}
              <div className="relative rounded-2xl overflow-hidden border border-emerald-500/10 bg-black/40 h-48 flex items-center justify-center">
                <img 
                  src={getLevelImage(result.sustainability_level)} 
                  alt="Sustainability Level Representation" 
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 to-transparent flex flex-col justify-end p-4">
                  <h4 className="font-extrabold text-xs text-white">Interactive Environmental State</h4>
                  <p className="text-gray-300 text-[10px] mt-0.5">
                    {result.sustainability_level.toLowerCase() === 'platinum' || result.sustainability_level.toLowerCase() === 'gold'
                      ? "Lush green indicators reflect a sustainable, high-performing corporate ecosphere."
                      : "Warning: High carbon outputs and waste footprints represent a decaying ecosystem."
                    }
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-950/20 rounded-xl border border-emerald-500/10 text-center">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Overall ESG Rating</span>
                  <div className="text-3xl font-extrabold text-emerald-400 mt-1">{result.overall_esg_score} <span className="text-xs text-gray-400">/ 100</span></div>
                </div>

                <div className="p-4 bg-emerald-950/20 rounded-xl border border-emerald-500/10 text-center">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Environmental (E) Rating</span>
                  <div className="text-3xl font-extrabold text-emerald-400 mt-1">{result.environmental_rating}%</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <CheckSquare className="text-emerald-400 h-4.5 w-4.5" /> AI Recommended Compliance Roadmap
                </h4>
                <div className="space-y-2">
                  {result.roadmap.map((step: string, idx: number) => (
                    <div key={idx} className="p-3 bg-black/20 rounded-xl border border-emerald-500/5 flex gap-2">
                      <Zap className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <p className="text-gray-300 leading-normal">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12">
              <Sparkles className="h-12 w-12 text-emerald-500/30 animate-bounce mb-3" />
              <h3 className="text-sm font-bold text-white">Simulator Ready</h3>
              <p className="text-xs text-gray-400 max-w-sm mt-1">Configure your organization parameters on the left to simulate audited ratings.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
