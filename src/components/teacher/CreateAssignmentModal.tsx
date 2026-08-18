'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { PriorityLevel, SubTask } from '@/lib/types';
import { checkScheduleCollision } from '@/lib/stressEngine';
import {
  X,
  Sparkles,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Bookmark,
  Layers,
  ArrowRight,
  ShieldAlert,
  ListTodo
} from 'lucide-react';

interface CreateAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateAssignmentModal: React.FC<CreateAssignmentModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    classes,
    selectedClassId,
    setSelectedClassId,
    assignments,
    events,
    createAssignment,
    currentUser,
  } = useApp();

  const [title, setTitle] = useState('');
  const [topicTag, setTopicTag] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split('T')[0];
  });
  const [priorityLevel, setPriorityLevel] = useState<PriorityLevel>('medium');
  const [estimatedHours, setEstimatedHours] = useState<number>(3.0);

  // Gemini AI Assisted State
  const [isAnalyzingCollision, setIsAnalyzingCollision] = useState(false);
  const [aiCollisionResult, setAiCollisionResult] = useState<any>(null);
  const [isSubdividing, setIsSubdividing] = useState(false);
  const [generatedSubtasks, setGeneratedSubtasks] = useState<
    { step_number: number; title: string; due_date: string; completed: boolean }[]
  >([]);

  const activeClass = classes.find(c => c.id === selectedClassId) || classes[0];

  // Local collision warning
  const localCollision = checkScheduleCollision(dueDate, activeClass?.id || 'cls-1', assignments, events);

  if (!isOpen) return null;

  const handleAiAnalyzeCollision = async () => {
    setIsAnalyzingCollision(true);
    try {
      const classAssignments = assignments.filter(a => a.class_id === activeClass.id);
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'analyze_collision',
          classId: activeClass.id,
          className: activeClass.name,
          proposedDate: dueDate,
          title: title || 'New Assignment',
          subject: activeClass.subject,
          existingAssignments: classAssignments.map(a => ({
            title: a.title,
            subject: a.subject_name,
            dueDate: a.due_date,
          })),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiCollisionResult(data.analysis);
      }
    } catch (err) {
      console.error('Collision check error:', err);
    } finally {
      setIsAnalyzingCollision(false);
    }
  };

  const handleAiSubdivide = async () => {
    setIsSubdividing(true);
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'subdivide_task',
          title: title || 'Course Project Report',
          topic: topicTag || activeClass.subject,
          description: description || 'Complete comprehensive analysis and lab synthesis.',
          dueDate: dueDate,
          estimatedHours: estimatedHours,
        }),
      });
      const data = await res.json();
      if (data.success && data.subtasks) {
        setGeneratedSubtasks(data.subtasks);
      }
    } catch (err) {
      console.error('Subdivide error:', err);
    } finally {
      setIsSubdividing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    const mappedSubtasks: SubTask[] = generatedSubtasks.map((st, idx) => ({
      id: `st-${Date.now()}-${idx}`,
      title: st.title,
      due_date: st.due_date,
      completed: false,
      step_number: st.step_number || idx + 1,
    }));

    createAssignment({
      class_id: activeClass.id,
      class_name: activeClass.name,
      subject_name: activeClass.subject || 'General Studies',
      title,
      topic_tag: topicTag || activeClass.subject || 'General',
      description,
      due_date: dueDate,
      priority_level: priorityLevel,
      estimated_hours: Number(estimatedHours),
      teacher_id: currentUser?.id || 'usr-tch-1',
      teacher_name: currentUser?.full_name || 'Teacher',
      sub_tasks: mappedSubtasks,
    });

    onClose();
    // Reset form
    setTitle('');
    setTopicTag('');
    setDescription('');
    setGeneratedSubtasks([]);
    setAiCollisionResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl my-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Create Assignment with AI Assistant
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Prevent student deadline collision with cross-subject intelligence & automated task breakdown.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Class Selector & Topic Tag */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Assigned Class & Section
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.section})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Topic Tag / Unit Name
              </label>
              <input
                type="text"
                value={topicTag}
                onChange={(e) => setTopicTag(e.target.value)}
                placeholder="e.g. Photosynthesis, Linear Algebra"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Assignment Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Cellular Respiration & ATP Synthesis Lab Report"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Due Date & Collision Check Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Target Due Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Priority Level
              </label>
              <select
                value={priorityLevel}
                onChange={(e) => setPriorityLevel(e.target.value as PriorityLevel)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="low">Low (1.0x Stress)</option>
                <option value="medium">Medium (2.0x Stress)</option>
                <option value="high">High - Coral (3.0x Stress)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Estimated Effort (Hrs)
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  min="0.5"
                  max="20"
                  step="0.5"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(parseFloat(e.target.value))}
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Cross-Subject Collision Warning Banner */}
          <div
            className={`p-3.5 rounded-2xl border flex items-start justify-between gap-3 text-xs ${
              localCollision.severity === 'coral'
                ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
                : localCollision.severity === 'amber'
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {localCollision.severity !== 'none' ? (
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold">{localCollision.message}</p>
                {localCollision.recommended_alternative_dates && localCollision.recommended_alternative_dates.length > 0 && (
                  <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-semibold opacity-90">AI Recommended Alternative Dates:</span>
                    {localCollision.recommended_alternative_dates.map((d: string) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDueDate(d)}
                        className="px-2 py-0.5 bg-white dark:bg-slate-800 rounded font-bold underline text-[11px]"
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleAiAnalyzeCollision}
              disabled={isAnalyzingCollision}
              className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-900 dark:bg-slate-700 text-white font-bold text-[11px] shadow-sm flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>{isAnalyzingCollision ? 'Analyzing...' : 'Deep AI Check'}</span>
            </button>
          </div>

          {/* Detailed Gemini AI Collision Insight if checked */}
          {aiCollisionResult && (
            <div className="p-3.5 rounded-2xl bg-slate-900 text-white text-xs space-y-1.5 animate-in fade-in">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Gemini Workload Distribution Analysis:</span>
              </div>
              <p className="text-slate-300 leading-relaxed">{aiCollisionResult.analysis}</p>
              <p className="text-emerald-300 text-[11px]">💡 Tip: {aiCollisionResult.burnout_mitigation_tip}</p>
            </div>
          )}

          {/* Description */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Assignment Instructions & Notes
              </label>
              <button
                type="button"
                onClick={handleAiSubdivide}
                disabled={isSubdividing}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isSubdividing ? 'Dividing...' : 'Gemini Auto-Divide Milestones'}</span>
              </button>
            </div>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide assignment guidelines, expected sections, and lab requirements..."
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Auto-divided sub-tasks preview */}
          {generatedSubtasks.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <ListTodo className="w-4 h-4" />
                <span>Gemini Subdivided Milestones (Included for students):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {generatedSubtasks.map((st, i) => (
                  <div key={i} className="p-2 rounded-xl bg-white dark:bg-slate-800 text-xs border border-slate-200 dark:border-slate-700">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">
                      Step {st.step_number}: {st.title}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">Target: {st.due_date}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-slate-900 to-emerald-700 hover:from-slate-800 hover:to-emerald-600 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Publish Assignment</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
