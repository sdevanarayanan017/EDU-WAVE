'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  BrainCircuit,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Layers,
  AlertCircle,
  Sun,
  Moon,
} from 'lucide-react';
import { ForgotPasswordModal } from './ForgotPasswordModal';

export const LoginPage: React.FC = () => {
  const { login } = useApp();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotOpen, setForgotOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!identifier.trim() || !password.trim()) {
      setErrorMessage('Please enter both your User ID / Email and Password.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = login(identifier, password);
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(res.message);
      }
    }, 400);
  };

  const handleQuickFill = (id: string, pass: string) => {
    setIdentifier(id);
    setPassword(pass);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100 relative overflow-hidden selection:bg-sky-500 selection:text-slate-950">
      
      {/* Ambient background glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 font-black">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-white">
              EDU<span className="text-sky-400">-WAVE</span>
            </span>
            <span className="block text-[10px] uppercase font-extrabold tracking-widest text-slate-400">
              Academic Intelligence v2.1
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Login Card Area */}
      <main className="relative z-10 w-full max-w-md mx-auto px-6 py-4 flex-1 flex flex-col justify-center">
        <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800/80 shadow-2xl backdrop-blur-xl space-y-6">
          
          <div className="space-y-1.5 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/15 text-sky-300 text-[11px] font-bold border border-sky-500/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Role Academic Portal</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Welcome to EDU-WAVE
            </h1>
            <p className="text-xs text-slate-400">
              Sign in with your institutional credentials to access your personalized dashboard.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-300 mb-1.5">
                User ID or Email
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. ADMIN@123, STU-4001, TCH-3001"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-950/70 rounded-xl border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  className="text-[11px] font-bold text-sky-400 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-950/70 rounded-xl border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-xs shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick 1-Click Demo Accounts Selector */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
            <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 text-center">
              Quick 1-Click Demonstration Logins
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('ADMIN@123', 'ADMIN@123')}
                className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-white group-hover:text-sky-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                  <span>Admin</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">ADMIN@123</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('HOD-2001', 'password123')}
                className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-white group-hover:text-purple-400">
                  <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                  <span>HOD Head</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">HOD-2001</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('TCH-3001', 'password123')}
                className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-white group-hover:text-blue-400">
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  <span>Teacher</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">TCH-3001</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('STU-4001', 'password123')}
                className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-white group-hover:text-sky-400">
                  <GraduationCap className="w-3.5 h-3.5 text-sky-400" />
                  <span>Student</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">STU-4001</span>
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 text-center text-xs text-slate-400">
        EDU-WAVE AI Academic Platform • Production Grade Architecture & Intelligent Workload Optimization
      </footer>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotOpen}
        onClose={() => setForgotOpen(false)}
      />

    </div>
  );
};
