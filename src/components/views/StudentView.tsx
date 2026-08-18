'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Assignment, InstitutionalEvent } from '@/lib/types';
import { ContextualAssignmentModal } from '../student/ContextualAssignmentModal';
import { StudySessionTimerModal } from '../student/StudySessionTimerModal';
import { LearningProfileQuizModal } from '../student/LearningProfileQuizModal';
import { getTopNextTaskRecommendation } from '@/lib/learningProfileEngine';
import {
  Activity,
  Calendar as CalendarIcon,
  BookOpen,
  FolderGit2,
  Sliders,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertTriangle,
  Flame,
  ArrowUpRight,
  Plus,
  Layers,
  ChevronRight,
  TrendingDown,
  BrainCircuit,
  Filter,
  Search,
  Check,
  MessageSquare,
  Paperclip,
  Send,
  FileText,
  Download,
  CalendarRange,
  Timer,
  Play,
  HelpCircle,
} from 'lucide-react';

interface StudentViewProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

interface ProjectMessage {
  id: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  time: string;
  isSelf?: boolean;
}

interface ProjectFile {
  id: string;
  name: string;
  size: string;
  uploadedBy: string;
  date: string;
  type: string;
}

export const StudentView: React.FC<StudentViewProps> = ({ activeTab, setActiveTab }) => {
  const {
    assignments,
    syllabi,
    events,
    projectGroups,
    studentLearningProfile,
    personalizedTimetable,
    studentStressResult,
    studySessionLogs,
    retakeQuizOpen,
    setRetakeQuizOpen,
    toggleSubTaskCompletion,
    updateProjectTaskStatus,
    createProjectTask,
    createEvent,
    currentUser,
  } = useApp();

  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTimerModalOpen, setTimerModalOpen] = useState(false);

  // Personal Event creation state
  const [isPersonalEventModalOpen, setPersonalEventModalOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Project Task Creation state
  const [newProjectTaskTitle, setNewProjectTaskTitle] = useState('');
  const [activeGroupId, setActiveGroupId] = useState<string>(projectGroups[0]?.id || 'proj-1');

  // Project Collaboration: Discussion & Files Sub-Tabs
  const [projectSubTab, setProjectSubTab] = useState<'tasks' | 'chat' | 'files'>('tasks');
  const [chatInput, setChatInput] = useState('');
  const [projectMessages, setProjectMessages] = useState<ProjectMessage[]>([
    {
      id: 'm1',
      senderName: 'Maya Patel',
      senderAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      text: 'Hey team! I completed the Raft consensus leader election loop. Check the architecture doc in the repository.',
      time: '10:14 AM',
    },
    {
      id: 'm2',
      senderName: 'Liam Smith',
      senderAvatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150',
      text: 'Great work Maya! I am running the write-ahead logging concurrency test now.',
      time: '10:28 AM',
    },
  ]);

  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([
    {
      id: 'f1',
      name: 'Distributed_Store_Architecture_Spec.pdf',
      size: '2.8 MB',
      uploadedBy: 'Alex Chen',
      date: 'Aug 14, 2026',
      type: 'PDF Document',
    },
  ]);

  const topRecommendation = getTopNextTaskRecommendation(assignments, studentLearningProfile);

  const filteredAssignments = assignments.filter((a) => {
    const matchSubj = subjectFilter === 'all' || a.subject_name.toLowerCase() === subjectFilter.toLowerCase();
    const matchSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || a.topic_tag.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSubj && matchSearch;
  });

  const handleCreatePersonalEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;
    createEvent({
      title: newEventTitle,
      event_type: 'personal',
      start_date: newEventDate,
      end_date: newEventDate,
      target_role: 'students',
      created_by: currentUser?.id || 'usr-stu-1',
      created_by_name: currentUser?.full_name || 'Alex Chen',
      description: 'Personal study session or extracurricular activity entry.',
    });
    setNewEventTitle('');
    setPersonalEventModalOpen(false);
  };

  const handleCreateProjectTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTaskTitle.trim()) return;
    createProjectTask(activeGroupId, {
      title: newProjectTaskTitle,
      description: 'Collaborative milestone item.',
      assigned_to: currentUser?.id || 'usr-stu-1',
      assigned_to_name: currentUser?.full_name || 'Alex Chen',
      status: 'todo',
      due_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    });
    setNewProjectTaskTitle('');
  };

  const handleSendProjectMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const newMsg: ProjectMessage = {
      id: `m-${Date.now()}`,
      senderName: currentUser?.full_name || 'Alex Chen',
      senderAvatar: currentUser?.avatar_url || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: true,
    };
    setProjectMessages(prev => [...prev, newMsg]);
    setChatInput('');
  };

  const priorityBadge = (level: string) => {
    switch (level) {
      case 'critical':
      case 'high':
        return 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'medium':
        return 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* OVERVIEW TAB: Stress Prediction Engine & Burnout Dashboard */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Top Hero: Real-time Mathematical Stress Gauge */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 text-white shadow-2xl border border-slate-700/60">
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Details */}
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Proactive Stress & Workload Forecast</span>
                </div>
                
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                  Welcome back, {currentUser?.full_name || 'Alex'}!
                </h1>
                
                <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                  Your academic schedule is calibrated across{' '}
                  <strong className="text-white">{assignments.length} assignments</strong> and your 15-question numerical learning profile ({studentLearningProfile.overallWorkloadCapacity}h/wk capacity).
                </p>

                {/* Anti-Burnout AI Actionable Recommendations */}
                <div className="space-y-2 pt-2">
                  {studentStressResult.actionable_recommendations.map((rec, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-slate-200 flex items-start gap-2.5"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{rec}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setActiveTab('assignments')}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Open Contextual Assignment Workspace</span>
                  </button>

                  <button
                    onClick={() => setTimerModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-1.5"
                  >
                    <Timer className="w-3.5 h-3.5" />
                    <span>Study Timer</span>
                  </button>

                  <button
                    onClick={() => setRetakeQuizOpen(true)}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-1.5"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Retake 15-MCQ Quiz</span>
                  </button>
                </div>
              </div>

              {/* Right Gauge Widget */}
              <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 text-center">
                <div className="relative flex items-center justify-center w-36 h-36">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="10"
                      className="text-white/10"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke="currentColor"
                      strokeWidth="10"
                      strokeDasharray={251.2}
                      strokeDashoffset={251.2 - (251.2 * studentStressResult.normalized_score) / 100}
                      strokeLinecap="round"
                      className={
                        studentStressResult.normalized_score >= 70
                          ? 'text-red-400'
                          : studentStressResult.normalized_score >= 45
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black font-mono tracking-tighter">
                      {studentStressResult.normalized_score}%
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                      Stress Level
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                      studentStressResult.stress_level === 'Critical'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : studentStressResult.stress_level === 'Elevated'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {studentStressResult.stress_level} Workload Risk
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1 font-mono">
                    Capacity: {studentLearningProfile.overallWorkloadCapacity}h / week
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* PROMINENT "WHAT SHOULD I DO NEXT?" FEATURE (Section 25 & 103) */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/30 dark:border-emerald-500/20 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-emerald-500 text-slate-950 shrink-0 font-black shadow-md shadow-emerald-500/20">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  Recommended Next Task • AI Transparent Reasoning
                </span>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  {topRecommendation.title}
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                  {topRecommendation.reason}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
              <button
                onClick={() => setTimerModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start {topRecommendation.estimated_minutes}m Focus Block</span>
              </button>
            </div>
          </div>

          {/* 14-Day Projected Workload Timeline Curve */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  14-Day Cognitive Load & Deadline Forecast
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Calculated daily stress intensity highlighting deadline clustering
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-semibold">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Low
                </span>
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Moderate
                </span>
                <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                  <span className="w-2 h-2 rounded-full bg-red-500" /> Peak Collision
                </span>
              </div>
            </div>

            {/* Grid of 14 Days */}
            <div className="grid grid-cols-2 sm:grid-cols-7 lg:grid-cols-14 gap-2">
              {studentStressResult.daily_projections.map((day, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col justify-between min-h-[110px] ${
                    day.status === 'critical'
                      ? 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800/80 ring-2 ring-red-500/20'
                      : day.status === 'elevated'
                      ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800/80'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60'
                  }`}
                >
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
                      {day.dayName || day.day_name}
                    </span>
                    <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                      {day.displayDate || day.display_date}
                    </p>
                  </div>

                  <div className="my-2">
                    <div
                      className={`text-sm font-extrabold font-mono ${
                        day.status === 'critical'
                          ? 'text-red-600 dark:text-red-400'
                          : day.status === 'elevated'
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {day.stress_score}%
                    </div>
                  </div>

                  <div>
                    {day.tasks_due_count > 0 ? (
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          day.status === 'critical'
                            ? 'bg-red-100 dark:bg-red-900/60 text-red-800 dark:text-red-200'
                            : 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200'
                        }`}
                        title={day.task_titles.join(', ')}
                      >
                        {day.tasks_due_count} Deadline{day.tasks_due_count > 1 ? 's' : ''}
                      </span>
                    ) : (
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">
                        Free Slot
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Assignments & Daily Personalized Timetable */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Personalized Timetable Schedule */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Personalized AI Daily Timetable (Sections 18 & 102)
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Generated from learning profile, focus duration ({studentLearningProfile.focusDurationScore * 15}m), and deadlines.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('assignments')}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span>All Tasks ({assignments.length})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {personalizedTimetable.slice(0, 3).map((day, dIdx) => (
                  <div
                    key={dIdx}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {day.day_name}, {day.display_date}
                        </span>
                        {day.is_overloaded && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-red-100 dark:bg-red-950 text-red-600">
                            Workload Overloaded
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">
                        {day.total_study_minutes} mins scheduled / {day.capacity_minutes}m capacity
                      </span>
                    </div>

                    <div className="space-y-2">
                      {day.tasks.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-2 text-center">
                          Free study slot or personal buffer time.
                        </p>
                      ) : (
                        day.tasks.map((task) => (
                          <div
                            key={task.id}
                            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 dark:text-white">
                                {task.title}
                              </span>
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                                {task.duration_minutes} Mins
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                              💡 {task.recommendation_reason}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Institutional Events & Key Dates */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Events & Key Dates
                </h2>
                <button
                  onClick={() => setPersonalEventModalOpen(true)}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Personal
                </button>
              </div>

              <div className="space-y-3">
                {events.map((evt) => (
                  <div
                    key={evt.id}
                    className={`p-3.5 rounded-2xl border text-xs ${
                      evt.event_type === 'exam'
                        ? 'bg-red-50/70 dark:bg-red-950/30 border-red-200 dark:border-red-900/60'
                        : evt.event_type === 'holiday'
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {evt.title}
                      </span>
                      <span
                        className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                          evt.event_type === 'exam'
                            ? 'bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-200'
                            : evt.event_type === 'holiday'
                            ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {evt.event_type}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {evt.description}
                    </p>
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                      <Clock className="w-3 h-3" />
                      <span>{evt.start_date} {evt.start_date !== evt.end_date ? `to ${evt.end_date}` : ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ASSIGNMENTS TAB: Contextual Assignment Workspace */}
      {activeTab === 'assignments' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Contextual Assignment Workspace
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click any task to view integrated course notes, textbook references, and Gemini milestone breakdowns.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search assignments..."
                  className="pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAssignments.map((asg) => {
              const subTasks = asg.sub_tasks || [];
              const completed = subTasks.filter(st => st.completed).length;

              return (
                <div
                  key={asg.id}
                  className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 shadow-sm transition-all flex flex-col justify-between gap-4 group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {asg.subject_name} • {asg.class_name}
                      </span>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${priorityBadge(asg.priority_level)}`}>
                        {asg.priority_level} Priority
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {asg.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                      {asg.description}
                    </p>

                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Due {asg.due_date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {asg.estimated_hours}h Effort
                      </span>
                    </div>
                  </div>

                  {/* Subtasks snippet */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      <span>Milestone Progress</span>
                      <span>{completed} / {subTasks.length} Completed</span>
                    </div>

                    <div className="space-y-1.5">
                      {subTasks.map((st) => (
                        <div
                          key={st.id}
                          onClick={() => toggleSubTaskCompletion(asg.id, st.id)}
                          className="flex items-center gap-2 text-xs cursor-pointer select-none"
                        >
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
                              st.completed
                                ? 'bg-emerald-500 text-white'
                                : 'border border-slate-300 dark:border-slate-600'
                            }`}
                          >
                            {st.completed && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className={`text-[11px] truncate ${st.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                            {st.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedAssignment(asg)}
                    className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-emerald-600 dark:hover:bg-emerald-600 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Open Contextual Study Reference</span>
                  </button>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* CALENDAR TAB */}
      {activeTab === 'calendar' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Personalized Academic Timeline
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Color-coded calendar mapping assignments, exams, reading days, and personal study sessions.
              </p>
            </div>

            <button
              onClick={() => setPersonalEventModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 text-white text-xs font-bold shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Personal Event</span>
            </button>
          </div>

          <div className="space-y-4">
            {assignments.map((asg) => (
              <div
                key={asg.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {asg.subject_name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Due {asg.due_date}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {asg.title}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedAssignment(asg)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-emerald-500 hover:text-white transition-colors"
                >
                  View Details
                </button>
              </div>
            ))}

            {events.map((evt) => (
              <div
                key={evt.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`p-2.5 rounded-2xl shrink-0 font-bold ${
                    evt.event_type === 'exam'
                      ? 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400'
                      : 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                  }`}>
                    <CalendarRange className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        {evt.event_type}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {evt.start_date}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {evt.title}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PROJECTS TAB */}
      {activeTab === 'projects' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Project Collaboration Workspace
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Team discussion channels, shared file storage, and Kanban milestone tracking.
              </p>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setProjectSubTab('tasks')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                  projectSubTab === 'tasks'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                <FolderGit2 className="w-3.5 h-3.5" />
                <span>Task Board</span>
              </button>

              <button
                onClick={() => setProjectSubTab('chat')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                  projectSubTab === 'chat'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Team Channel</span>
              </button>

              <button
                onClick={() => setProjectSubTab('files')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                  projectSubTab === 'files'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span>Files</span>
              </button>
            </div>
          </div>

          {projectGroups.map((group) => (
            <div
              key={group.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {group.subject_name} • {group.class_name}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {group.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {group.description}
                  </p>
                </div>
              </div>

              {/* Tasks */}
              {projectSubTab === 'tasks' && (
                <div className="space-y-4">
                  <form onSubmit={handleCreateProjectTask} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newProjectTaskTitle}
                      onChange={(e) => setNewProjectTaskTitle(e.target.value)}
                      placeholder="Add milestone task..."
                      className="flex-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-slate-900 dark:bg-emerald-600 text-white rounded-xl text-xs font-bold"
                    >
                      Add Task
                    </button>
                  </form>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    {(['todo', 'in_progress', 'review', 'done'] as const).map((status) => (
                      <div
                        key={status}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 flex flex-col gap-2 min-h-[160px]"
                      >
                        <span className="text-[11px] font-bold uppercase text-slate-500">
                          {status}
                        </span>
                        {group.tasks.filter(t => t.status === status).map(t => (
                          <div
                            key={t.id}
                            className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                          >
                            <p className="font-semibold text-slate-900 dark:text-white">{t.title}</p>
                            {status !== 'done' && (
                              <button
                                onClick={() => updateProjectTaskStatus(group.id, t.id, status === 'todo' ? 'in_progress' : status === 'in_progress' ? 'review' : 'done')}
                                className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline pt-1 block"
                              >
                                Advance →
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat */}
              {projectSubTab === 'chat' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3 max-h-72 overflow-y-auto">
                    {projectMessages.map(msg => (
                      <div key={msg.id} className="text-xs space-y-0.5">
                        <span className="font-bold text-slate-900 dark:text-white">{msg.senderName} ({msg.time}): </span>
                        <span className="text-slate-600 dark:text-slate-300">{msg.text}</span>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={handleSendProjectMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      placeholder="Type a team message..."
                      className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                    <button type="submit" className="p-2 bg-emerald-600 text-white rounded-xl">
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}

              {/* Files */}
              {projectSubTab === 'files' && (
                <div className="space-y-2">
                  {projectFiles.map(file => (
                    <div key={file.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">{file.name} ({file.size})</span>
                      <button onClick={() => alert(`Downloading ${file.name}`)} className="p-1.5 text-slate-400 hover:text-slate-600">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

            </div>
          ))}
        </div>
      )}

      {/* Contextual Assignment Modal */}
      {selectedAssignment && (
        <ContextualAssignmentModal
          assignment={selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
        />
      )}

      {/* Live Study Session Timer Modal */}
      <StudySessionTimerModal
        isOpen={isTimerModalOpen}
        onClose={() => setTimerModalOpen(false)}
      />

      {/* 15-Question Learning Profile Quiz Modal */}
      <LearningProfileQuizModal
        isOpen={retakeQuizOpen}
        onClose={() => setRetakeQuizOpen(false)}
      />

      {/* Personal Event Modal */}
      {isPersonalEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-3">
              Add Personal Study Event
            </h3>
            <form onSubmit={handleCreatePersonalEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                  Event Title
                </label>
                <input
                  type="text"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="e.g. Database Schema Revision"
                  required
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                  Date
                </label>
                <input
                  type="date"
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPersonalEventModalOpen(false)}
                  className="px-3 py-2 text-xs font-bold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
