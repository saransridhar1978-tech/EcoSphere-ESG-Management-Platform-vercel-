"use client";
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Trophy, Gift, Target, Shield, CheckCircle, RefreshCw, Award, ArrowUp, Star, MapPin, Camera, X } from 'lucide-react';

export default function GamificationPage() {
  const { user, ecoCoins, setEcoCoins, userXp, setUserXp } = useApp();
  const [claimedTasks, setClaimedTasks] = useState<number[]>([]);
  const [successMsg, setSuccessMsg] = useState('');
  
  // Verification Modal States
  const [activeTask, setActiveTask] = useState<any | null>(null);
  const [gpsCoords, setGpsCoords] = useState<{ lat: string; lng: string } | null>(null);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [proofImage, setProofImage] = useState<string>('');
  const [verifying, setVerifying] = useState(false);

  const tasks = [
    { id: 1, title: "Plant the Targeted Tree of the Week", desc: "Plant a Mangrove tree in the plantation simulator.", reward: 200, xp: 50, category: "Environmental", image: "/images/challenge_tree_planting.png" },
    { id: 2, title: "Clean the Local Lake Drive", desc: "Clean garbage and plastics around local water bodies.", reward: 350, xp: 100, category: "Social Welfare", image: "/images/challenge_lake_cleanup.png" },
    { id: 3, title: "Social Welfare Mentoring", desc: "Spend 2 hours mentoring underserved youths on green technology.", reward: 150, xp: 40, category: "Governance/Social", image: "/images/eco_thriving_city.png" },
    { id: 4, title: "Implement Biogas Waste Feedstock", desc: "Convert 50 kg of organic waste feedstock into biogas cooking fuel offsets.", reward: 250, xp: 75, category: "Biogas usage", image: "/images/eco_thriving_city.png" }
  ];

  const rewards = [
    { id: 101, title: "25% Off GreenStore Apparel", cost: 500, platform: "EcoStore Social Market" },
    { id: 102, title: "Free Organic Bamboo Water Bottle", cost: 800, platform: "Circular Bottle Co" },
    { id: 103, title: "Sponsor 5 Trees Offset Program", cost: 1000, platform: "GreenCanopy Global" }
  ];

  const initialLeaderboard = [
    { rank: 1, name: "EcoBox Solutions (You)", isUser: true, badge: "🌱 Reforester Pro", level: 3, xp: userXp, coins: ecoCoins },
    { rank: 2, name: "GreenTransit Corp", isUser: false, badge: "⚡ Green Fleet Master", level: 4, xp: 390, coins: 1800 },
    { rank: 3, name: "Apex Packaging", isUser: false, badge: "♻️ Circularity Guru", level: 2, xp: 180, coins: 950 },
    { rank: 4, name: "Acme Logistics", isUser: false, badge: "💡 Energy Saver", level: 1, xp: 95, coins: 400 }
  ];

  const getLeaderboard = () => {
    return initialLeaderboard
      .map(player => {
        if (player.isUser) {
          return {
            ...player,
            name: `${user?.name || "You"} (You)`,
            xp: userXp,
            coins: ecoCoins,
            level: Math.floor(userXp / 100) + 1
          };
        }
        return player;
      })
      .sort((a, b) => b.xp - a.xp)
      .map((player, index) => ({
        ...player,
        rank: index + 1
      }));
  };

  const handleClaim = (taskId: number, coinsReward: number, xpReward: number) => {
    if (claimedTasks.includes(taskId)) return;
    
    setClaimedTasks(prev => [...prev, taskId]);
    setEcoCoins(ecoCoins + coinsReward);
    setUserXp(userXp + xpReward);
    
    setSuccessMsg(`Proof verified! Gained +${coinsReward} Eco Coins & +${xpReward} XP!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleRedeem = (rewardId: number, cost: number, title: string) => {
    if (ecoCoins >= cost) {
      setEcoCoins(ecoCoins - cost);
      setSuccessMsg(`Redeemed: '${title}'! Claim code sent to email.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      alert("Insufficient Eco Coins! Earn more coins by completing weekly challenges.");
    }
  };

  const detectGps = () => {
    setIsDetectingGps(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsCoords({
            lat: position.coords.latitude.toFixed(6),
            lng: position.coords.longitude.toFixed(6)
          });
          setIsDetectingGps(false);
        },
        (error) => {
          // Fallback coordinate
          setGpsCoords({ lat: "12.971598", lng: "77.594562" });
          setIsDetectingGps(false);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
      setIsDetectingGps(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setProofImage(e.target.files[0].name);
    }
  };

  const submitVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gpsCoords || !proofImage) {
      alert("Please upload a proof image and capture the GPS coordinates.");
      return;
    }
    setVerifying(true);
    setTimeout(() => {
      handleClaim(activeTask.id, activeTask.reward, activeTask.xp);
      setVerifying(false);
      setActiveTask(null);
      setGpsCoords(null);
      setProofImage('');
    }, 1500); // Simulate audit verification
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <Trophy className="h-6 w-6 text-emerald-400" /> Eco Gamification Hub
        </h1>
        <p className="text-xs text-gray-400 mt-1">Engage in weekly sustainability challenges, rise on the global leaderboard, and redeem rewards.</p>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2 animate-pulse">
          <CheckCircle className="h-4.5 w-4.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Grid: Challenges and Redeem panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
        {/* Weekly Challenges */}
        <div className="glass-card lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Target className="text-emerald-400 h-4.5 w-4.5" /> Weekly Sustainability Challenges
          </h3>
          <div className="space-y-3">
            {tasks.map((t) => {
              const isClaimed = claimedTasks.includes(t.id);
              return (
                <div key={t.id} className="p-3.5 bg-black/20 rounded-xl border border-emerald-500/5 hover:border-emerald-500/10 flex justify-between items-center gap-4 transition-all">
                  <div className="flex gap-3 items-center">
                    {t.image && <img src={t.image} alt={t.title} className="w-12 h-12 rounded-xl object-cover shrink-0 border border-emerald-500/10" />}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">
                          {t.category}
                        </span>
                        <h4 className="font-bold text-white">{t.title}</h4>
                      </div>
                      <p className="text-gray-400 mt-1">{t.desc}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex flex-col items-end gap-2">
                    <div className="text-[10px] text-gray-400">
                      <span className="text-amber-400 font-bold">+{t.reward} Coins</span> | <span className="text-cyan-400 font-bold">+{t.xp} XP</span>
                    </div>
                    <button
                      disabled={isClaimed}
                      onClick={() => setActiveTask(t)}
                      className={`font-bold py-1.5 px-3 rounded-lg text-[10px] transition-all border ${
                        isClaimed
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 cursor-not-allowed'
                          : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500/30 text-white cursor-pointer'
                      }`}
                    >
                      {isClaimed ? "Completed" : "Complete Task"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Coin Marketplace */}
        <div className="glass-card flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
              <Gift className="text-emerald-400 h-4.5 w-4.5" /> Eco-Coins Marketplace
            </h3>
            <span className="text-gray-400 text-[10px]">Redeem accumulated coins on social marketing platforms.</span>
            
            <div className="bg-emerald-950/20 p-3 rounded-xl border border-emerald-500/10 text-center my-4">
              <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Wallet Balance</span>
              <span className="text-2xl font-black text-amber-400 mt-0.5 block">{ecoCoins.toLocaleString()} Eco Coins</span>
            </div>

            <div className="space-y-2.5">
              {rewards.map((r) => (
                <div key={r.id} className="p-2.5 bg-black/20 rounded-xl border border-emerald-500/5 flex justify-between items-center gap-2">
                  <div>
                    <h4 className="font-bold text-white">{r.title}</h4>
                    <p className="text-gray-500 text-[10px]">{r.platform}</p>
                  </div>
                  <button
                    onClick={() => handleRedeem(r.id, r.cost, r.title)}
                    className="bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 py-1 px-2.5 rounded-lg shrink-0 transition-all cursor-pointer"
                  >
                    {r.cost} Coins
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Leaderboard */}
      <div className="glass-card text-xs">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
          <Award className="text-emerald-400 h-4.5 w-4.5" /> Global Sustainability Leaderboard
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-emerald-500/10 text-gray-400 font-semibold">
                <th className="pb-3 w-16">Rank</th>
                <th className="pb-3">Competitor Organization</th>
                <th className="pb-3">Achievement Badge</th>
                <th className="pb-3">Level</th>
                <th className="pb-3">Total XP</th>
                <th className="pb-3 text-right">Coin Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-500/5 text-gray-300">
              {getLeaderboard().map((player) => (
                <tr key={player.name} className={`hover:bg-white/2 ${player.isUser ? 'bg-emerald-500/10' : ''}`}>
                  <td className="py-3 font-extrabold flex items-center gap-1.5 text-white">
                    {player.rank === 1 ? (
                      <span className="text-yellow-500">🏆</span>
                    ) : player.rank === 2 ? (
                      <span className="text-slate-300">🥈</span>
                    ) : player.rank === 3 ? (
                      <span className="text-amber-600">🥉</span>
                    ) : (
                      <span className="pl-1 text-gray-500">{player.rank}</span>
                    )}
                  </td>
                  <td className={`py-3 font-semibold ${player.isUser ? 'text-emerald-400' : 'text-white'}`}>
                    {player.name}
                  </td>
                  <td className="py-3">
                    <span className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold text-emerald-300">
                      {player.badge}
                    </span>
                  </td>
                  <td className="py-3 font-bold text-white">{player.level}</td>
                  <td className="py-3 font-bold text-cyan-400">{player.xp} XP</td>
                  <td className="py-3 text-right font-bold text-amber-400">{player.coins.toLocaleString()} Coins</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Proof Verification Modal */}
      {activeTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-gray-950 border border-emerald-500/30 p-6 rounded-2xl shadow-2xl relative">
            <button 
              onClick={() => { setActiveTask(null); setGpsCoords(null); setProofImage(''); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-all"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Shield className="h-4.5 w-4.5 text-emerald-400" /> Challenge Proof Verification
            </h3>
            <p className="text-[11px] text-gray-400 mb-4">
              To claim rewards for <strong>{activeTask.title}</strong>, upload a proof image and capture your active GPS geotag.
            </p>

            <form onSubmit={submitVerification} className="space-y-4 text-xs">
              {/* Photo Upload */}
              <div>
                <label className="block text-gray-400 font-semibold mb-1.5 flex items-center gap-1">
                  <Camera className="h-4 w-4 text-emerald-400" /> Photo Upload of Completed Task
                </label>
                <div className="relative border border-dashed border-emerald-500/20 bg-black/40 p-4 rounded-xl text-center">
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <span className="text-[11px] text-gray-400">
                    {proofImage ? `File Selected: ${proofImage}` : "Click to select or drag photo proof..."}
                  </span>
                </div>
              </div>

              {/* GPS Geotag */}
              <div>
                <label className="block text-gray-400 font-semibold mb-1.5 flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-emerald-400" /> GPS Geotag Verification
                </label>
                <div className="flex gap-2 items-center">
                  <button
                    type="button"
                    onClick={detectGps}
                    disabled={isDetectingGps}
                    className="bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/30 font-bold py-2 px-3 rounded-lg text-[10px] text-emerald-300 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <RefreshCw className={`h-3 w-3 ${isDetectingGps ? 'animate-spin' : ''}`} />
                    {isDetectingGps ? "Detecting..." : "Detect Location"}
                  </button>
                  <div className="flex-1 bg-black/40 border border-emerald-500/10 rounded-lg p-2 text-[10px] text-center min-h-[32px] flex items-center justify-center text-gray-400">
                    {gpsCoords ? (
                      <span className="text-emerald-400 font-bold flex items-center gap-1 justify-center">
                        <CheckCircle className="h-3.5 w-3.5" /> Lat: {gpsCoords.lat}, Lng: {gpsCoords.lng}
                      </span>
                    ) : (
                      "GPS coordinates not captured yet."
                    )}
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={verifying}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition-all border border-emerald-400/20 cursor-pointer disabled:opacity-50"
              >
                {verifying ? "Verifying proof audit..." : "Submit Proof Verification"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
