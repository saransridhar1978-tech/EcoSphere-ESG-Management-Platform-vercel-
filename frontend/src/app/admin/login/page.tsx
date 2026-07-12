"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../AppContext';
import { Globe, Lock, ShieldAlert, ArrowRight, Home } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const { setUser } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Authentication failed');
      }

      const data = await response.json();
      
      if (data.role !== 'Admin') {
        throw new Error('Access denied. This login portal is strictly reserved for verified Administrators.');
      }

      setUser(data);
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Connecting to server failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050c0a] p-6 relative overflow-hidden">
      {/* Background radial effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full filter blur-3xl"></div>

      <div className="w-full max-w-md glass-card border border-emerald-500/20 z-10">
        <div className="text-center mb-8">
          <ShieldAlert className="h-10 w-10 text-emerald-400 mx-auto animate-pulse mb-2" />
          <h2 className="text-2xl font-extrabold text-white tracking-tight">EcoSphere Admin</h2>
          <p className="text-xs text-gray-400 mt-1">Authorized Personnel Security Access Portal</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-400 font-semibold mb-1.5 font-mono uppercase tracking-wider">Admin ID / Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@ecosphere.com"
              className="w-full px-4 py-3 bg-black/40 border border-emerald-500/10 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition-all placeholder:text-gray-700"
            />
          </div>

          <div>
            <label className="block text-gray-400 font-semibold mb-1.5 font-mono uppercase tracking-wider">Secret Key / Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-black/40 border border-emerald-500/10 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition-all placeholder:text-gray-700"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 border border-emerald-400/20 disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Decrypting Session...' : 'Verify Identity'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6 flex justify-between items-center text-[10px] text-gray-500 font-mono">
          <Link href="/" className="flex items-center gap-1 hover:text-white transition-all">
            <Home className="h-3 w-3" /> Back to Application
          </Link>
          <span>Level 3 Auth Encrypted</span>
        </div>
      </div>
    </div>
  );
}
