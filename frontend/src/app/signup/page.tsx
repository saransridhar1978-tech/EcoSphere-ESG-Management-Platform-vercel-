"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Globe, User, Mail, Lock, ShieldAlert, AlertCircle } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Company'); // Individual User, Company, Admin
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Registration failed');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Connecting to server failed. Please start backend first.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#060f0c] p-6 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full filter blur-3xl"></div>

      <div className="w-full max-w-md glass-card border border-emerald-500/20 z-10">
        <div className="text-center mb-8">
          <Globe className="h-10 w-10 text-emerald-400 mx-auto animate-float mb-2" />
          <h2 className="text-2xl font-extrabold text-white">EcoSphere AI</h2>
          <p className="text-xs text-gray-400 mt-1">Register Organization or User Profile</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl">
            Success! Redirecting to login portal...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-gray-400 font-semibold mb-1.5">Profile Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                <User className="h-4 w-4" />
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="EcoCorp Industries or Jane Doe"
                className="w-full pl-10 pr-4 py-3 bg-black/40 border border-emerald-500/10 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition-all placeholder:text-gray-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 font-semibold mb-1.5">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ecocorp.com"
                className="w-full pl-10 pr-4 py-3 bg-black/40 border border-emerald-500/10 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition-all placeholder:text-gray-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 font-semibold mb-1.5">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-10 pr-4 py-3 bg-black/40 border border-emerald-500/10 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition-all placeholder:text-gray-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 font-semibold mb-1.5">User Access Level / Role</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                <ShieldAlert className="h-4 w-4" />
              </span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black/40 border border-emerald-500/10 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition-all focus:ring-0"
              >
                <option value="Company" className="bg-[#091612] text-white">Company/User Organization</option>
                <option value="Individual User" className="bg-[#091612] text-white">Individual User</option>
                <option value="Admin" className="bg-[#091612] text-white">System Admin</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 border border-emerald-400/20 disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-[11px] text-gray-400">
          <span>Already registered? </span>
          <Link href="/login" className="text-emerald-400 font-bold hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
