'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  BrainCircuit,
  Bell,
  Sun,
  Moon,
  LogOut,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Layers,
  ChevronDown,
  Phone,
  CheckCircle2,
} from 'lucide-react';

interface NavbarProps {
  toggleTheme: () => void;
  isDark: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ toggleTheme, isDark }) => {
  const { currentUser, logout, whatsAppQueue, setRetakeQuizOpen } = useApp();
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setUserMenuOpen] = useState(false);

  const roleColor = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'hod':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'teacher':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      default:
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    }
  };

  const roleIcon = (role?: string) => {
    switch (role) {
      case 'admin':
        return <ShieldCheck className="w-3.5 h-3.5" />;
      case 'hod':
        return <Briefcase className="w-3.5 h-3.5" />;
      case 'teacher':
        return <Layers className="w-3.5 h-3.5" />;
      default:
        return <GraduationCap className="w-3.5 h-3.5" />;
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/20 font-black">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-black tracking-tight text-slate-900 dark:text-white">
                EDU<span className="text-emerald-500 dark:text-emerald-400">-WAVE</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                v2.0
              </span>
            </div>
            <span className="hidden sm:block text-[10px] text-slate-400">
              AI Workload & Academic Coordination
            </span>
          </div>
        </div>

        {/* Right Nav Actions */}
        <div className="flex items-center gap-2.5">
          
          {/* WhatsApp / Notification Center */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
              title="WhatsApp & In-App Notifications"
            >
              <Bell className="w-4 h-4" />
              {whatsAppQueue.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white rounded-full text-[9px] font-black flex items-center justify-center">
                  {whatsAppQueue.length}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-4 space-y-3 z-50 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-black uppercase text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-500" /> WhatsApp & System Alerts
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {whatsAppQueue.length} Total
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2.5">
                  {whatsAppQueue.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">
                      No notifications in queue. All systems clear.
                    </p>
                  ) : (
                    whatsAppQueue.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white truncate">
                            {item.title}
                          </span>
                          <span className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
                            {item.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 whitespace-pre-line line-clamp-3">
                          {item.message}
                        </p>
                        <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                          <span>Recipient: {item.recipient_name}</span>
                          <span>{item.recipient_phone}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            title="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* User Profile & Role Info */}
          {currentUser && (
            <div className="relative">
              <div
                onClick={() => setUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-slate-300 transition-all select-none"
              >
                <img
                  src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt={currentUser.full_name}
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-emerald-500/40"
                />
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {currentUser.full_name}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider border ${roleColor(currentUser.role)}`}>
                      {roleIcon(currentUser.role)}
                      {currentUser.role === 'admin' ? 'ADMIN' : currentUser.role}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {currentUser.unique_id}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>

              {/* User Menu Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-2 space-y-1 z-50 animate-in fade-in">
                  <div className="p-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                    <p className="font-bold text-slate-900 dark:text-white">{currentUser.full_name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{currentUser.email}</p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                      Status: {currentUser.role === 'admin' ? 'ADMIN' : currentUser.role.toUpperCase()}
                    </p>
                  </div>

                  {currentUser.role === 'student' && (
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        setRetakeQuizOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Retake AI Learning Quiz</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </nav>
  );
};
