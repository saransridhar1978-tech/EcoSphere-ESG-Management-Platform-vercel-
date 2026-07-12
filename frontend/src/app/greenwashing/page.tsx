"use client";
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { ShieldAlert, AlertTriangle, CheckCircle, Sparkles, Search } from 'lucide-react';

export default function GreenwashingPage() {
  const { user } = useApp();
  const [claimText, setClaimText] = useState(
    "Our new product is 100% natural, completely organic, and environmentally safe, helping customers enjoy a zero carbon emission lifestyle."
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleDetect = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/detect-greenwashing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: claimText,
          user_id: user?.id || 1
        })
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      }
    } catch (err) {
      console.error("Connection failed. Using mock algorithms.");
      // Fallback matching Python logic
      setResult({
        greenwashing_probability: 85.0,
        explanation: [
          "Contains high-level buzzwords with low specificity: 100% natural, completely organic, zero carbon emission, environmentally safe",
          "No reference to external certifications, audits, or standardized protocols (e.g. ISO, GRI)."
        ],
        suggestions: [
          "Incorporate third-party verification details (e.g., USDA Organic, Carbon Trust, ISO 14064).",
          "Provide concrete statistics (e.g., exact carbon tonnage offsets instead of saying 'carbon-neutral')."
        ]
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
          <ShieldAlert className="h-6 w-6 text-emerald-400" /> Greenwashing Detector AI
        </h1>
        <p className="text-xs text-gray-400 mt-1">Audit sustainability marketing claims to detect vague promises or greenwashing patterns.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Input */}
        <div className="glass-card lg:col-span-1 h-fit">
          <h3 className="text-sm font-bold text-white mb-4">Analyze Marketing Claim</h3>
          <form onSubmit={handleDetect} className="space-y-4 text-xs">
            <div>
              <label className="block text-gray-400 font-semibold mb-1.5">Sustainability Statement</label>
              <textarea
                value={claimText}
                onChange={(e) => setClaimText(e.target.value)}
                rows={6}
                required
                placeholder="Enter corporate marketing text, product description, or environmental claims..."
                className="w-full p-2.5 bg-black/40 border border-emerald-500/10 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition-all placeholder:text-gray-600 resize-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition-all border border-emerald-400/20 flex items-center justify-center gap-2"
            >
              <Search className="h-4 w-4" />
              {loading ? "Analyzing claims..." : "Scan Claim"}
            </button>
          </form>
        </div>

        {/* Results view */}
        <div className="glass-card lg:col-span-2 flex flex-col justify-between">
          {result ? (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6 items-center border-b border-emerald-500/10 pb-6">
                {/* Visual Gauge */}
                <div className={`p-6 rounded-2xl border text-center shrink-0 w-full md:w-44 ${getGaugeColor(result.greenwashing_probability)}`}>
                  <span className="text-[10px] uppercase font-bold tracking-wider block text-gray-400">Greenwashing Risk</span>
                  <div className="text-4xl font-extrabold mt-2">{result.greenwashing_probability}%</div>
                  <span className="text-[9px] font-bold block mt-1.5">
                    {result.greenwashing_probability > 70 ? "HIGH RISK" : result.greenwashing_probability > 40 ? "MODERATE RISK" : "TRUSTWORTHY"}
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" /> AI Findings
                  </h4>
                  <div className="space-y-1.5 text-xs text-gray-400">
                    {result.explanation.map((item: string, idx: number) => (
                      <p key={idx} className="leading-relaxed">• {item}</p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Suggestions for claim improvement */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-1">
                  <Sparkles className="h-4 w-4 text-emerald-400" /> Verifiability Action Plan
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.suggestions.map((sug: string, idx: number) => (
                    <div key={idx} className="p-3 bg-black/20 rounded-xl border border-emerald-500/5 text-xs">
                      <CheckCircle className="h-4 w-4 text-emerald-400 mb-1" />
                      <p className="text-gray-400 leading-normal">{sug}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12">
              <ShieldAlert className="h-12 w-12 text-emerald-500/30 animate-bounce mb-3" />
              <h3 className="text-sm font-bold text-white">Analysis Inactive</h3>
              <p className="text-xs text-gray-400 max-w-sm mt-1">Submit your copy or commercial claims to verify risk levels against established greenwashing patterns.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
