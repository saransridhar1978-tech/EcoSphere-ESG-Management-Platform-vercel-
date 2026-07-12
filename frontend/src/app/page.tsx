"use client";
import React, { useState, useEffect } from 'react';
import { useApp } from './AppContext';
import { 
  TrendingUp, 
  Download, 
  Cpu, 
  Globe, 
  Clock, 
  Camera, 
  Star, 
  MessageSquare, 
  CheckCircle,
  MapPin,
  Sparkles
} from 'lucide-react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale,
  ArcElement
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale,
  ArcElement
);

export default function Dashboard() {
  const { user, ecoCoins, userXp } = useApp();
  const [esgData, setEsgData] = useState({
    overall_esg_score: 84.5,
    environmental_score: 81.2,
    social_score: 88.0,
    governance_score: 84.3,
    carbon_reduction_ytd: "12.4%",
    active_employees_gamified: 184,
    compliance_status: "92%"
  });

  const [activities, setActivities] = useState([
    { id: 1, type: "Carbon Offset", desc: "Installed 120 kW solar capacity", date: "Just now", impact: "+5.4 ESG pts" },
    { id: 2, type: "Supply Chain", desc: "EcoBox packaging audit initiated", date: "2 hours ago", status: "In progress" },
    { id: 3, type: "Governance", desc: "Anti-bribery policy draft approved", date: "1 day ago", impact: "G-rating increase" }
  ]);

  const [currentTime, setCurrentTime] = useState('');
  useEffect(() => {
    setCurrentTime(new Date().toLocaleString());
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Campus Photo & Review State
  const [reviews, setReviews] = useState([
    { id: 1, name: "Saran S", comment: "The solar panels are looking great and we saved 400 kWh today!", rating: 5, photo: "/images/eco_thriving_city.png" },
    { id: 2, name: "Worker Rajesh", comment: "Cleaned the local lawn and shut down water pumps on time.", rating: 4, photo: "/images/challenge_tree_planting.png" }
  ]);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newPhotoName, setNewPhotoName] = useState('');

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment) return;
    const newRev = {
      id: Date.now(),
      name: user?.name || "Anonymous",
      comment: newComment,
      rating: newRating,
      photo: "/images/eco_thriving_city.png" // default mock photo
    };
    setReviews([newRev, ...reviews]);
    setNewComment('');
    setNewPhotoName('');
  };

  // Simulated fetching from backend on load
  useEffect(() => {
    const fetchESGSummary = async () => {
      try {
        const response = await fetch('http://localhost:8000/admin/reports');
        if (response.ok) {
          const reports = await response.json();
          if (reports.length > 0) {
            const latest = reports[0];
            setEsgData(prev => ({
              ...prev,
              overall_esg_score: latest.green_score,
              environmental_score: latest.details?.environmental_rating || prev.environmental_score
            }));
          }
        }
      } catch (e) {
        console.log("Using local mock data for dashboard");
      }
    };
    fetchESGSummary();
  }, []);

  const carbonChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Direct Smoke & Gas (from vehicles/machines)',
        data: [42, 45, 41, 44, 48, 50, 47],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Electricity Purchased (from power grids)',
        data: [25, 23, 24, 21, 20, 18, 17],
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const performanceChartData = {
    labels: ['2022', '2023', '2024', '2025', '2026 (YTD)'],
    datasets: [
      {
        label: 'ESG Overall Progress',
        data: [68, 72, 75, 81, 84.5],
        backgroundColor: '#10b981',
        borderRadius: 8
      }
    ]
  };

  // New Pie Chart Data for ESG Contributions
  const esgPieData = {
    labels: ['Environmental (E)', 'Social (S)', 'Governance (G)'],
    datasets: [
      {
        data: [esgData.environmental_score, esgData.social_score, esgData.governance_score],
        backgroundColor: [
          'rgba(16, 185, 129, 0.7)',
          'rgba(6, 182, 212, 0.7)',
          'rgba(244, 63, 94, 0.7)'
        ],
        borderColor: [
          '#10b981',
          '#06b6d4',
          '#f43f5e'
        ],
        borderWidth: 1.5
      }
    ]
  };

  const handleExport = () => {
    if (user?.id) {
      window.open(`http://localhost:8000/report/download?user_id=${user.id}`, '_blank');
    } else {
      alert("No active session found. Please log in first.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            Welcome back, <span className="text-emerald-400">{user?.name}</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1 font-medium">Here is your corporate ESG performance overview.</p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl transition-all border border-emerald-400/20 text-xs shadow-lg shadow-emerald-500/10 cursor-pointer"
        >
          <Download className="h-4 w-4" />
          Export ESG Report
        </button>
      </div>

      {/* Active Site Monitored Area */}
      <div className="glass-card grid grid-cols-1 md:grid-cols-3 gap-6 items-center border border-emerald-500/20 p-5 rounded-2xl relative overflow-hidden">
        <div className="md:col-span-2 space-y-3">
          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
            Live Monitoring Site
          </span>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-1.5">
            Silicon Valley Corporate Campus HQ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mt-2">
            <div className="p-3 bg-black/30 rounded-xl border border-emerald-500/5">
              <span className="text-gray-400 block font-semibold">Location Coordinates:</span>
              <span className="text-white font-bold block mt-0.5">37.7749° N, 122.4194° W</span>
            </div>
            <div className="p-3 bg-black/30 rounded-xl border border-emerald-500/5">
              <span className="text-gray-400 block font-semibold">Observation Time:</span>
              <span className="text-emerald-400 font-bold block mt-0.5">{currentTime}</span>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            This interactive dashboard combines real-time data feeds with AI-driven sustainability parameters to keep our organizational goals transparent and easily readable.
          </p>
        </div>
        <div className="md:col-span-1 rounded-xl overflow-hidden h-40 border border-emerald-500/10 relative">
          <img src="/images/eco_thriving_city.png" alt="Facility HQ Landscape" className="w-full h-full object-cover opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-3">
            <span className="text-white font-extrabold text-xs">HQ Active Smart Grid</span>
            <span className="text-emerald-400 text-[10px] font-medium mt-0.5">Renewable Microgrid: 94.5% Active</span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        <div className="glass-card border-l-4 border-l-emerald-400">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Overall ESG Score</span>
          <div className="text-3xl font-extrabold text-emerald-400 mt-1">{esgData.overall_esg_score} <span className="text-xs text-gray-400">/ 100</span></div>
          <div className="w-full bg-emerald-950 h-1.5 rounded-full mt-3">
            <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: `${esgData.overall_esg_score}%` }}></div>
          </div>
          <span className="text-[9px] text-emerald-400 font-bold block mt-2">🌟 Status: Excellent (Gold Level)</span>
        </div>

        <div className="glass-card border-l-4 border-l-cyan-400">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Carbon Reduction</span>
          <div className="text-3xl font-extrabold text-cyan-400 mt-1">{esgData.carbon_reduction_ytd}</div>
          <span className="text-[9px] text-cyan-400 font-bold flex items-center gap-1 mt-2">
            <TrendingUp className="h-3 w-3" /> 📉 Trend: Decreasing Fast (Good)
          </span>
        </div>

        <div className="glass-card border-l-4 border-l-amber-400">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Your Eco Coins</span>
          <div className="text-3xl font-extrabold text-amber-400 mt-1">{ecoCoins.toLocaleString()}</div>
          <span className="text-[9px] text-amber-400 font-bold block mt-2">🥇 Level {Math.floor(userXp/100) + 1} (Top 10% Rank)</span>
        </div>

        <div className="glass-card border-l-4 border-l-pink-400">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Compliance Level</span>
          <div className="text-3xl font-extrabold text-pink-400 mt-1">{esgData.compliance_status}</div>
          <span className="text-[9px] text-pink-400 font-bold block mt-2">⚠️ Alert: 1 policy review needed</span>
        </div>
      </div>

      {/* Row 1: ESG breakdown (with Pie Chart) & Carbon trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
        
        {/* ESG Breakdown + Pie Chart Card */}
        <div className="glass-card flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5 text-emerald-400" /> ESG Breakdown & Contributions
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              {/* Progress Bars */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-gray-400">Environmental (E)</span>
                    <span className="text-emerald-400 font-bold">{esgData.environmental_score}%</span>
                  </div>
                  <div className="w-full bg-emerald-950 h-1.5 rounded-full">
                    <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: `${esgData.environmental_score}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-gray-400">Social (S)</span>
                    <span className="text-cyan-400 font-bold">{esgData.social_score}%</span>
                  </div>
                  <div className="w-full bg-cyan-950 h-1.5 rounded-full">
                    <div className="bg-cyan-400 h-1.5 rounded-full" style={{ width: `${esgData.social_score}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-gray-400">Governance (G)</span>
                    <span className="text-rose-400 font-bold">{esgData.governance_score}%</span>
                  </div>
                  <div className="w-full bg-rose-950 h-1.5 rounded-full">
                    <div className="bg-rose-400 h-1.5 rounded-full" style={{ width: `${esgData.governance_score}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Pie Chart display */}
              <div className="h-32 flex justify-center items-center">
                <Pie 
                  data={esgPieData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false }
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-emerald-500/10">
            <span className="text-emerald-400 font-bold flex items-center gap-1.5 mb-1">
              <Cpu className="h-4 w-4" /> AI Diagnostics Core
            </span>
            <p className="text-gray-400">
              Your overall ESG score is boosted by social diversity achievements. High vehicle emissions remain a primary area for carbon offset improvements.
            </p>
          </div>
        </div>

        {/* Simplified scope graph */}
        <div className="glass-card lg:col-span-2">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-sm font-bold text-white">Simple Carbon Energy Chart (Smoke vs Electricity)</h3>
          </div>
          <span className="text-gray-400 text-[10px] block mb-3 font-semibold">
            📉 Green Line = Direct Smoke/Gas from vehicles. Blue Line = Electricity Purchased. Lower is Better & Saves Energy!
          </span>
          <div className="h-64">
            <Line 
              data={carbonChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#94a3b8', font: { size: 10 } } } },
                scales: {
                  x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } },
                  y: { grid: { color: 'rgba(16, 185, 129, 0.05)' }, ticks: { color: '#94a3b8', font: { size: 10 } } }
                }
              }} 
            />
          </div>
        </div>
      </div>

      {/* Row 2: Campus Photo Review Gallery & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        {/* Campus Photo & Review System */}
        <div className="glass-card space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Camera className="text-emerald-400 h-4.5 w-4.5" /> Campus Photo & Review Gallery
          </h3>
          <p className="text-gray-400 text-[11px]">Upload photos of the campus grid assets and review their clean maintenance status below.</p>
          
          <form onSubmit={handleAddReview} className="space-y-3 p-3.5 bg-black/25 rounded-xl border border-emerald-500/10">
            <div>
              <label className="block text-gray-400 mb-1 font-semibold">Review Comment</label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Describe current asset status (e.g. Lawn water sprinkler is off)..."
                className="w-full p-2 bg-black/40 border border-emerald-500/10 rounded-lg text-white text-[11px] focus:outline-none"
                rows={2}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3 items-center">
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Condition Rating</label>
                <select
                  value={newRating}
                  onChange={(e) => setNewRating(parseInt(e.target.value))}
                  className="w-full p-2 bg-black/40 border border-emerald-500/10 rounded-lg text-white text-[11px]"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (Excellent)</option>
                  <option value={4}>⭐⭐⭐⭐ (Good)</option>
                  <option value={3}>⭐⭐⭐ (Fair)</option>
                  <option value={2}>⭐⭐ (Poor)</option>
                  <option value={1}>⭐ (Bad)</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 mb-1 font-semibold">Upload Photo</label>
                <div className="relative border border-dashed border-emerald-500/20 bg-black/20 p-2 rounded-lg text-center cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setNewPhotoName(e.target.files[0].name);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <span className="text-[10px] text-gray-400 truncate block">
                    {newPhotoName ? newPhotoName : "Select Image File..."}
                  </span>
                </div>
              </div>
            </div>
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 font-bold py-2 rounded-lg text-[10px] text-white cursor-pointer transition-all border border-emerald-400/20">
              Submit Campus Review
            </button>
          </form>

          {/* List of Reviews */}
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {reviews.map((r) => (
              <div key={r.id} className="p-3 bg-black/20 rounded-xl border border-emerald-500/5 flex gap-3">
                <img src={r.photo} alt="Campus proof" className="w-14 h-14 rounded-lg object-cover border border-emerald-500/10 shrink-0" />
                <div className="space-y-1">
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-bold text-white">{r.name}</span>
                    <span className="text-amber-400 text-[10px]">
                      {"⭐".repeat(r.rating)}
                    </span>
                  </div>
                  <p className="text-gray-400 text-[11px] leading-relaxed">{r.comment}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sustainability Performance Graph */}
        <div className="glass-card">
          <h3 className="text-sm font-bold text-white mb-4">Sustainability Performance Graph</h3>
          <div className="h-64">
            <Bar 
              data={performanceChartData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } },
                  y: { grid: { color: 'rgba(16, 185, 129, 0.05)' }, ticks: { color: '#94a3b8', font: { size: 10 } } }
                }
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
