"use client";
import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { Trees, ShieldAlert, Sparkles, Clock, Target, Gift, DollarSign, Tag, Layers, TrendingUp } from 'lucide-react';

export default function TreePage() {
  const { user } = useApp();
  const [treeCount, setTreeCount] = useState(10); 
  const [category, setCategory] = useState('Timber'); // Tree Category
  const [treeType, setTreeType] = useState('Teak'); // Tree Variety
  const [days, setDays] = useState(1825); // Default to 5 Years (1825 days)
  
  const [targetTimeframe, setTargetTimeframe] = useState('Week'); 
  const [targetCount, setTargetCount] = useState(50);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>({
    annual_co2_absorption_kg: 200,
    total_co2_absorption_kg: 1000,
    environmental_impact_rating: 35,
    equivalent_car_miles_saved: 2400
  });

  // Expanded Tree category, variety, current market price and future predicted prices mapping
  const treeDatabase: Record<string, { 
    name: string; 
    info: string; 
    factor: number; // carbon absorption factor
    currentMarketPrice: string; // actual market price description
    baseCurrentVal: number; // base value in rupees today per tree
    predicted5YrVal: number; // predicted value after 5 years per tree
    predicted10YrVal: number; // predicted value after 10 years per tree
    isAnnualAgri: boolean; // if returns are annual harvests instead of single-cut timber
  }[]> = {
    Timber: [
      { name: 'Teak', info: 'Premium high-density hard wood log. Highly demanded for luxury furniture.', factor: 20, currentMarketPrice: '₹2,500 per cubic feet', baseCurrentVal: 4000, predicted5YrVal: 10000, predicted10YrVal: 18000, isAnnualAgri: false },
      { name: 'Mahogany', info: 'Durable reddish-brown commercial timber, popular in global markets.', factor: 18, currentMarketPrice: '₹1,800 per cubic feet', baseCurrentVal: 3000, predicted5YrVal: 8000, predicted10YrVal: 15000, isAnnualAgri: false },
      { name: 'Sandalwood', info: 'Highly valued aromatic heartwood used in cosmetics and pharmaceuticals.', factor: 14, currentMarketPrice: '₹12,000 per kg', baseCurrentVal: 25000, predicted5YrVal: 75000, predicted10YrVal: 150000, isAnnualAgri: false },
      { name: 'Rosewood', info: 'Heavy, dark timber with elegant grain used for musical instruments.', factor: 17, currentMarketPrice: '₹3,500 per cubic feet', baseCurrentVal: 6000, predicted5YrVal: 18000, predicted10YrVal: 35000, isAnnualAgri: false }
    ],
    Agriculture: [
      { name: 'Mango (Alphonso)', info: 'Vibrant export fruit yield. Harvest cycles begin from Year 4-5.', factor: 15, currentMarketPrice: '₹150 per kg (Fruit harvest)', baseCurrentVal: 1200, predicted5YrVal: 2500, predicted10YrVal: 6000, isAnnualAgri: true },
      { name: 'Coconut (Tall)', info: 'Continuous crop yield of copra, oil, and coconut coir fibers.', factor: 16, currentMarketPrice: '₹40 per nut', baseCurrentVal: 1000, predicted5YrVal: 3000, predicted10YrVal: 7500, isAnnualAgri: true },
      { name: 'Jackfruit', info: 'Heavy yielding fibrous fruit, logs hold high timber value at end-of-life.', factor: 19, currentMarketPrice: '₹80 per kg (Fruit)', baseCurrentVal: 800, predicted5YrVal: 2800, predicted10YrVal: 5500, isAnnualAgri: true },
      { name: 'Amla (Gooseberry)', info: 'Rich vitamin C medicinal fruit harvest. Hard-wearing wild crops.', factor: 12, currentMarketPrice: '₹120 per kg', baseCurrentVal: 600, predicted5YrVal: 2000, predicted10YrVal: 4200, isAnnualAgri: true }
    ],
    Medicinal_Bio: [
      { name: 'Neem', info: 'Natural pest controller and high grade organic leaf extract seller.', factor: 22, currentMarketPrice: '₹200 per kg (Seeds/Oil)', baseCurrentVal: 500, predicted5YrVal: 1500, predicted10YrVal: 3500, isAnnualAgri: true },
      { name: 'Moringa (Drumstick)', info: 'Superfood foliage and drumstick pods. Fast cash crop cycles.', factor: 24, currentMarketPrice: '₹60 per kg', baseCurrentVal: 400, predicted5YrVal: 1800, predicted10YrVal: 3000, isAnnualAgri: true },
      { name: 'Eucalyptus', info: 'Fast growing pulp wood logs, used extensively in paper mills.', factor: 21, currentMarketPrice: '₹9,000 per ton (Pulp)', baseCurrentVal: 1100, predicted5YrVal: 3500, predicted10YrVal: 6000, isAnnualAgri: false }
    ]
  };

  // Adjust selected tree variety if category changes
  useEffect(() => {
    if (treeDatabase[category]) {
      setTreeType(treeDatabase[category][0].name);
    }
  }, [category]);

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
          years: Math.max(1, Math.round(days / 365.0)), 
          user_id: user?.id || 1
        })
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      }
    } catch (err) {
      console.error("Simulation connection failed. Calculating locally.");
      const currentList = treeDatabase[category] || [];
      const treeObj = currentList.find(t => t.name === treeType) || { factor: 20 };
      const annual = treeCount * treeObj.factor;
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

  const getActiveTreeDetails = () => {
    const currentList = treeDatabase[category] || [];
    return currentList.find(t => t.name === treeType) || currentList[0];
  };

  // Calculate predicted future price value per tree
  const getPredictedPerTreePrice = () => {
    const years = days / 365.0;
    const details = getActiveTreeDetails();
    if (years >= 10) {
      return details.predicted10YrVal;
    } else if (years >= 5) {
      return details.predicted5YrVal;
    } else {
      // Linear interpolation between base current value and 5 year value
      const slope = (details.predicted5YrVal - details.baseCurrentVal) / 5.0;
      return Math.round(details.baseCurrentVal + (years * slope));
    }
  };

  // Calculate yield value in INR based on duration
  const getTeakWoodYield = () => {
    const years = days / 365.0;
    const details = getActiveTreeDetails();
    let ratePerTree = 0;
    if (years >= 10) {
      ratePerTree = details.predicted10YrVal;
    } else if (years >= 5) {
      ratePerTree = details.predicted5YrVal;
    } else {
      ratePerTree = Math.max(100, Math.round(years * (details.predicted5YrVal / 5.0)));
    }
    return treeCount * ratePerTree;
  };

  const calculateEcoCoinsReward = () => {
    const timeMultiplier = targetTimeframe === 'Day' ? 12 : targetTimeframe === 'Week' ? 6 : targetTimeframe === 'Month' ? 3 : 1;
    return Math.round(targetCount * timeMultiplier * 1.5);
  };

  const scale = Math.min(2.5, 0.5 + (days * 0.0005) + (treeCount * 0.0005));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <Trees className="h-6 w-6 text-emerald-400" /> Tree Plantation Impact Simulator
        </h1>
        <p className="text-xs text-gray-400 mt-1">Simulate tree plantation projects to model ecological benefits and timber/agri commercial values.</p>
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
                min="5" 
                max="1000"
                value={treeCount}
                onChange={(e) => setTreeCount(parseInt(e.target.value))}
                className="eco-slider"
              />
            </div>

            <div>
              <div className="flex justify-between text-gray-400 font-semibold mb-1">
                <span>Simulation Duration (Days / Years)</span>
                <span className="text-emerald-400 font-bold">
                  {days} Days (~{(days / 365.0).toFixed(1)} Years)
                </span>
              </div>
              <input
                type="range"
                min="5" 
                max="5475" // Slider scale up to 15 years
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value))}
                className="eco-slider"
              />
            </div>

            {/* Category Selector */}
            <div>
              <label className="block text-gray-400 font-semibold mb-1.5 flex items-center gap-1">
                <Tag className="h-3.5 w-3.5 text-emerald-400" /> Tree Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 bg-black/40 border border-emerald-500/10 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-xs"
              >
                <option value="Timber" className="bg-[#091612] text-white">Timber / Commercial Wood</option>
                <option value="Agriculture" className="bg-[#091612] text-white">Agriculture / Fruits</option>
                <option value="Medicinal_Bio" className="bg-[#091612] text-white">Medicinal / Bio-Offsets</option>
              </select>
            </div>

            {/* Variety Selector */}
            <div>
              <label className="block text-gray-400 font-semibold mb-1.5 flex items-center gap-1">
                <Layers className="h-3.5 w-3.5 text-emerald-400" /> Tree Variety
              </label>
              <select
                value={treeType}
                onChange={(e) => setTreeType(e.target.value)}
                className="w-full p-2.5 bg-black/40 border border-emerald-500/10 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-xs"
              >
                {(treeDatabase[category] || []).map((t) => (
                  <option key={t.name} value={t.name} className="bg-[#091612] text-white">
                    {t.name}
                  </option>
                ))}
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
          
          {/* Detailed Market Pricing Projections Panel */}
          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl space-y-4">
            <h4 className="font-bold text-amber-400 flex items-center gap-1.5 border-b border-amber-500/10 pb-2">
              <TrendingUp className="h-4.5 w-4.5" /> Market Price Yields & Future Forecast (INR)
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-black/30 rounded-xl border border-amber-500/10">
                <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Actual Current Market Rate</span>
                <span className="text-white font-bold block mt-1">{getActiveTreeDetails().currentMarketPrice}</span>
                <span className="text-gray-400 text-[10px] mt-2 block">
                  Est. base value today: <strong>₹{getActiveTreeDetails().baseCurrentVal.toLocaleString()} / tree</strong>
                </span>
                <span className="text-amber-400 font-bold block mt-1 text-sm">
                  Total Current Asset Value: ₹{(treeCount * getActiveTreeDetails().baseCurrentVal).toLocaleString()}
                </span>
              </div>

              <div className="p-3 bg-black/30 rounded-xl border border-amber-500/10">
                <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Predicted Future Value ({Math.round(days/365.0)} Years)</span>
                <span className="text-white font-bold block mt-1">₹{getPredictedPerTreePrice().toLocaleString()} / tree</span>
                <span className="text-emerald-400 font-bold block mt-2 text-sm">
                  Total Future Predicted Value: ₹{(treeCount * getPredictedPerTreePrice()).toLocaleString()}
                </span>
                <span className="text-gray-400 text-[9px] block mt-1">
                  Net Predicted Gain: +₹{((getPredictedPerTreePrice() - getActiveTreeDetails().baseCurrentVal) * treeCount).toLocaleString()}
                </span>
              </div>
            </div>
            
            <p className="text-gray-300 text-[10px] leading-relaxed">
              <strong>Info:</strong> {getActiveTreeDetails().info} {getActiveTreeDetails().isAnnualAgri ? "These agricultural assets provide periodic harvesting revenues beginning from year 4." : "These timber assets represent final harvest commercial payouts."}
            </p>
          </div>

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
