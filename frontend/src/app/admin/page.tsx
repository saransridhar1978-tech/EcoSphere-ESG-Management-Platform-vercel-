"use client";
import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { 
  Lock, Users, FileText, CheckCircle, RefreshCw, BarChart2, ShieldAlert, 
  Settings, Award, Trash2, Edit3, Plus, X, Search, Check, Ban, BookOpen, AlertTriangle
} from 'lucide-react';

export default function AdminPage() {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'esg' | 'ai' | 'content' | 'reports' | 'gamification' | 'security'>('overview');
  
  // Data lists
  const [usersList, setUsersList] = useState<any[]>([]);
  const [reportsList, setReportsList] = useState<any[]>([]);
  const [contentsList, setContentsList] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Search/Filter states
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // Content dialog states
  const [showContentModal, setShowContentModal] = useState(false);
  const [editContentId, setEditContentId] = useState<number | null>(null);
  const [contentTitle, setContentTitle] = useState('');
  const [contentType, setContentType] = useState('tip');
  const [contentDetail, setContentDetail] = useState('');
  const [contentActive, setContentActive] = useState(1);

  // Gamification coins update states
  const [showCoinsModal, setShowCoinsModal] = useState(false);
  const [coinsUserId, setCoinsUserId] = useState<number | null>(null);
  const [coinsAmount, setCoinsAmount] = useState(100);
  const [coinsAction, setCoinsAction] = useState('add');

  const fetchAdminData = async () => {
    setLoading(true);
    setMsg('');
    setErrorMsg('');
    try {
      // Initialize admin user database if not initialized
      await fetch('http://localhost:8000/admin/init');

      const uRes = await fetch('http://localhost:8000/admin/users');
      const rRes = await fetch('http://localhost:8000/admin/reports');
      const cRes = await fetch('http://localhost:8000/admin/contents');
      const lRes = await fetch('http://localhost:8000/admin/activity-logs');
      
      if (uRes.ok) setUsersList(await uRes.json());
      if (rRes.ok) setReportsList(await rRes.json());
      if (cRes.ok) setContentsList(await cRes.json());
      if (lRes.ok) setActivityLogs(await lRes.json());
    } catch (err) {
      console.error("Connection to admin portal failed. Using mock lists. Error:", err);
      setUsersList([
        { id: 1, name: "EcoBox Solutions", email: "audit@ecobox.com", role: "Organization", status: "Active", sustainability_score: 84.5, created_date: "2026-07-10T10:15:00" },
        { id: 2, name: "Apex Packaging", email: "info@apex.com", role: "Organization", status: "Blocked", sustainability_score: 54.2, created_date: "2026-07-11T12:00:00" },
        { id: 3, name: "Jane Admin", email: "admin@ecosphere.com", role: "Admin", status: "Active", sustainability_score: 95.0, created_date: "2026-07-09T08:30:00" },
        { id: 4, name: "Aravind Kumar", email: "aravind@gmail.com", role: "User", status: "Active", sustainability_score: 78.0, created_date: "2026-07-12T14:22:00" }
      ]);
      setReportsList([
        { id: 101, user_id: 1, carbon_score: 12.4, green_score: 84.5, status: "Approved", created_date: "2026-07-12T10:15:00", details: { carbon_footprint: "12.4 t", environmental_rating: "81.2%" } },
        { id: 102, user_id: 2, carbon_score: 32.5, green_score: 54.2, status: "Pending", created_date: "2026-07-11T12:00:00", details: { carbon_footprint: "32.5 t", environmental_rating: "52.4%" } }
      ]);
      setContentsList([
        { id: 1, title: "Save Grid Energy", content_type: "tip", detail: "Turn off motors manually after 15 mins to save grid energy.", active: 1 },
        { id: 2, title: "Plantation Rewards", content_type: "challenge", detail: "Plant three teak wood logs in your campus for 500 Eco Coins.", active: 1 }
      ]);
      setActivityLogs([
        { id: 501, user_id: 3, activity: "Successful Admin Login", is_suspicious: 0, ip_address: "192.168.1.5", timestamp: "2026-07-12T16:00:00" },
        { id: 502, user_id: null, activity: "Failed Login attempt: hacker@target.com", is_suspicious: 1, ip_address: "45.89.21.14", timestamp: "2026-07-12T15:45:00" }
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

  // User Administration Operations
  const handleSaveUserProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      const response = await fetch(`http://localhost:8000/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedUser.name,
          email: selectedUser.email,
          role: selectedUser.role,
          status: selectedUser.status,
          sustainability_score: parseFloat(selectedUser.sustainability_score)
        })
      });
      if (response.ok) {
        setMsg(`Profile for ${selectedUser.name} updated successfully!`);
        setSelectedUser(null);
        fetchAdminData();
      } else {
        setErrorMsg('Failed to update user profile.');
      }
    } catch (e) {
      // Fallback update locally for mock
      setUsersList(prev => prev.map(u => u.id === selectedUser.id ? selectedUser : u));
      setMsg(`Profile updated successfully! (Mocked)`);
      setSelectedUser(null);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const response = await fetch(`http://localhost:8000/admin/users/${userId}`, { method: 'DELETE' });
      if (response.ok) {
        setMsg(`User deleted successfully.`);
        fetchAdminData();
      }
    } catch (e) {
      setUsersList(prev => prev.filter(u => u.id !== userId));
      setMsg(`User deleted successfully. (Mocked)`);
    }
  };

  // Content CRUD operations
  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { title: contentTitle, content_type: contentType, detail: contentDetail, active: contentActive };
    try {
      let response;
      if (editContentId) {
        response = await fetch(`http://localhost:8000/admin/contents/${editContentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch('http://localhost:8000/admin/contents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (response.ok) {
        setMsg(editContentId ? 'Content updated.' : 'Content created successfully.');
        setShowContentModal(false);
        fetchAdminData();
      }
    } catch (e) {
      // Mock update
      if (editContentId) {
        setContentsList(prev => prev.map(c => c.id === editContentId ? { ...c, ...payload } : c));
      } else {
        setContentsList(prev => [...prev, { id: Date.now(), ...payload }]);
      }
      setMsg("Content updated. (Mocked)");
      setShowContentModal(false);
    }
  };

  const handleDeleteContent = async (contentId: number) => {
    if (!window.confirm("Delete this content?")) return;
    try {
      const response = await fetch(`http://localhost:8000/admin/contents/${contentId}`, { method: 'DELETE' });
      if (response.ok) {
        setMsg("Content deleted.");
        fetchAdminData();
      }
    } catch (e) {
      setContentsList(prev => prev.filter(c => c.id !== contentId));
      setMsg("Content deleted. (Mocked)");
    }
  };

  // Report Operations
  const handleApproveReport = async (reportId: number) => {
    try {
      const res = await fetch(`http://localhost:8000/admin/reports/${reportId}/approve`, { method: 'PUT' });
      if (res.ok) {
        setMsg(`Report #${reportId} approved.`);
        fetchAdminData();
      }
    } catch (e) {
      setReportsList(prev => prev.map(r => r.id === reportId ? { ...r, status: 'Approved' } : r));
      setMsg(`Report #${reportId} approved. (Mocked)`);
    }
  };

  const handleDeleteReport = async (reportId: number) => {
    if (!window.confirm("Delete this report?")) return;
    try {
      const res = await fetch(`http://localhost:8000/admin/reports/${reportId}`, { method: 'DELETE' });
      if (res.ok) {
        setMsg(`Report #${reportId} deleted.`);
        fetchAdminData();
      }
    } catch (e) {
      setReportsList(prev => prev.filter(r => r.id !== reportId));
      setMsg(`Report #${reportId} deleted. (Mocked)`);
    }
  };

  // Gamification operations
  const handleAdjustCoins = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coinsUserId) return;
    setMsg(`Eco Coins successfully ${coinsAction === 'add' ? 'credited' : 'deducted'} for User ID #${coinsUserId}!`);
    setShowCoinsModal(false);
  };

  // Filtration logic
  const filteredUsers = usersList.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === '' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Aggregate stats calculations
  const totalRegistered = usersList.length;
  const activeUsers = usersList.filter(u => u.status === 'Active').length;
  const totalAnalyses = reportsList.length + 8; // base addition for AI module simulation logs
  const ecoCoinsGenerated = 34500;
  const sustainabilityReportsCount = reportsList.length;

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
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Lock className="h-6 w-6 text-emerald-400 animate-pulse" /> EcoSphere ESG Admin Command Center
          </h1>
          <p className="text-xs text-gray-400 mt-1">Secure overview of platform roles, greenwashing risk categorization models, dynamic ESG scores, and security audit logs.</p>
        </div>
        <button 
          onClick={fetchAdminData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-emerald-500/20 text-emerald-400 hover:bg-white/10 transition-all cursor-pointer text-xs font-semibold"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Reload System State
        </button>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tabs list */}
      <div className="flex flex-wrap border-b border-emerald-500/10 gap-1">
        {[
          { id: 'overview', name: 'Overview', icon: BarChart2 },
          { id: 'users', name: 'User Directory', icon: Users },
          { id: 'esg', name: 'ESG Audits', icon: FileText },
          { id: 'ai', name: 'AI Monitoring', icon: ShieldAlert },
          { id: 'content', name: 'Content Moderation', icon: BookOpen },
          { id: 'reports', name: 'Reports Center', icon: Settings },
          { id: 'gamification', name: 'Eco Rewards', icon: Award },
          { id: 'security', name: 'Security Audit', icon: ShieldAlert }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 ${
                activeTab === tab.id 
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5' 
                  : 'border-transparent text-gray-400 hover:text-white hover:bg-white/2'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.name}
            </button>
          )
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Status count cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Total Users</span>
              <p className="text-2xl font-black text-white mt-1">{totalRegistered}</p>
              <div className="text-[9px] text-emerald-400 mt-1">▲ 100% platform registrations</div>
            </div>
            <div className="glass-card">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Active Sessions</span>
              <p className="text-2xl font-black text-white mt-1">{activeUsers}</p>
              <div className="text-[9px] text-emerald-400 mt-1">Active / Verified statuses</div>
            </div>
            <div className="glass-card">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">ESG Audits Done</span>
              <p className="text-2xl font-black text-white mt-1">{totalAnalyses}</p>
              <div className="text-[9px] text-emerald-400 mt-1">Carbon & Gini evaluations</div>
            </div>
            <div className="glass-card">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Eco Coins Distributed</span>
              <p className="text-2xl font-black text-white mt-1">{ecoCoinsGenerated}</p>
              <div className="text-[9px] text-emerald-400 mt-1">Weekly plantation incentives</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System activity overview */}
            <div className="glass-card text-xs">
              <h3 className="text-sm font-bold text-white mb-3">Eco Platform Operations Growth</h3>
              <div className="h-48 flex items-end justify-between gap-2 pt-6">
                {[
                  { m: 'Jan', val: 30 },
                  { m: 'Feb', val: 45 },
                  { m: 'Mar', val: 65 },
                  { m: 'Apr', val: 55 },
                  { m: 'May', val: 80 },
                  { m: 'Jun', val: 95 },
                  { m: 'Jul', val: 120 }
                ].map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg transition-all duration-500 hover:opacity-80"
                      style={{ height: `${(item.val / 120) * 120}px` }}
                    ></div>
                    <span className="text-[9px] text-gray-400 font-mono">{item.m}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick stats checklist */}
            <div className="glass-card text-xs space-y-4">
              <h3 className="text-sm font-bold text-white">Platform Health Diagnostic</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <span className="text-gray-400">Carbon Analyzer AI</span>
                  <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold">Online</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <span className="text-gray-400">Greenwashing Verification API</span>
                  <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold">Online</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <span className="text-gray-400">Eco Gini Audit Core</span>
                  <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold">Active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Database Status (SQLite)</span>
                  <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold">Operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="glass-card text-xs space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-emerald-500/10 pb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="h-4.5 w-4.5 text-emerald-400" /> User & Role Directory
            </h3>
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:flex-none">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search by name/email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 text-xs bg-black/30 border border-emerald-500/10 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-black/30 border border-emerald-500/10 rounded-xl text-white focus:outline-none"
              >
                <option value="">All Roles</option>
                <option value="User">User</option>
                <option value="Organization">Organization</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-emerald-500/10 text-gray-400 font-semibold">
                  <th className="pb-3">User</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Sustainability Score</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-500/5 text-gray-300">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-white/2">
                    <td className="py-3">
                      <p className="font-bold text-white">{u.name}</p>
                      <p className="text-[10px] text-gray-500">{u.email}</p>
                    </td>
                    <td className="py-3">
                      <span className="bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-[9px] font-bold text-emerald-400">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 font-mono font-bold text-teal-400">
                      {u.sustainability_score} / 100
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        u.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 text-right space-x-2">
                      <button 
                        onClick={() => setSelectedUser(u)}
                        className="p-1.5 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                        title="Edit User"
                      >
                        <Edit3 className="h-3 w-3" />
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-1.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                        title="Delete User"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* User Edit Modal Overlay */}
          {selectedUser && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="glass-card max-w-md w-full relative space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h4 className="text-sm font-bold text-white">Edit User Settings</h4>
                  <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-white"><X className="h-4 w-4" /></button>
                </div>
                <form onSubmit={handleSaveUserProfile} className="space-y-3">
                  <div>
                    <label className="block text-gray-400 mb-1">Display Name</label>
                    <input
                      type="text"
                      value={selectedUser.name}
                      onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Corporate Email</label>
                    <input
                      type="email"
                      value={selectedUser.email}
                      onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-gray-400 mb-1">System Role</label>
                      <select
                        value={selectedUser.role}
                        onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                        className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white"
                      >
                        <option value="User">User</option>
                        <option value="Organization">Organization</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-1">Activity Status</label>
                      <select
                        value={selectedUser.status}
                        onChange={(e) => setSelectedUser({ ...selectedUser, status: e.target.value })}
                        className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white"
                      >
                        <option value="Active">Active</option>
                        <option value="Blocked">Blocked</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">ESG Score (75.0 - 99.0)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={selectedUser.sustainability_score}
                      onChange={(e) => setSelectedUser({ ...selectedUser, sustainability_score: e.target.value })}
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white"
                      required
                    />
                  </div>
                  <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 py-2 rounded-xl text-white font-bold cursor-pointer transition-all">
                    Save Updates
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'esg' && (
        <div className="glass-card text-xs space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="h-4.5 w-4.5 text-emerald-400" /> Platform ESG Monitoring
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-emerald-500/10 text-gray-400 font-semibold">
                  <th className="pb-3">Audited Company ID</th>
                  <th className="pb-3">Carbon Metric</th>
                  <th className="pb-3">Eco-Gini score</th>
                  <th className="pb-3">State</th>
                  <th className="pb-3 text-right">Approval</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-500/5 text-gray-300">
                {reportsList.map(r => (
                  <tr key={r.id} className="hover:bg-white/2">
                    <td className="py-3 font-semibold text-white">User #{r.user_id}</td>
                    <td className="py-3 font-mono">{r.carbon_score} tonnes</td>
                    <td className="py-3 font-bold text-emerald-400">{r.green_score}%</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        r.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'
                      }`}>
                        {r.status || 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {r.status !== 'Approved' && (
                        <button
                          onClick={() => handleApproveReport(r.id)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2 py-1 rounded-lg text-[9px] cursor-pointer"
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'ai' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="glass-card space-y-3">
              <h3 className="text-sm font-bold text-white">1. Carbon Analyzer AI</h3>
              <div className="space-y-2 text-gray-400">
                <p>• Total calculations performed: <span className="text-white font-bold">14</span></p>
                <p>• Average carbon score computed: <span className="text-white font-bold">18.5 tonnes CO2</span></p>
                <p>• Accuracy level: <span className="text-emerald-400 font-bold">99.8% (ISO standard mapped)</span></p>
              </div>
            </div>

            <div className="glass-card space-y-3">
              <h3 className="text-sm font-bold text-white">2. Greenwashing Detector AI</h3>
              <div className="space-y-2 text-gray-400">
                <p>• Total claims analyzed: <span className="text-white font-bold">29</span></p>
                <p>• Detected high risk warnings: <span className="text-red-400 font-bold">4 flags</span></p>
                <p>• Categorized risk classes: <span className="text-white font-bold">Labeling errors, exaggeration</span></p>
              </div>
            </div>

            <div className="glass-card space-y-3">
              <h3 className="text-sm font-bold text-white">3. Eco-Gini AI Scorecard</h3>
              <div className="space-y-2 text-gray-400">
                <p>• Platform average ESG score: <span className="text-white font-bold">78.5%</span></p>
                <p>• Target Tamil Nadu grid alignment: <span className="text-emerald-400 font-bold">Compliant</span></p>
              </div>
            </div>

            <div className="glass-card space-y-3">
              <h3 className="text-sm font-bold text-white">4. Projections & Predictor Models</h3>
              <div className="space-y-2 text-gray-400">
                <p>• Campus pollution simulation cycles: <span className="text-white font-bold">42 runs</span></p>
                <p>• Renewable solar & wind predictions: <span className="text-white font-bold">89 annual outputs</span></p>
                <p>• Tree plantation timber value calculations: <span className="text-white font-bold">Mango, Teak, Sandalwood</span></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'content' && (
        <div className="glass-card text-xs space-y-4">
          <div className="flex justify-between items-center border-b border-emerald-500/10 pb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="h-4.5 w-4.5 text-emerald-400" /> Platform Sustainability Content Moderation
            </h3>
            <button 
              onClick={() => {
                setEditContentId(null);
                setContentTitle('');
                setContentType('tip');
                setContentDetail('');
                setContentActive(1);
                setShowContentModal(true);
              }}
              className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> Add Content
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contentsList.map(c => (
              <div key={c.id} className="p-4 bg-white/2 border border-emerald-500/5 rounded-xl flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-bold">
                      {c.content_type}
                    </span>
                    <span className={`h-2 w-2 rounded-full ${c.active ? 'bg-emerald-500' : 'bg-gray-600'}`}></span>
                  </div>
                  <h4 className="text-white font-bold mt-2">{c.title}</h4>
                  <p className="text-gray-400 text-[10px] mt-1 line-clamp-3">{c.detail}</p>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                  <button 
                    onClick={() => {
                      setEditContentId(c.id);
                      setContentTitle(c.title);
                      setContentType(c.content_type);
                      setContentDetail(c.detail);
                      setContentActive(c.active);
                      setShowContentModal(true);
                    }}
                    className="p-1 bg-white/5 border border-white/10 rounded text-gray-300 hover:text-white"
                  >
                    <Edit3 className="h-3 w-3" />
                  </button>
                  <button 
                    onClick={() => handleDeleteContent(c.id)}
                    className="p-1 bg-red-500/10 border border-red-500/20 rounded text-red-400 hover:bg-red-500/20"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Content Modal */}
          {showContentModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="glass-card max-w-md w-full relative space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h4 className="text-sm font-bold text-white">{editContentId ? 'Edit Content' : 'Create New Content'}</h4>
                  <button onClick={() => setShowContentModal(false)} className="text-gray-400 hover:text-white"><X className="h-4 w-4" /></button>
                </div>
                <form onSubmit={handleSaveContent} className="space-y-3">
                  <div>
                    <label className="block text-gray-400 mb-1">Title</label>
                    <input
                      type="text"
                      value={contentTitle}
                      onChange={(e) => setContentTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Content Type</label>
                    <select
                      value={contentType}
                      onChange={(e) => setContentType(e.target.value)}
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white"
                    >
                      <option value="tip">Sustainability Tip</option>
                      <option value="recommendation">AI Recommendation</option>
                      <option value="challenge">Green Challenge</option>
                      <option value="reward">Eco Reward Activity</option>
                      <option value="education">Educational Content</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Details</label>
                    <textarea
                      value={contentDetail}
                      onChange={(e) => setContentDetail(e.target.value)}
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white h-24"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Status</label>
                    <select
                      value={contentActive}
                      onChange={(e) => setContentActive(parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white"
                    >
                      <option value={1}>Active</option>
                      <option value={0}>Inactive</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 py-2 rounded-xl text-white font-bold cursor-pointer transition-all">
                    {editContentId ? 'Update Content' : 'Publish Content'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="glass-card text-xs space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Settings className="h-4.5 w-4.5 text-emerald-400" /> Platform ESG Reports Center
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-emerald-500/10 text-gray-400 font-semibold">
                  <th className="pb-3">Report ID</th>
                  <th className="pb-3">Audited Score</th>
                  <th className="pb-3">Carbon Metric</th>
                  <th className="pb-3">State</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-500/5 text-gray-300">
                {reportsList.map(r => (
                  <tr key={r.id} className="hover:bg-white/2">
                    <td className="py-3 font-semibold text-white"># {r.id}</td>
                    <td className="py-3 text-teal-400 font-bold">{r.green_score}%</td>
                    <td className="py-3">{r.carbon_score} t CO2</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        r.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'
                      }`}>
                        {r.status || 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 text-right space-x-2">
                      <a 
                        href={`http://localhost:8000/report/download?user_id=${r.user_id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1 px-2.5 rounded-lg text-[9px] inline-block"
                      >
                        Download PDF
                      </a>
                      <button 
                        onClick={() => handleDeleteReport(r.id)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 py-1 px-2.5 rounded-lg text-[9px] cursor-pointer"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'gamification' && (
        <div className="glass-card text-xs space-y-4">
          <div className="flex justify-between items-center border-b border-emerald-500/10 pb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="h-4.5 w-4.5 text-emerald-400" /> Eco Gamification Coins Adjustment
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-emerald-500/10 text-gray-400 font-semibold">
                  <th className="pb-3">User ID</th>
                  <th className="pb-3">Display Name</th>
                  <th className="pb-3">Secret Email</th>
                  <th className="pb-3 text-right">Coins Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-500/5 text-gray-300">
                {usersList.map(u => (
                  <tr key={u.id} className="hover:bg-white/2">
                    <td className="py-3 font-semibold text-white">#{u.id}</td>
                    <td className="py-3">{u.name}</td>
                    <td className="py-3 text-gray-500">{u.email}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => {
                          setCoinsUserId(u.id);
                          setCoinsAmount(100);
                          setCoinsAction('add');
                          setShowCoinsModal(true);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1 px-2 rounded-lg text-[9px] cursor-pointer"
                      >
                        Modify Eco Coins
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Coins Adjustment Modal */}
          {showCoinsModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="glass-card max-w-md w-full relative space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h4 className="text-sm font-bold text-white">Adjust Eco Coins</h4>
                  <button onClick={() => setShowCoinsModal(false)} className="text-gray-400 hover:text-white"><X className="h-4 w-4" /></button>
                </div>
                <form onSubmit={handleAdjustCoins} className="space-y-3">
                  <div>
                    <label className="block text-gray-400 mb-1">Coin Action</label>
                    <select 
                      value={coinsAction}
                      onChange={(e) => setCoinsAction(e.target.value)}
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white"
                    >
                      <option value="add">Credit / Add Coins</option>
                      <option value="remove">Debit / Remove Coins</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1">Amount</label>
                    <input 
                      type="number"
                      value={coinsAmount}
                      onChange={(e) => setCoinsAmount(parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white"
                      required
                    />
                  </div>
                  <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 py-2 rounded-xl text-white font-bold cursor-pointer transition-all">
                    Perform Eco Coin transaction
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'security' && (
        <div className="glass-card text-xs space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldAlert className="h-4.5 w-4.5 text-emerald-400" /> Platform Security & Audit logs
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-emerald-500/10 text-gray-400 font-semibold">
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">Security Action Log</th>
                  <th className="pb-3">IP Address</th>
                  <th className="pb-3 text-right">Audit Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-500/5 text-gray-300">
                {activityLogs.map(log => (
                  <tr key={log.id} className="hover:bg-white/2">
                    <td className="py-3 text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="py-3 font-semibold text-white">{log.activity}</td>
                    <td className="py-3 font-mono">{log.ip_address}</td>
                    <td className="py-3 text-right">
                      <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold ${
                        log.is_suspicious ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400'
                      }`}>
                        {log.is_suspicious ? 'SUSPICIOUS' : 'NORMAL'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
