'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { CreateAssignmentModal } from '../teacher/CreateAssignmentModal';
import { EventSectionCategory } from '@/lib/types';
import {
  Users,
  Calendar as CalendarIcon,
  BookOpen,
  FolderGit2,
  Plus,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  ChevronDown,
  Activity,
  UploadCloud,
  FileText,
  CalendarRange,
  Bookmark,
  TrendingDown,
  Check,
  BarChart3,
  TrendingUp,
  GraduationCap,
  Filter,
  User,
  Phone,
  Mail,
  AlertCircle,
  HeartHandshake,
} from 'lucide-react';

interface TeacherViewProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const TeacherView: React.FC<TeacherViewProps> = ({ activeTab, setActiveTab }) => {
  const {
    classes,
    selectedClassId,
    setSelectedClassId,
    assignments,
    syllabi,
    events,
    projectGroups,
    eventStaffMembers,
    studentExamRecords,
    users,
    createSyllabusItem,
    currentUser,
  } = useApp();

  const [isCreateAssignmentOpen, setCreateAssignmentOpen] = useState(false);

  // New Syllabus item form state
  const [isUploadSyllabusOpen, setUploadSyllabusOpen] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [newUnitNum, setNewUnitNum] = useState('');
  const [newConcepts, setNewConcepts] = useState('');
  const [newTextbookRef, setNewTextbookRef] = useState('');
  const [newTeacherNotes, setNewTeacherNotes] = useState('');
  const [newContentText, setNewContentText] = useState('');

  // Tab filter states
  const [studentTimetableFilter, setStudentTimetableFilter] = useState({ classId: 'all', studentId: 'all' });
  const [analyticsSubTab, setAnalyticsSubTab] = useState<'workload' | 'exams'>('workload');
  const [eventSectionFilter, setEventSectionFilter] = useState<string>('all');

  const activeClass = classes.find(c => c.id === selectedClassId) || classes[0];

  // All assignments for this class (cross-subject)
  const classAssignments = assignments.filter(a => a.class_id === activeClass?.id);
  const classSyllabi = syllabi.filter(s => s.class_id === activeClass?.id);
  const classProjects = projectGroups.filter(p => p.class_id === activeClass?.id);

  const handleUploadSyllabus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim() || !activeClass) return;

    createSyllabusItem({
      class_id: activeClass.id,
      class_name: activeClass.name,
      subject_name: activeClass.subject || 'General Studies',
      topic_name: newTopicName,
      unit_number: newUnitNum || 'Unit 1.1',
      key_concepts: newConcepts.split(',').map(c => c.trim()).filter(Boolean),
      content_text: newContentText,
      textbook_reference: newTextbookRef,
      teacher_notes_snippets: newTeacherNotes,
      uploaded_by: currentUser?.id || 'usr-tch-1',
    });

    setNewTopicName('');
    setNewUnitNum('');
    setNewConcepts('');
    setNewTextbookRef('');
    setNewTeacherNotes('');
    setNewContentText('');
    setUploadSyllabusOpen(false);
  };

  // Generate 14-day collision matrix
  const matrixDays = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

    const dayAssignments = assignments.filter(a => {
      const aDate = new Date(a.due_date).toISOString().split('T')[0];
      return aDate === dateStr;
    });

    const dayExams = events.filter(e => {
      const eDate = new Date(e.start_date).toISOString().split('T')[0];
      return eDate === dateStr && e.event_type === 'exam';
    });

    const isCollision = dayAssignments.length >= 2 || dayExams.length > 0;
    const isHeavyCollision = dayAssignments.length >= 3 || (dayExams.length > 0 && dayAssignments.length > 0);

    return {
      date: dateStr,
      displayDate,
      dayName,
      assignments: dayAssignments,
      exams: dayExams,
      isCollision,
      isHeavyCollision,
    };
  });

  return (
    <div className="space-y-6">
      
      {/* Top Class Selector & Action Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 font-bold">
              <Users className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
              Teacher Instruction Suite
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {activeClass?.name || 'Class Overview'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Room: {activeClass?.room_number} • Enrolled: {activeClass?.student_count} Students • Term: {activeClass?.term}
          </p>
        </div>

        {/* Switch Class Dropdown & Create Assignment Button */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.section})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setCreateAssignmentOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-sky-500/25 transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Create Assignment</span>
          </button>
        </div>
      </div>

      {/* OVERVIEW / CLASS ANALYTICS TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Active Assignments
              </span>
              <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {classAssignments.length}
              </p>
              <p className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold">
                Syllabus-linked & subdivided
              </p>
            </div>

            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Syllabus Units Ingested
              </span>
              <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {classSyllabi.length}
              </p>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                Available for AI Context
              </p>
            </div>

            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Group Projects Active
              </span>
              <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {classProjects.length}
              </p>
              <p className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold">
                Kanban milestone tracking
              </p>
            </div>

            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Collision Risk Index
              </span>
              <p className="text-2xl font-black text-sky-600 dark:text-sky-400 font-mono">
                Low Risk
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Cross-subject balancing active
              </p>
            </div>
          </div>

          {/* Active Class Schedule & Recent Uploads */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Current Assignments for {activeClass?.name}
                </h2>
                <button
                  onClick={() => setActiveTab('assignments')}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Manage All
                </button>
              </div>

              <div className="space-y-3">
                {classAssignments.map((asg) => (
                  <div
                    key={asg.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {asg.topic_tag}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {asg.priority_level} Priority
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {asg.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Due: {asg.due_date} • Estimated Effort: {asg.estimated_hours} Hours
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                        {asg.sub_tasks?.length || 4} AI Milestones
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Knowledge Base Quick Upload Box */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Course Syllabi
                </h2>
                <button
                  onClick={() => setUploadSyllabusOpen(true)}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Upload Unit
                </button>
              </div>

              <div className="space-y-3">
                {classSyllabi.map((syl) => (
                  <div
                    key={syl.id}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {syl.topic_name}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                        {syl.unit_number}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {syl.content_text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* CROSS-SUBJECT CALENDAR TAB: Visual Matrix & Collision Visualizer */}
      {activeTab === 'cross-calendar' && (
        <div className="space-y-6 animate-in fade-in">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Cross-Subject Deadline Collision Matrix
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Visualizing all scheduled assignments and exams across Biology, Math, History, and CS to prevent deadline clustering.
              </p>
            </div>

            <button
              onClick={() => setCreateAssignmentOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/25 flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Schedule New Assignment</span>
            </button>
          </div>

          {/* 14-Day Calendar Matrix Grid */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                14-Day Cross-Subject Schedule Density
              </span>
              <div className="flex items-center gap-3 text-[11px] font-semibold">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Optimal Window
                </span>
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Moderate (1-2 Tasks)
                </span>
                <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                  <span className="w-2 h-2 rounded-full bg-red-500" /> Critical Collision (3+ Tasks / Exam)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {matrixDays.map((day, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border flex flex-col justify-between min-h-[140px] transition-all ${
                    day.isHeavyCollision
                      ? 'bg-red-50/70 dark:bg-red-950/40 border-red-300 dark:border-red-800 ring-2 ring-red-500/20'
                      : day.isCollision
                      ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60'
                  }`}
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-[10px] font-extrabold uppercase text-slate-500">
                      {day.dayName}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                      {day.displayDate}
                    </span>
                  </div>

                  {/* Tasks on this day */}
                  <div className="space-y-1.5 my-2 flex-1">
                    {day.exams.map(e => (
                      <div
                        key={e.id}
                        className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-200 truncate"
                        title={e.title}
                      >
                        🚨 EXAM: {e.title}
                      </div>
                    ))}

                    {day.assignments.map(a => (
                      <div
                        key={a.id}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold truncate ${
                          a.class_id === activeClass?.id
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : 'bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                        title={`${a.subject_name}: ${a.title}`}
                      >
                        {a.subject_name}: {a.title}
                      </div>
                    ))}

                    {day.assignments.length === 0 && day.exams.length === 0 && (
                      <span className="text-[10px] text-slate-400 italic block text-center pt-3">
                        Free Slot
                      </span>
                    )}
                  </div>

                  <div className="text-[9px] font-bold text-right pt-1">
                    {day.isHeavyCollision ? (
                      <span className="text-red-600 dark:text-red-400">High Collision</span>
                    ) : day.isCollision ? (
                      <span className="text-amber-600 dark:text-amber-400">Workload Warning</span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400">Recommended</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Unified Cross-Subject Schedule Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignments.map((asg) => {
              const isSameClass = asg.class_id === activeClass?.id;
              const isOtherSubject = asg.subject_name !== activeClass?.subject;

              return (
                <div
                  key={asg.id}
                  className={`p-4 rounded-3xl border shadow-sm space-y-3 ${
                    isSameClass && !isOtherSubject
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {asg.subject_name}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                      Due: {asg.due_date}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {asg.title}
                  </h3>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span>{asg.estimated_hours}h estimated</span>
                    <span className="capitalize font-semibold text-emerald-600 dark:text-emerald-400">
                      {asg.class_name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ASSIGNMENTS TAB */}
      {activeTab === 'assignments' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Course Assignments & AI Milestone Manager
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Created with automated task subdivision and collision safety checks.
              </p>
            </div>

            <button
              onClick={() => setCreateAssignmentOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/25 flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create New Assignment</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classAssignments.map((asg) => (
              <div
                key={asg.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {asg.topic_tag}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {asg.priority_level} Priority
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {asg.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {asg.description}
                </p>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Automated Subdivided Milestones:
                  </span>
                  {asg.sub_tasks?.map((st) => (
                    <div key={st.id} className="text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
                      <span>• Step {st.step_number}: {st.title}</span>
                      <span className="text-[10px] font-mono text-slate-400">Target: {st.due_date}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KNOWLEDGE BASE TAB */}
      {activeTab === 'knowledge' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Course Syllabi & Lecture Notes Management
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Upload outlines, learning objectives, and teacher snippets for student Socratic context.
              </p>
            </div>

            <button
              onClick={() => setUploadSyllabusOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/25 flex items-center gap-1.5"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload New Syllabus Unit</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classSyllabi.map((syl) => (
              <div
                key={syl.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {syl.topic_name}
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    {syl.unit_number}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {syl.content_text}
                </p>
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 italic">
                  "{syl.teacher_notes_snippets}"
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  📖 {syl.textbook_reference}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PROJECT OVERSIGHT TAB */}
      {activeTab === 'projects' && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Student Project Teams & Milestone Oversight
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Monitor student group project activity, milestones, and peer collaboration in real-time.
            </p>
          </div>

          {classProjects.map((group) => {
            const completedCount = group.tasks.filter(t => t.status === 'done').length;
            const progress = group.tasks.length > 0 ? Math.round((completedCount / group.tasks.length) * 100) : 0;

            return (
              <div
                key={group.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {group.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {group.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {progress}% Complete ({completedCount}/{group.tasks.length} Tasks)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {group.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1"
                    >
                      <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                        task.status === 'done'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
                      }`}>
                        {task.status}
                      </span>
                      <p className="font-bold text-slate-900 dark:text-white mt-1">
                        {task.title}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        Assigned: {task.assigned_to_name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Assignment Modal */}
      <CreateAssignmentModal
        isOpen={isCreateAssignmentOpen}
        onClose={() => setCreateAssignmentOpen(false)}
      />

      {/* Upload Syllabus Modal */}
      {isUploadSyllabusOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Upload Course Syllabus & Notes
            </h3>

            <form onSubmit={handleUploadSyllabus} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                    Topic Name
                  </label>
                  <input
                    type="text"
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                    placeholder="e.g. Enzyme Kinetics"
                    required
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                    Unit Number
                  </label>
                  <input
                    type="text"
                    value={newUnitNum}
                    onChange={(e) => setNewUnitNum(e.target.value)}
                    placeholder="e.g. Unit 3.1"
                    required
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                  Key Concepts (comma separated)
                </label>
                <input
                  type="text"
                  value={newConcepts}
                  onChange={(e) => setNewConcepts(e.target.value)}
                  placeholder="Active Site, Activation Energy, Km/Vmax"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                  Textbook Chapter Ref
                </label>
                <input
                  type="text"
                  value={newTextbookRef}
                  onChange={(e) => setNewTextbookRef(e.target.value)}
                  placeholder="e.g. Campbell Biology Ch 6, p.118-135"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                  Teacher High-Yield Snippet
                </label>
                <input
                  type="text"
                  value={newTeacherNotes}
                  onChange={(e) => setNewTeacherNotes(e.target.value)}
                  placeholder="e.g. Remember to emphasize competitive inhibition shifts!"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                  Module Synopsis
                </label>
                <textarea
                  rows={3}
                  value={newContentText}
                  onChange={(e) => setNewContentText(e.target.value)}
                  placeholder="Detailed breakdown of the unit learning objectives..."
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUploadSyllabusOpen(false)}
                  className="px-3 py-2 text-xs font-bold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Upload to Knowledge Base
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STUDENT TIMETABLE INSPECTOR TAB */}
      {activeTab === 'student-timetable' && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Student Timetable Inspector</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">View any student's personalized schedule and deadline load.</p>
          </div>
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <select
              value={studentTimetableFilter.classId}
              onChange={e => setStudentTimetableFilter(prev => ({ ...prev, classId: e.target.value }))}
              className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              <option value="all">All Classes</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select
              value={studentTimetableFilter.studentId}
              onChange={e => setStudentTimetableFilter(prev => ({ ...prev, studentId: e.target.value }))}
              className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              <option value="all">All Students</option>
              {users.filter(u => u.role === 'student').map(u => (
                <option key={u.id} value={u.id}>{u.full_name}</option>
              ))}
            </select>
          </div>
          {/* Student cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.filter(u => {
              if (u.role !== 'student') return false;
              if (studentTimetableFilter.classId !== 'all' && u.class_id !== studentTimetableFilter.classId) return false;
              if (studentTimetableFilter.studentId !== 'all' && u.id !== studentTimetableFilter.studentId) return false;
              return true;
            }).map(student => {
              const studentAssignments = assignments.filter(a => a.class_id === student.class_id);
              const overdueCount = studentAssignments.filter(a => a.due_date < new Date().toISOString().split('T')[0] && a.status !== 'completed').length;
              const completedCount = studentAssignments.filter(a => a.status === 'completed').length;
              return (
                <div key={student.id} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl overflow-hidden bg-sky-100 dark:bg-sky-950 shrink-0">
                      {student.avatar_url ? (
                        <img src={student.avatar_url} alt={student.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sky-500"><User className="w-5 h-5" /></div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{student.full_name}</p>
                      <p className="text-xs text-sky-600 dark:text-sky-400">{student.unique_id} • {student.class_id}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
                      <p className="text-lg font-black text-slate-900 dark:text-white">{studentAssignments.length}</p>
                      <p className="text-[10px] text-slate-500">Total</p>
                    </div>
                    <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
                      <p className="text-lg font-black text-emerald-600">{completedCount}</p>
                      <p className="text-[10px] text-slate-500">Done</p>
                    </div>
                    <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/30">
                      <p className="text-lg font-black text-red-500">{overdueCount}</p>
                      <p className="text-[10px] text-slate-500">Overdue</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {studentAssignments.slice(0,3).map(a => (
                      <div key={a.id} className="flex items-center justify-between text-xs">
                        <span className="truncate text-slate-700 dark:text-slate-300">{a.title}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${ a.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : a.due_date < new Date().toISOString().split('T')[0] ? 'bg-red-100 text-red-700' : 'bg-sky-100 text-sky-700' }`}>{a.status === 'completed' ? 'Done' : a.due_date < new Date().toISOString().split('T')[0] ? 'Overdue' : a.due_date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STUDENT ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Student Analytics</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Academic workload estimates and exam performance. All data labeled as academic estimates only.</p>
            </div>
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
              {(['workload', 'exams'] as const).map(t => (
                <button key={t} onClick={() => setAnalyticsSubTab(t)} className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${ analyticsSubTab === t ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400' }`}>{t}</button>
              ))}
            </div>
          </div>

          {analyticsSubTab === 'workload' && (
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Academic workload estimate only — not a medical or psychological assessment.</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.filter(u => u.role === 'student').map(student => {
                  const studentAssignments = assignments.filter(a => a.class_id === student.class_id);
                  const pendingLoad = studentAssignments.filter(a => a.status !== 'completed').reduce((sum, a) => sum + a.estimated_hours, 0);
                  const workloadPct = Math.min(100, Math.round((pendingLoad / 40) * 100));
                  return (
                    <div key={student.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{student.full_name}</p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ workloadPct > 70 ? 'bg-red-100 text-red-700' : workloadPct > 40 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700' }`}>{workloadPct > 70 ? 'High' : workloadPct > 40 ? 'Medium' : 'Low'}</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>Academic Load Estimate</span>
                          <span className="font-mono font-bold">{workloadPct}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full">
                          <div className={`h-full rounded-full transition-all ${ workloadPct > 70 ? 'bg-red-500' : workloadPct > 40 ? 'bg-amber-500' : 'bg-sky-500' }`} style={{ width: `${workloadPct}%` }} />
                        </div>
                        <p className="text-[10px] text-slate-400">{pendingLoad}h pending work • {studentAssignments.filter(a => a.status === 'completed').length}/{studentAssignments.length} assignments done</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {analyticsSubTab === 'exams' && (
            <div className="space-y-4">
              {/* Exam records table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800">
                    <tr>
                      {['Student','Subject','Exam','Score','Grade','Date'].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-bold text-slate-700 dark:text-slate-300">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {studentExamRecords.map(rec => (
                      <tr key={rec.id} className="bg-white dark:bg-slate-900 hover:bg-sky-50 dark:hover:bg-sky-950/20 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{rec.student_name}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{rec.subject_name}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{rec.exam_name}</td>
                        <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">{rec.score}/{rec.total_marks}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full font-bold ${ rec.grade === 'A' || rec.grade === 'A+' ? 'bg-emerald-100 text-emerald-700' : rec.grade === 'B' ? 'bg-sky-100 text-sky-700' : rec.grade === 'C' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700' }`}>{rec.grade}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{rec.exam_date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Subject-wise averages */}
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Subject-wise Average Performance</h3>
                {Array.from(new Set(studentExamRecords.map(r => r.subject_name))).map(subj => {
                  const records = studentExamRecords.filter(r => r.subject_name === subj);
                  const avg = Math.round(records.reduce((s, r) => s + (r.score / r.total_marks * 100), 0) / records.length);
                  return (
                    <div key={subj} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{subj}</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{avg}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full">
                        <div className={`h-full rounded-full ${ avg >= 80 ? 'bg-emerald-500' : avg >= 60 ? 'bg-sky-500' : avg >= 40 ? 'bg-amber-500' : 'bg-red-500' }`} style={{ width: `${avg}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* EVENT ORGANIZERS TAB - Teacher */}
      {activeTab === 'events' && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Event Organizers</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">View and manage event staff members by section.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={eventSectionFilter}
              onChange={e => setEventSectionFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
            >
              <option value="all">All Sections</option>
              {['technical','cultural','sports','marketing','media','registration','hospitality','logistics','operations','other'].map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {eventStaffMembers.filter(s => eventSectionFilter === 'all' || s.section === eventSectionFilter).map(member => (
              <div key={member.id} className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl overflow-hidden bg-sky-100 dark:bg-sky-950">
                    {member.avatar_url ? <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-sky-500"><User className="w-5 h-5" /></div>}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{member.name}</p>
                    <p className="text-xs text-sky-600 dark:text-sky-400 font-semibold">{member.role}</p>
                  </div>
                  <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-700 font-bold capitalize">{member.section}</span>
                </div>
                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                  {member.phone && <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-sky-500" />{member.phone}</div>}
                  {member.email && <div className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-sky-500" /><span className="truncate">{member.email}</span></div>}
                  {member.assigned_event_title && <div className="flex items-center gap-1.5"><CalendarRange className="w-3 h-3 text-amber-500" />{member.assigned_event_title}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
