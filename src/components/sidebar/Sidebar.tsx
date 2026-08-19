'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  FolderGit2,
  Sliders,
  ShieldCheck,
  Building2,
  Users,
  KeyRound,
  FileSpreadsheet,
  Activity,
  CalendarRange,
  GraduationCap,
  Sparkles,
  Layers,
  HeartHandshake,
  Bot,
  Briefcase,
  Timer,
  Bell,
  CheckCircle2,
  BarChart3,
  TrendingUp,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen,
}) => {
  const { currentUser, studentStressResult, setSocraticDrawerOpen, setRetakeQuizOpen } = useApp();
  const role = currentUser?.role || 'student';

  const navConfig = {
    student: [
      { id: 'overview', label: 'Stress & Timetable', icon: <Activity className="w-4 h-4" /> },
      { id: 'assignments', label: 'Assignments & Notes', icon: <BookOpen className="w-4 h-4" /> },
      { id: 'calendar', label: 'Academic Calendar', icon: <Calendar className="w-4 h-4" /> },
      { id: 'projects', label: 'Project Hub & Teams', icon: <FolderGit2 className="w-4 h-4" /> },
      { id: 'events', label: 'Event Organizers', icon: <HeartHandshake className="w-4 h-4" /> },
      { id: 'diagnostics', label: '15-MCQ Learning Profile', icon: <Sliders className="w-4 h-4" /> },
    ],
    teacher: [
      { id: 'overview', label: 'Class Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
      { id: 'cross-calendar', label: 'Cross-Subject Calendar', icon: <CalendarRange className="w-4 h-4" /> },
      { id: 'student-timetable', label: 'Student Timetable View', icon: <GraduationCap className="w-4 h-4" /> },
      { id: 'analytics', label: 'Student Analytics', icon: <Activity className="w-4 h-4" /> },
      { id: 'assignments', label: 'AI Assignment Creator', icon: <Sparkles className="w-4 h-4 text-sky-500" /> },
      { id: 'knowledge', label: 'Course Knowledge Base', icon: <BookOpen className="w-4 h-4" /> },
      { id: 'projects', label: 'Project Oversight', icon: <FolderGit2 className="w-4 h-4" /> },
      { id: 'events', label: 'Event Organizers', icon: <HeartHandshake className="w-4 h-4" /> },
    ],
    hod: [
      { id: 'overview', label: 'Department Heatmap', icon: <Activity className="w-4 h-4" /> },
      { id: 'analytics', label: 'Workload Analytics', icon: <BarChart3 className="w-4 h-4" /> },
      { id: 'performance', label: 'Performance Analytics', icon: <TrendingUp className="w-4 h-4" /> },
      { id: 'events', label: 'Official Event Planner', icon: <Calendar className="w-4 h-4" /> },
      { id: 'volunteers', label: 'Event Organizers', icon: <HeartHandshake className="w-4 h-4" /> },
    ],
    admin: [
      { id: 'overview', label: 'Overview & Metrics', icon: <LayoutDashboard className="w-4 h-4" /> },
      { id: 'students', label: 'Students Directory', icon: <GraduationCap className="w-4 h-4" /> },
      { id: 'teachers', label: 'Faculty Allocation', icon: <Users className="w-4 h-4" /> },
      { id: 'hods', label: 'Department Heads (HOD)', icon: <Briefcase className="w-4 h-4" /> },
      { id: 'departments', label: 'Academic Departments', icon: <Building2 className="w-4 h-4" /> },
      { id: 'subjects', label: 'Subjects & Classes', icon: <BookOpen className="w-4 h-4" /> },
      { id: 'audit', label: 'Audit Logs & WhatsApp', icon: <ShieldCheck className="w-4 h-4" /> },
    ],
  };

  const navItems = navConfig[role] || navConfig.student;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-16 left-0 z-30 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between p-4 transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          
          {/* User Persona Pill */}
          <div className="p-3 rounded-2xl bg-sky-50 dark:bg-slate-800/70 border border-sky-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0">
                <img
                  src={currentUser?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                  alt="User"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {currentUser?.full_name || 'Guest User'}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-sky-100/80 dark:bg-slate-700/80 text-sky-700 dark:text-sky-300">
                    {currentUser?.unique_id || 'ADMIN@123'}
                  </span>
                  <span className="text-[10px] font-black uppercase text-sky-600 dark:text-sky-400">
                    {role === 'admin' ? 'ADMIN' : role}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Navigation Portal
            </p>
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-sky-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Floating Quick Action Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          
          {role === 'student' && (
            <div className="p-3 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/40 dark:to-blue-950/30 border border-sky-200 dark:border-sky-800/60 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-sky-800 dark:text-sky-300">Workload Level</span>
                <span className="font-mono text-sky-600 dark:text-sky-400">
                  {studentStressResult.normalized_score}%
                </span>
              </div>
              <div className="w-full bg-sky-200/60 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    studentStressResult.normalized_score > 70
                      ? 'bg-red-500'
                      : studentStressResult.normalized_score > 45
                      ? 'bg-amber-500'
                      : 'bg-sky-500'
                  }`}
                  style={{ width: `${studentStressResult.normalized_score}%` }}
                />
              </div>
            </div>
          )}

          {/* Socratic Chatbot Trigger */}
          <button
            onClick={() => setSocraticDrawerOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-md shadow-sky-500/30 transition-all active:scale-95"
          >
            <Bot className="w-4 h-4" />
            <span>AI Socratic Study Tutor</span>
          </button>
        </div>

      </aside>
    </>
  );
};
