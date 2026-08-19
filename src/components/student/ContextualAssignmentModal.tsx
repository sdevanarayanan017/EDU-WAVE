'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Assignment } from '@/lib/types';
import {
  X,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Sparkles,
  Layers,
  FileText,
  Bookmark,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface ContextualAssignmentModalProps {
  assignment: Assignment | null;
  onClose: () => void;
}

export const ContextualAssignmentModal: React.FC<ContextualAssignmentModalProps> = ({
  assignment,
  onClose,
}) => {
  const {
    syllabi,
    toggleSubTaskCompletion,
    setActiveAssignmentContext,
    setSocraticDrawerOpen,
  } = useApp();

  if (!assignment) return null;

  // Query matching syllabus by class_id or subject or topic
  const matchingSyllabus = syllabi.find(
    s =>
      s.class_id === assignment.class_id ||
      s.subject_name.toLowerCase() === assignment.subject_name.toLowerCase() ||
      s.topic_name.toLowerCase().includes(assignment.topic_tag.toLowerCase())
  ) || syllabi[0];

  const handleLaunchSocraticTutor = () => {
    setActiveAssignmentContext(assignment);
    setSocraticDrawerOpen(true);
    onClose();
  };

  const priorityColors = {
    critical: 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800',
    high: 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800',
    medium: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800',
    low: 'bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 border-sky-300 dark:border-sky-800',
  };

  const subTasks = assignment.sub_tasks || [];
  const completedCount = subTasks.filter(st => st.completed).length;
  const progressPercent = subTasks.length > 0 ? Math.round((completedCount / subTasks.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-5xl my-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Top Header Bar */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 font-bold">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                  {assignment.subject_name} • {assignment.class_name}
                </span>
                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${priorityColors[assignment.priority_level]}`}>
                  {assignment.priority_level} Priority
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-tight">
                {assignment.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLaunchSocraticTutor}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask Socratic Tutor</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Side-by-Side Contextual Workspace */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
          
          {/* LEFT COLUMN: Assignment Instructions & Sub-Tasks */}
          <div className="lg:col-span-7 p-6 space-y-6">
            
            {/* Meta tags */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Due: <strong className="text-slate-900 dark:text-white">{new Date(assignment.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Estimated Effort: <strong className="text-slate-900 dark:text-white">{assignment.estimated_hours} Hours</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Bookmark className="w-4 h-4 text-slate-400" />
                <span>Topic: <strong className="text-slate-900 dark:text-white">{assignment.topic_tag}</strong></span>
              </div>
            </div>

            {/* Assignment Instructions */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                Assignment Instructions
              </h3>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {assignment.description}
              </div>
            </div>

            {/* Task Breakdown (Gemini Auto-Divided) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Task Breakdown (Gemini Divided Milestones)
                  </h3>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                    {completedCount} / {subTasks.length} Done
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                  {progressPercent}%
                </span>
              </div>

              {/* Progress track */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mb-4">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Subtasks checklist */}
              <div className="space-y-2.5">
                {subTasks.length > 0 ? (
                  subTasks.map((st) => (
                    <div
                      key={st.id}
                      onClick={() => toggleSubTaskCompletion(assignment.id, st.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                        st.completed
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60 text-slate-500 dark:text-slate-400'
                          : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/80 hover:border-emerald-500 dark:hover:border-emerald-500 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <button
                        type="button"
                        className="mt-0.5 text-emerald-600 dark:text-emerald-400 shrink-0"
                        aria-label={st.completed ? 'Mark incomplete' : 'Mark complete'}
                      >
                        {st.completed ? (
                          <CheckCircle2 className="w-5 h-5 fill-emerald-500 text-white" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-400" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold ${st.completed ? 'line-through opacity-75' : ''}`}>
                          Step {st.step_number}: {st.title}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                          Target date: {new Date(st.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No sub-milestones assigned.</p>
                )}
              </div>
            </div>

            {/* Mobile Socratic trigger button */}
            <div className="sm:hidden pt-2">
              <button
                onClick={handleLaunchSocraticTutor}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold shadow-md flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Open Socratic AI Tutor</span>
              </button>
            </div>

          </div>

          {/* RIGHT COLUMN: Contextual Syllabus & Study Notes */}
          <div className="lg:col-span-5 p-6 bg-slate-50/50 dark:bg-slate-900/50 space-y-6">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold">
                  <Layers className="w-4 h-4" />
                </span>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Contextual Course Reference
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {matchingSyllabus.unit_number}
              </span>
            </div>

            {/* Unit & Topic */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
              <div>
                <p className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500">
                  Topic Module
                </p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {matchingSyllabus.topic_name}
                </p>
              </div>

              {/* Key Concepts Pills */}
              <div>
                <p className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 mb-1.5">
                  Key Concepts & Equations
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {matchingSyllabus.key_concepts.map((concept, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700/80 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommended Textbook Reference */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-start gap-2.5">
                <FileText className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500">
                    Recommended Reading
                  </p>
                  <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                    {matchingSyllabus.textbook_reference}
                  </p>
                </div>
              </div>
            </div>

            {/* Teacher Uploaded Notes Snippets */}
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 shadow-sm space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                <Bookmark className="w-3.5 h-3.5" />
                <span>Teacher High-Yield Snippet</span>
              </div>
              <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed italic">
                "{matchingSyllabus.teacher_notes_snippets}"
              </p>
            </div>

            {/* Core Course Summary */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-sm space-y-2">
              <p className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500">
                Module Synopsis
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {matchingSyllabus.content_text}
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
