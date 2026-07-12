"use client";
import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { ClipboardList, User, Clock, ShieldAlert, Sparkles, CheckCircle, PlusCircle, AlertCircle, HelpCircle } from 'lucide-react';

export default function WorkAllocationPage() {
  const { user, ecoCoins, setEcoCoins } = useApp();
  const [allocatedTasks, setAllocatedTasks] = useState([
    { id: 1, worker: "Rajesh Kumar", task: "Switch off the water motor pumps", time: "11:00 AM", status: "Pending", savings: 15, reward: 20 },
    { id: 2, worker: "Priya Sharma", task: "Maintain and water the lawn grassland", time: "04:30 PM", status: "Pending", savings: 8, reward: 15 },
    { id: 3, worker: "John Doe", task: "Turn off office electronic products & computers", time: "06:00 PM", status: "Pending", savings: 22, reward: 25 }
  ]);

  // Form states
  const [worker, setWorker] = useState('');
  const [task, setTask] = useState('Switch off the water motor');
  const [customTask, setCustomTask] = useState('');
  const [time, setTime] = useState('12:00 PM');
  const [savings, setSavings] = useState(10);
  const [successMsg, setSuccessMsg] = useState('');

  const handleAllocate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!worker) return;

    const taskText = task === 'Other' ? customTask : task;
    const coinsReward = taskText.toLowerCase().includes('motor') ? 20 : taskText.toLowerCase().includes('grassland') ? 15 : 25;

    const newAllocation = {
      id: Date.now(),
      worker,
      task: taskText,
      time,
      status: "Pending",
      savings: parseInt(savings.toString()) || 10,
      reward: coinsReward
    };

    setAllocatedTasks([...allocatedTasks, newAllocation]);
    setWorker('');
    setCustomTask('');
    setSuccessMsg(`Task successfully allocated to ${worker}!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleComplete = (id: number, reward: number) => {
    setAllocatedTasks(prev => 
      prev.map(t => t.id === id ? { ...t, status: "Completed" } : t)
    );
    setEcoCoins(ecoCoins + reward);
    setSuccessMsg(`Task completed! Earned +${reward} Eco Coins!`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-emerald-400" /> Daily Usage Work Allocation
        </h1>
        <p className="text-xs text-gray-400 mt-1 font-medium">Assign specific energy-saving and environmental tasks to workers on time to prevent resource loss.</p>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2 animate-pulse">
          <CheckCircle className="h-4.5 w-4.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Grid: Inputs and lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
        {/* Allocation Form */}
        <div className="glass-card lg:col-span-1 h-fit space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <PlusCircle className="text-emerald-400 h-4.5 w-4.5" /> Allocate New Task
          </h3>
          
          <form onSubmit={handleAllocate} className="space-y-4">
            <div>
              <label className="block text-gray-400 font-semibold mb-1">Select Worker Name</label>
              <input
                type="text"
                value={worker}
                onChange={(e) => setWorker(e.target.value)}
                placeholder="e.g. Rajesh Kumar"
                className="w-full p-2.5 bg-black/40 border border-emerald-500/10 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 font-semibold mb-1">Task Category</label>
              <select
                value={task}
                onChange={(e) => setTask(e.target.value)}
                className="w-full p-2.5 bg-black/40 border border-emerald-500/10 rounded-xl text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Switch off the water motor">Switch off the water motor</option>
                <option value="Maintain the grassland lawn">Maintain the grassland lawn</option>
                <option value="Turn off electronic products (computers/AC)">Turn off electronic products</option>
                <option value="Verify solar grid output level">Verify solar grid output level</option>
                <option value="Other">Custom Work...</option>
              </select>
            </div>

            {task === 'Other' && (
              <div>
                <label className="block text-gray-400 font-semibold mb-1">Describe Custom Task</label>
                <input
                  type="text"
                  value={customTask}
                  onChange={(e) => setCustomTask(e.target.value)}
                  placeholder="e.g. Inspect compost bio-waste bin"
                  className="w-full p-2.5 bg-black/40 border border-emerald-500/10 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-gray-400 font-semibold mb-1">Allocation Time</label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 11:30 AM"
                className="w-full p-2.5 bg-black/40 border border-emerald-500/10 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 font-semibold mb-1">Estimated Energy Savings (kWh)</label>
              <input
                type="number"
                value={savings}
                onChange={(e) => setSavings(parseInt(e.target.value) || 0)}
                className="w-full p-2.5 bg-black/40 border border-emerald-500/10 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 font-bold py-2.5 rounded-xl transition-all border border-emerald-400/20 text-white cursor-pointer"
            >
              Allocate Worker Task
            </button>
          </form>
        </div>

        {/* Task Allocations List */}
        <div className="glass-card lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <ClipboardList className="text-emerald-400 h-4.5 w-4.5" /> Allocated Worker Duties
          </h3>

          <div className="space-y-3">
            {allocatedTasks.map((t) => (
              <div key={t.id} className="p-3.5 bg-black/20 rounded-xl border border-emerald-500/5 flex justify-between items-center gap-4 hover:border-emerald-500/10 transition-all">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase flex items-center gap-1">
                      <User className="h-2.5 w-2.5" /> {t.worker}
                    </span>
                    <span className="text-gray-400 text-[10px] flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" /> {t.time}
                    </span>
                  </div>
                  <h4 className="font-bold text-white mt-1.5">{t.task}</h4>
                  <p className="text-[10px] text-gray-500 mt-1">Prevents electricity loss of {t.savings} kWh daily.</p>
                </div>

                <div className="text-right shrink-0 flex flex-col items-end gap-2">
                  <span className="text-[10px] text-amber-400 font-bold">+{t.reward} Eco Coins</span>
                  {t.status === "Pending" ? (
                    <button
                      onClick={() => handleComplete(t.id, t.reward)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1 px-2.5 rounded-lg text-[9px] cursor-pointer transition-all border border-emerald-400/20"
                    >
                      Mark Done
                    </button>
                  ) : (
                    <span className="text-emerald-400 font-bold flex items-center gap-1 text-[10px]">
                      <CheckCircle className="h-3.5 w-3.5" /> Completed
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Loss Reduction & Environmental Protection Recommendations */}
          <div className="p-4 bg-emerald-950/20 rounded-xl border border-emerald-500/20 space-y-2">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <Sparkles className="text-emerald-400 h-4.5 w-4.5" /> Loss Reduction & Environmental Recommendations
            </h4>
            <ul className="list-disc pl-4 space-y-1 text-gray-300 text-[11px] leading-relaxed">
              <li><strong>Motor Losses:</strong> Switching off the campus water motor pump immediately after filling tanks avoids line energy dissipation and saves an average of 15 kWh per day.</li>
              <li><strong>Lawn Grassland:</strong> Maintain low-water-demand native grass species. Irrigate strictly after sunset to reduce evaporation losses by 40%.</li>
              <li><strong>Standby Power:</strong> Unplugging electronic appliances prevents ghost load current leaks, lowering carbon footprints by 1.2 kg CO2e daily.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
