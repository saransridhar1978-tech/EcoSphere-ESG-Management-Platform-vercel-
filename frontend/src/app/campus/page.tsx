"use client";
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Flame, AlertTriangle, ShieldCheck, Cpu } from 'lucide-react';

export default function CampusPage() {
  const { user } = useApp();
  const [students, setStudents] = useState('2500');
  const [vehicles, setVehicles] = useState('320');
  const [waste, setWaste] = useState('1200');
  const [energy, setEnergy] = useState('15000');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>({
    aqi_index: 76.5,
    risk_level: "Moderate",
    solutions: [
      "Encourage student shuttle options, introduce e-bike rental points, or add electric vehicle chargers on campus.",
      "Introduce multi-category recycling bins across all academic buildings and ban single-use plastics in canteens."
    ]
  });

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/campus-predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          students: parseInt(students) || 0,
          vehicles: parseInt(vehicles) || 0,
          waste_generation_kg: parseFloat(waste) || 0,
          energy_kwh: parseFloat(energy) || 0,
          user_id: user?.id || 1
        })
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      }
    } catch (err) {
      console.error("Connection to predictor failed. Using mock algorithms.");
      const aqi = 25.0 + (parseInt(students) || 0) * 0.005 + (parseInt(vehicles) || 0) * 0.15 + (parseFloat(waste) || 0) * 0.02 + (parseFloat(energy) || 0) * 0.001;
      setResult({
        aqi_index: Math.min(150.0, aqi).toFixed(1),
        risk_level: aqi > 100 ? "Hazardous/High" : aqi > 60 ? "Moderate" : "Low",
        solutions: [
          "Encourage student shuttle options, introduce e-bike rental points, or add electric vehicle chargers on campus.",
          "Introduce multi-category recycling bins across all academic buildings and ban single-use plastics in canteens."
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    if (level.toLowerCase().includes('high') || level.toLowerCase().includes('hazard')) {
      return 'text-red-400 border-red-500/30 bg-red-500/10';
    }
    if (level.toLowerCase().includes('moderate')) {
      return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    }
    return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <Flame className="h-6 w-6 text-emerald-400" /> Campus Pollution Predictor
        </h1>
        <p className="text-xs text-gray-400 mt-1">Predict local campus pollution and environmental impact based on student density and operations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Inputs */}
        <div className="glass-card lg:col-span-1 h-fit">
          <h3 className="text-sm font-bold text-white mb-4">Input Data Parameters</h3>
          <form onSubmit={handlePredict} className="space-y-4 text-xs">
            <div>
              <label className="block text-gray-400 font-semibold mb-1">Student / Personnel Count</label>
              <input
                type="number"
                value={students}
                onChange={(e) => setStudents(e.target.value)}
                className="w-full p-2.5 bg-black/40 border border-emerald-500/10 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-gray-400 font-semibold mb-1">Daily Transit Vehicles</label>
              <input
                type="number"
                value={vehicles}
                onChange={(e) => setVehicles(e.target.value)}
                className="w-full p-2.5 bg-black/40 border border-emerald-500/10 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-gray-400 font-semibold mb-1">Waste Generated (kg/day)</label>
              <input
                type="number"
                value={waste}
                onChange={(e) => setWaste(e.target.value)}
                className="w-full p-2.5 bg-black/40 border border-emerald-500/10 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-gray-400 font-semibold mb-1">Energy Consumption (kWh/day)</label>
              <input
                type="number"
                value={energy}
                onChange={(e) => setEnergy(e.target.value)}
                className="w-full p-2.5 bg-black/40 border border-emerald-500/10 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition-all border border-emerald-400/20"
            >
              {loading ? "Calculating projections..." : "Predict Pollution Indices"}
            </button>
          </form>
        </div>

        {/* Prediction Results */}
        <div className="glass-card lg:col-span-2 flex flex-col justify-between">
          {result ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-950/20 p-4 rounded-xl border border-emerald-500/10 text-center">
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Projected AQI</span>
                  <div className="text-3xl font-extrabold text-emerald-400 mt-1">{result.aqi_index}</div>
                </div>

                <div className={`p-4 rounded-xl border text-center flex flex-col justify-center items-center ${getRiskColor(result.risk_level)}`}>
                  <AlertTriangle className="h-5 w-5 mb-1 shrink-0" />
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Risk Threshold</span>
                  <div className="text-lg font-black mt-0.5">{result.risk_level}</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Cpu className="h-4 w-4 text-emerald-400" /> AI Action Directives
                </h4>
                <div className="space-y-2.5">
                  {result.solutions.map((sol: string, idx: number) => (
                    <div key={idx} className="flex gap-3 text-xs p-3 bg-black/20 rounded-xl border border-emerald-500/5">
                      <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="text-gray-400 leading-normal">{sol}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12">
              <Flame className="h-12 w-12 text-emerald-500/30 animate-bounce mb-3" />
              <h3 className="text-sm font-bold text-white">Projections Offline</h3>
              <p className="text-xs text-gray-400 max-w-sm mt-1">Configure campus operational indicators on the left and run analysis to calculate local pollution projections.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
