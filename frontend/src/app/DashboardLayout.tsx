"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from './AppContext';
import { 
  Globe, 
  Home, 
  Leaf, 
  ShieldAlert, 
  Sparkles, 
  MessageSquare, 
  Trees, 
  Flame, 
  Sun, 
  Lock, 
  SunMedium, 
  Moon, 
  LogOut, 
  User as UserIcon,
  Trophy,
  ClipboardList
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, setUser, theme, toggleTheme } = useApp();
  const pathname = usePathname();
  const router = useRouter();

  // Floating Chatbot States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([
    { sender: 'assistant', text: "Hello! I am your EcoSphere AI advisor. How can I help you offset emissions today?" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  React.useEffect(() => {
    if (!user && pathname !== '/login' && pathname !== '/signup') {
      router.push('/login');
    }
  }, [user, pathname, router]);

  if (!user && (pathname === '/login' || pathname === '/signup')) {
    return <>{children}</>;
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#060f0c] text-white">
        <div className="text-center">
          <Globe className="mx-auto h-12 w-12 animate-spin text-emerald-400" />
          <p className="mt-4 text-sm text-gray-400">Verifying session...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { name: 'Main Dashboard', path: '/', icon: Home },
    { name: 'Daily Work Allocation', path: '/carbon', icon: ClipboardList },
    { name: 'Greenwashing Detector', path: '/greenwashing', icon: ShieldAlert },
    { name: 'Eco-Gini AI Score', path: '/ecogini', icon: Sparkles },
    { name: 'Tree Plantation Simulator', path: '/tree', icon: Trees },
    { name: 'Campus Pollution Predictor', path: '/campus', icon: Flame },
    { name: 'Renewable Predictor', path: '/renewable', icon: Sun },
    { name: 'Eco Gamification', path: '/gamification', icon: Trophy }
  ];

  if (user.role === 'Admin') {
    menuItems.push({ name: 'Admin Panel', path: '/admin', icon: Lock });
  }

  const handleLogout = () => {
    setUser(null);
    router.push('/login');
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text) return;
    setChatInput('');
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setChatLoading(true);
    try {
      const response = await fetch('http://localhost:8000/green-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { sender: 'assistant', text: data.reply }]);
      }
    } catch (err) {
      setTimeout(() => {
        setMessages(prev => [...prev, { sender: 'assistant', text: "EcoSphere Copilot recommendation: Audit scope 1 & 2 carbon profiles first. Our ESG simulator or Carbon Analyzer can assist in identifying high-impact areas." }]);
      }, 500);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Sidebar */}
      <aside className="w-64 border-r border-emerald-500/10 bg-emerald-950/20 backdrop-blur-xl flex flex-col justify-between p-4 hidden md:flex">
        <div>
          <div className="flex items-center gap-2 px-2 py-4 border-b border-emerald-500/10">
            <Globe className="h-6 w-6 text-emerald-400" />
            <span className="font-extrabold text-xl tracking-tight text-white">EcoSphere <span className="text-emerald-400">AI</span></span>
          </div>
          
          <nav className="mt-6 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link 
                  key={item.path} 
                  href={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile footer in sidebar */}
        <div className="p-2 border-t border-emerald-500/10 flex flex-col gap-2">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="h-9 w-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <UserIcon className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{user.name}</p>
              <p className="text-[10px] text-gray-400 truncate">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 w-full text-left text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-xl transition-all"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-emerald-500/10 bg-emerald-950/10 backdrop-blur-xl flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-2 md:hidden">
            <Globe className="h-6 w-6 text-emerald-400" />
            <span className="font-extrabold text-lg text-white">EcoSphere AI</span>
          </div>
          
          <div className="hidden md:block">
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              {user.role} Operations Hub
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-emerald-500/10 text-emerald-400 transition-all"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <SunMedium className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            {/* Mobile Nav Dropdown Link or buttons */}
            <div className="flex md:hidden items-center gap-2">
              <button 
                onClick={handleLogout} 
                className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all"
                title="Sign Out"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        </header>

        {/* Content Router body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>

      {/* Floating Chatbot Bubble (Change to small robotic image) */}
      <button 
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 z-50 bg-emerald-600 hover:bg-emerald-500 border border-emerald-400/20 text-white rounded-full p-3.5 shadow-2xl transition-all hover:scale-110 active:scale-95 animate-float cursor-pointer flex items-center justify-center text-2xl"
        title="EcoSphere AI Chatbot"
      >
        🤖
      </button>

      {/* Chat Window Panel overlay */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 w-90 h-112 bg-gray-950/95 backdrop-blur-xl border border-emerald-500/20 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col transition-all">
          <div className="bg-emerald-900/30 p-4 border-b border-emerald-500/10 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-emerald-400 animate-spin" />
              <div>
                <h4 className="text-xs font-bold text-white">EcoSphere Copilot</h4>
                <span className="text-[9px] text-emerald-400 block">AI Sustainability Core Online</span>
              </div>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="text-gray-400 hover:text-white font-bold text-sm">&times;</button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-[11px] leading-relaxed flex flex-col">
            {messages.map((m, idx) => (
              <div 
                key={idx} 
                className={`p-2.5 rounded-xl max-w-[85%] ${
                  m.sender === 'user' 
                    ? 'bg-emerald-600 text-white ml-auto rounded-tr-none' 
                    : 'bg-emerald-950/40 text-gray-200 border border-emerald-500/5 mr-auto rounded-tl-none'
                }`}
              >
                {m.text}
              </div>
            ))}
            {chatLoading && (
              <div className="bg-emerald-950/40 border border-emerald-500/5 text-gray-400 p-2.5 rounded-xl rounded-tl-none mr-auto max-w-[85%] flex items-center gap-1.5 animate-pulse">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-spin" />
                <span>Thinking...</span>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form 
            onSubmit={handleChatSubmit}
            className="p-3 border-t border-emerald-500/10 flex gap-2 shrink-0 bg-black/20"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 bg-gray-900 border border-emerald-500/10 rounded-xl px-3 py-2 text-[10px] text-white focus:outline-none focus:border-emerald-500"
            />
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-xl text-[10px] border border-emerald-500/20 cursor-pointer">
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
