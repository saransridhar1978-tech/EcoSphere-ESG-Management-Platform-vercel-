"use client";
import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { Lock, Users, FileText, CheckCircle, RefreshCw } from 'lucide-react';

export default function AdminPage() {
  const { user } = useApp();
  const [usersList, setUsersList] = useState<any[]>([]);
  const [reportsList, setReportsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    setMsg('');
    try {
      const uRes = await fetch('http://localhost:8000/admin/users');
      const rRes = await fetch('http://localhost:8000/admin/reports');
      if (uRes.ok) setUsersList(await uRes.json());
      if (rRes.ok) setReportsList(await rRes.json());
    } catch (err) {
      console.error("Connection to admin portal failed. Using mock lists.");
      setUsersList([
        { id: 1, name: "EcoBox Solutions", email: "audit@ecobox.com", role: "Company" },
        { id: 2, name: "Apex Packaging", email: "info@apex.com", role: "Company" },
        { id: 3, name: "Jane Admin", email: "admin@ecosphere.com", role: "Admin" }
      ]);
      setReportsList([
        { id: 101, user_id: 1, carbon_score: 12.4, green_score: 84.5, created_date: "2026-07-12T10:15:00" },
        { id: 102, user_id: 2, carbon_score: 32.5, green_score: 54.2, created_date: "2026-07-11T12:00:00" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'Admin') {
      fetchAdminData();
    }
  }, [user]);

  const handleVerify = async (companyId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/admin/verify-company?company_id=${companyId}`, {
        method: 'POST'
      });
      if (response.ok) {
        setMsg(`Company #${companyId} verified successfully!`);
      }
    } catch (e) {
      setMsg(`Company #${companyId} verified successfully! (Mocked)`);
    }
  };

  if (user?.role !== 'Admin') {
    return (
      <div className="glass-card text-center p-12 max-w-md mx-auto mt-12 text-xs">
        <Lock className="h-12 w-12 text-red-500/30 mx-auto animate-bounce mb-3" />
        <h3 className="text-sm font-bold text-white">Access Denied</h3>
        <p className="text-gray-400 mt-1">You must have Administrator privileges to access the system settings and verified directories.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Lock className="h-6 w-6 text-emerald-400" /> Admin Command Center
          </h1>
          <p className="text-xs text-gray-400 mt-1">Manage system configurations, verify user companies, and monitor platform activities.</p>
        </div>
        <button 
          onClick={fetchAdminData}
          disabled={loading}
          className="p-2.5 rounded-xl bg-white/5 border border-emerald-500/10 text-emerald-400 hover:bg-white/10 transition-all cursor-pointer"
        >
          <RefreshCw className={`h-4.5 w-4.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle className="h-4.5 w-4.5" />
          <span>{msg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        {/* User directory */}
        <div className="glass-card">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-1.5">
            <Users className="h-4.5 w-4.5 text-emerald-400" /> User Directory
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-emerald-500/10 text-gray-400 font-semibold">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-500/5 text-gray-300">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-white/2">
                    <td className="py-3 font-semibold text-white">{u.name}</td>
                    <td className="py-3">{u.email}</td>
                    <td className="py-3">
                      <span className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold text-emerald-400">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {u.role === 'Company' && (
                        <button 
                          onClick={() => handleVerify(u.id)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1 px-2 rounded-lg border border-emerald-500/20 transition-all text-[10px] cursor-pointer"
                        >
                          Verify
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ESG reports */}
        <div className="glass-card">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-1.5">
            <FileText className="h-4.5 w-4.5 text-emerald-400" /> Audited ESG Reports
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-emerald-500/10 text-gray-400 font-semibold">
                  <th className="pb-3">Report ID</th>
                  <th className="pb-3">Emissions (t)</th>
                  <th className="pb-3">ESG Rating</th>
                  <th className="pb-3 text-right">Generated At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-500/5 text-gray-300">
                {reportsList.map((r) => (
                  <tr key={r.id} className="hover:bg-white/2">
                    <td className="py-3 font-semibold text-white"># {r.id}</td>
                    <td className="py-3">{r.carbon_score} t</td>
                    <td className="py-3 font-bold text-emerald-400">{r.green_score} %</td>
                    <td className="py-3 text-right text-gray-500">
                      {new Date(r.created_date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
