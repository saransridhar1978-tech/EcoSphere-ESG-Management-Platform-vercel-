"use client";
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { ShieldAlert, AlertTriangle, CheckCircle, Sparkles, Search, DollarSign, Edit } from 'lucide-react';

export default function GreenwashingPage() {
  const { user } = useApp();
  const [claimText, setClaimText] = useState(
    "Our new product is 100% natural, completely organic, and environmentally safe, helping customers enjoy a zero carbon emission lifestyle."
  );
  const [topic, setTopic] = useState('Solar Energy');
  const [cost, setCost] = useState('5000');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>({
    greenwashing_probability: 85.0,
    explanation: [
      "Contains high-level buzzwords with low specificity: 100% natural, completely organic, zero carbon emission, environmentally safe",
      "No reference to external certifications, audits, or standardized protocols (e.g. ISO, GRI)."
    ],
    suggestions: [
      "Incorporate third-party verification details (e.g., USDA Organic, Carbon Trust, ISO 14064).",
      "Provide concrete statistics (e.g., exact carbon tonnage offsets instead of saying 'carbon-neutral')."
    ],
    better_plan: "Better Plan Suggestion: Replace vague claims with: 'Our facility reduced energy footprint by 12% in Q1 verified under ISO 14001 certification.'",
    new_plan: "New Solar Plan (Budget: $5,000.00): Install a 4.2 kW solar panel grid on the warehouse roof. Expected annual offset: 4000 kg CO2. ROI: 4.2 Years."
  });

  const handleDetect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/detect-greenwashing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: claimText,
          topic: topic,
          cost: parseFloat(cost) || 0,
          user_id: user?.id || 1
        })
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      }
    } catch (err) {
      console.error("Connection failed. Using mock algorithms.");
      // Fallback matching python logic
      const probability = claimText.toLowerCase().includes("100%") ? 85.0 : 45.0;
      const budget = parseFloat(cost) || 0;
      setResult({
        greenwashing_probability: probability,
        explanation: [
          "Contains high-level buzzwords with low specificity.",
          "No reference to external certifications, audits, or standardized protocols."
        ],
        suggestions: [
          "Incorporate third-party verification details.",
          "Provide concrete statistics."
        ],
        better_plan: `Better Plan Suggestion: Replace vague claims with: 'Our facility in Tamil Nadu offsets 2,500 kg CO2e annually verified by external green audit.'`,
        new_plan: `New ${topic} Plan (Budget: $${budget.toLocaleString()}): Install custom ${topic.toLowerCase()} offsets. Expected annual offset: ${budget * 0.8} kg CO2. ROI: 5.5 Years.`
      });
    } finally {
      setLoading(false);
    }
  };

  const getGaugeColor = (prob: number) => {
    if (prob > 70) return 'text-red-400 border-red-500/30 bg-red-500/10';
    if (prob > 40) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-emerald-400" /> Greenwashing Detector & Plan Consultant
        </h1>
        <p className="text-xs text-gray-400 mt-1 font-medium">Verify sustainability statements and generate concrete, cost-conscious environmental improvement plans.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
        {/* Form Inputs */}
        <div className="glass-card lg:col-span-1 h-fit space-y-4">
          <h3 className="text-sm font-bold text-white mb-4">Plan & Claims Verification</h3>
          <form onSubmit={handleDetect} className="space-y-4">
            <div>
              <label className="block text-gray-400 font-semibold mb-1">Verify Marketing Claims Text</label>
              <textarea
                value={claimText}
                onChange={(e) => setClaimText(e.target.value)}
                className="w-full p-2.5 bg-black/40 border border-emerald-500/10 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-xs"
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 font-semibold mb-1">Target Sustainability Topic</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full p-2.5 bg-black/40 border border-emerald-500/10 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-xs"
              >
                <option value="Solar Energy">Solar Energy</option>
                <option value="Wind Energy">Wind Energy</option>
                <option value="Water Hydroelectric">Water Hydroelectric</option>
                <option value="Biogas Digester">Biogas Digester</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-400 font-semibold mb-1">Target Plan Cost / Budget ($)</label>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full p-2.5 bg-black/40 border border-emerald-500/10 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-xs"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition-all border border-emerald-400/20 cursor-pointer"
            >
              {loading ? "Analyzing plan & budget..." : "Verify & Generate Clean Plan"}
            </button>
          </form>
        </div>

        {/* Results display panel */}
        <div className="glass-card lg:col-span-2 space-y-6">
          {result ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="text-emerald-400 h-4.5 w-4.5" /> AI Consultant Report
                </h3>
                <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border ${getGaugeColor(result.greenwashing_probability)}`}>
                  {result.greenwashing_probability}% Greenwashing Risk
                </span>
              </div>

              {/* Explanations */}
              <div className="space-y-3">
                <h4 className="font-bold text-white flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4 text-amber-500" /> Claims Analysis
                </h4>
                <div className="space-y-2">
                  {result.explanation.map((exp: string, idx: number) => (
                    <div key={idx} className="p-3 bg-black/25 rounded-xl border border-emerald-500/5 text-gray-300">
                      {exp}
                    </div>
                  ))}
                </div>
              </div>

              {/* Better Plan / Changes in User's Plan */}
              {result.better_plan && (
                <div className="p-4 bg-emerald-950/20 rounded-xl border border-emerald-500/20 space-y-2">
                  <h4 className="font-bold text-white flex items-center gap-1.5">
                    <Edit className="text-emerald-400 h-4 w-4" /> Recommended Changes in Your Plan
                  </h4>
                  <p className="text-gray-300 leading-normal">{result.better_plan}</p>
                </div>
              )}

              {/* New Budget Plan */}
              {result.new_plan && (
                <div className="p-4 bg-cyan-950/20 rounded-xl border border-cyan-500/20 space-y-2">
                  <h4 className="font-bold text-white flex items-center gap-1.5">
                    <DollarSign className="text-cyan-400 h-4 w-4" /> Cost-conscious Plan Suggestion
                  </h4>
                  <p className="text-cyan-300 leading-normal font-semibold">{result.new_plan}</p>
                </div>
              )}

              {/* Suggestions list */}
              <div className="space-y-3">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <CheckCircle className="text-emerald-400 h-4.5 w-4.5" /> Guidelines for Genuine Marketing
                </h4>
                <div className="space-y-2">
                  {result.suggestions.map((sug: string, idx: number) => (
                    <div key={idx} className="p-3 bg-emerald-950/10 rounded-xl border border-emerald-500/10 flex gap-2 text-gray-300">
                      <Sparkles className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{sug}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12">
              <Search className="h-12 w-12 text-emerald-500/30 animate-bounce mb-3" />
              <h3 className="text-sm font-bold text-white">Consultant Offline</h3>
              <p className="text-xs text-gray-400 max-w-sm mt-1">Submit your sustainability statements and budget on the left to start claims verification audits.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
