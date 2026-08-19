'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { InstitutionalEvent } from '@/lib/types';
import {
  Briefcase,
  Users,
  Activity,
  Calendar as CalendarIcon,
  Flame,
  Search,
  Plus,
  Sparkles,
  AlertTriangle,
  Award,
  BookOpen,
  Filter,
  CheckCircle2,
  TrendingUp,
  Clock,
  Send,
  Phone,
  BarChart3,
  Layers,
  User,
  Mail,
  HeartHandshake,
  AlertCircle,
} from 'lucide-react';

interface HODViewProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const HODView: React.FC<HODViewProps> = ({ activeTab, setActiveTab }) => {
  const {
    currentUser,
    users,
    classes,
    assignments,
    events,
    departments,
    eventStaffMembers,
    studentExamRecords,
    createEvent,
    archiveEvent,
    queueWhatsAppAlert,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');
  const [analyticsFilter, setAnalyticsFilter] = useState({ dept: 'all', classId: 'all', period: 'weekly' as 'weekly' | 'monthly' });
  const [perfSubTab, setPerfSubTab] = useState<'student' | 'teacher'>('student');
  const [eventSectionFilter, setEventSectionFilter] = useState('all');

  // Event creation form state
  const [isCreateEventOpen, setCreateEventOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState<InstitutionalEvent['event_type']>('department_event');
  const [eventStart, setEventStart] = useState(() => new Date().toISOString().split('T')[0]);
  const [eventEnd, setEventEnd] = useState(() => new Date().toISOString().split('T')[0]);
  const [eventTime, setEventTime] = useState('10:00 AM');
  const [eventLocation, setEventLocation] = useState('Main Auditorium');
  const [eventTargetRole, setEventTargetRole] = useState<InstitutionalEvent['target_role']>('department');
  const [assignedTeacher, setAssignedTeacher] = useState('Prof. Elena Rostova');
  const [eventDesc, setEventDesc] = useState('');

  // Department users
  const deptUsers = users.filter(u => u.department_id === currentUser?.department_id || !u.department_id);
  const deptStudents = deptUsers.filter(u => u.role === 'student');
  const deptTeachers = deptUsers.filter(u => u.role === 'teacher');

  const filteredStudents = deptStudents.filter(s => {
    const matchSearch =
      s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.unique_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.skills || []).some(sk => sk.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchClass = selectedClassFilter === 'all' || s.class_id === selectedClassFilter;
    return matchSearch && matchClass;
  });

  const handleCreateOfficialEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    createEvent({
      title: eventTitle.trim(),
      event_type: eventType,
      start_date: eventStart,
      end_date: eventEnd,
      start_time: eventTime,
      end_time: '04:00 PM',
      location: eventLocation,
      department_id: currentUser?.department_id || 'dept-1',
      department_name: currentUser?.department_name || 'Computer Science & Engineering',
      target_role: eventTargetRole,
      assigned_teachers: [assignedTeacher],
      created_by: currentUser?.id || 'usr-hod-1',
      created_by_name: `${currentUser?.full_name || 'Dr. Marcus Vance'} (HOD)`,
      description: eventDesc.trim(),
      priority: eventType === 'exam' ? 'critical' : 'high',
    });

    setEventTitle('');
    setEventDesc('');
    setCreateEventOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 font-bold">
              <Briefcase className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              HOD Leadership Suite • {currentUser?.department_name || 'Computer Science & Engineering'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {currentUser?.full_name || 'Dr. Marcus Vance (HOD)'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Department-wide academic workload indicators, cross-subject stress balancing, and institutional event planning.
          </p>
        </div>

        <button
          onClick={() => setCreateEventOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all flex items-center gap-1.5 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Plan Department Event</span>
        </button>
      </div>

      {/* OVERVIEW / WORKLOAD HEATMAP TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Department Analytics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Department Workload Index
              </span>
              <p className="text-2xl font-black text-amber-500 font-mono">
                54% Moderate
              </p>
              <p className="text-[11px] text-slate-400">
                Balanced across 4 classes
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Faculty Members
              </span>
              <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {deptTeachers.length || 8}
              </p>
              <p className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold">
                100% active assignments
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Active Students
              </span>
              <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {deptStudents.length || 42}
              </p>
              <p className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold">
                Across BCA & BSc CS
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Upcoming Exams
              </span>
              <p className="text-2xl font-black text-red-500 font-mono">
                {events.filter(e => e.event_type === 'exam').length}
              </p>
              <p className="text-[11px] text-slate-400">
                Automated reading days mapped
              </p>
            </div>
          </div>

          {/* Section-wise Academic Workload Indicator Heatmap */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Class Section Academic Workload Indicators
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Department-wide cognitive load monitoring to detect exam bottleneck collisions before they occur.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {classes.map((cls, idx) => {
                const classLoad = [48, 62, 35][idx % 3];
                const status = classLoad >= 60 ? 'Elevated' : 'Moderate';

                return (
                  <div
                    key={cls.id}
                    className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 ${
                      classLoad >= 60
                        ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800/80'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {cls.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 font-bold">
                          {cls.section}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Teacher: {cls.teacher_name || 'Prof. Elena Rostova'}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-bold font-mono">
                        <span className="text-slate-500">Workload Level</span>
                        <span className={classLoad >= 60 ? 'text-amber-600 dark:text-amber-400' : 'text-sky-600 dark:text-sky-400'}>
                          {classLoad}% ({status})
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${classLoad >= 60 ? 'bg-amber-500' : 'bg-sky-500'}`}
                          style={{ width: `${classLoad}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* OFFICIAL EVENTS & PLANNER TAB */}
      {activeTab === 'events' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Official Department Events & Examination Planner
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Schedule midterms, tech symposiums, and reading buffer days with automatic WhatsApp broadcasts.
              </p>
            </div>

            <button
              onClick={() => setCreateEventOpen(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Schedule Official Event
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      evt.event_type === 'exam'
                        ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400'
                        : evt.event_type === 'holiday'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                        : 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400'
                    }`}
                  >
                    {evt.event_type}
                  </span>

                  <span className="text-xs font-mono text-slate-400">
                    {evt.start_date}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {evt.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {evt.description}
                  </p>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <p>📍 Location: <strong className="text-slate-800 dark:text-slate-200">{evt.location || 'Campus'}</strong></p>
                  {evt.assigned_teachers && evt.assigned_teachers.length > 0 && (
                    <p>👨‍🏫 Assigned Lead: <strong className="text-slate-800 dark:text-slate-200">{evt.assigned_teachers.join(', ')}</strong></p>
                  )}
                  {evt.assigned_volunteers && evt.assigned_volunteers.length > 0 && (
                    <p>🙋 Volunteers: <strong className="text-slate-800 dark:text-slate-200">{evt.assigned_volunteers.join(', ')}</strong></p>
                  )}
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => archiveEvent(evt.id)}
                    className="text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    Archive Event
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VOLUNTEER SOURCING TAB */}
      {activeTab === 'volunteers' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Student Volunteers & Skills Directory
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Filter students by bio skill badges (Lab Assisting, Public Speaking, Python) to staff official symposiums.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search skills or names..."
                  className="pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.map((stu) => (
              <div
                key={stu.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={stu.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={stu.full_name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-500/30"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {stu.full_name}
                    </h3>
                    <p className="text-[11px] font-mono text-purple-600 dark:text-purple-400 font-bold">
                      {stu.unique_id}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                  {stu.bio || 'Active undergraduate participant in departmental hackathons.'}
                </p>

                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Skill Badges:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(stu.skills || ['Python', 'SQL', 'Lab Assisting']).map((sk, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-mono text-slate-500">{stu.phone || '+1 (555) 890-1234'}</span>
                  <button
                    onClick={() => alert(`Assigned ${stu.full_name} as volunteer for HackWave 2026!`)}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-[11px] shadow-sm"
                  >
                    Assign to Event
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Official Event Modal */}
      {isCreateEventOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Schedule Department Event & WhatsApp Broadcast
            </h3>

            <form onSubmit={handleCreateOfficialEvent} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g. Department Technical Fest: HackWave 2026"
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Event Type
                  </label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="department_event">Department Event</option>
                    <option value="exam">Mid-Term / Final Exam</option>
                    <option value="special_class">Special Review Class</option>
                    <option value="meeting">Faculty Senate Meeting</option>
                    <option value="holiday">Wellness & Reading Buffer Day</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Broadcast Audience
                  </label>
                  <select
                    value={eventTargetRole}
                    onChange={(e) => setEventTargetRole(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="department">Entire Department (Teachers + Students)</option>
                    <option value="students">Students Only</option>
                    <option value="teachers">Teachers Only</option>
                    <option value="volunteers">Organizers & Volunteers</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={eventStart}
                    onChange={(e) => setEventStart(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Venue / Location
                  </label>
                  <input
                    type="text"
                    value={eventLocation}
                    onChange={(e) => setEventLocation(e.target.value)}
                    placeholder="e.g. Main Auditorium Hall B"
                    required
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Event Description & Guidelines
                </label>
                <textarea
                  rows={3}
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  placeholder="Official instructions and participation guidelines..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateEventOpen(false)}
                  className="px-3 py-2 text-xs font-bold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Publish & Broadcast via WhatsApp</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Workload Analytics</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Academic workload estimates across the department. Not a medical assessment.</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={analyticsFilter.period}
                onChange={e => setAnalyticsFilter(prev => ({ ...prev, period: e.target.value as 'weekly' | 'monthly' }))}
                className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                {(['student', 'teacher'] as const).map(t => (
                  <button key={t} onClick={() => setPerfSubTab(t)} className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${ perfSubTab === t ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400' }`}>{t}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>All workload estimates are academic-only metrics. No medical or psychological inference should be made.</span>
          </div>

          {perfSubTab === 'student' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Student Academic Workload Distribution</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.filter(u => u.role === 'student').map(student => {
                  const studentAssignments = assignments.filter(a => a.class_id === student.class_id);
                  const pendingHours = studentAssignments.filter(a => a.status !== 'completed').reduce((s, a) => s + a.estimated_hours, 0);
                  const weeklyCapacity = analyticsFilter.period === 'weekly' ? 40 : 160;
                  const loadPct = Math.min(100, Math.round((pendingHours / weeklyCapacity) * 100));
                  const overdueCount = studentAssignments.filter(a => a.due_date < new Date().toISOString().split('T')[0] && a.status !== 'completed').length;
                  return (
                    <div key={student.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{student.full_name}</p>
                          <p className="text-xs text-slate-500">{student.unique_id}</p>
                        </div>
                        {overdueCount > 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600">{overdueCount} Overdue</span>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Load estimate ({analyticsFilter.period})</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-white">{loadPct}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full">
                          <div
                            className={`h-full rounded-full transition-all ${ loadPct > 70 ? 'bg-red-500' : loadPct > 40 ? 'bg-amber-500' : 'bg-sky-500' }`}
                            style={{ width: `${loadPct}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-slate-400">{pendingHours}h pending • {studentAssignments.filter(a => a.status === 'completed').length}/{studentAssignments.length} complete</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Department summary */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'High Load Students', color: 'bg-red-500', count: users.filter(u => u.role === 'student').filter(s => { const hrs = assignments.filter(a => a.class_id === s.class_id && a.status !== 'completed').reduce((sum,a) => sum+a.estimated_hours,0); return hrs > 28; }).length },
                  { label: 'Medium Load', color: 'bg-amber-500', count: users.filter(u => u.role === 'student').filter(s => { const hrs = assignments.filter(a => a.class_id === s.class_id && a.status !== 'completed').reduce((sum,a) => sum+a.estimated_hours,0); return hrs >= 15 && hrs <= 28; }).length },
                  { label: 'Manageable Load', color: 'bg-sky-500', count: users.filter(u => u.role === 'student').filter(s => { const hrs = assignments.filter(a => a.class_id === s.class_id && a.status !== 'completed').reduce((sum,a) => sum+a.estimated_hours,0); return hrs < 15; }).length },
                ].map(item => (
                  <div key={item.label} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                    <div className={`w-3 h-3 rounded-full ${item.color} mx-auto mb-2`} />
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{item.count}</p>
                    <p className="text-xs text-slate-500">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {perfSubTab === 'teacher' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Teacher Assignment Load</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {users.filter(u => u.role === 'teacher').map(teacher => {
                  const teacherAssignments = assignments.filter(a => a.teacher_id === teacher.id || a.teacher_name === teacher.full_name);
                  return (
                    <div key={teacher.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl overflow-hidden bg-sky-100 shrink-0">
                          {teacher.avatar_url ? <img src={teacher.avatar_url} alt={teacher.full_name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-sky-500"><User className="w-4 h-4" /></div>}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{teacher.full_name}</p>
                          <p className="text-xs text-sky-600">{teacher.department_name || 'Academic Dept'}</p>
                        </div>
                        <span className="ml-auto text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">{teacherAssignments.length} Assignments</span>
                      </div>
                      <div className="space-y-1">
                        {teacherAssignments.slice(0,4).map(a => (
                          <div key={a.id} className="text-xs flex items-center justify-between">
                            <span className="truncate text-slate-600 dark:text-slate-400">{a.title}</span>
                            <span className="text-[10px] text-slate-400 ml-2">{a.class_name}</span>
                          </div>
                        ))}
                        {teacherAssignments.length > 4 && <p className="text-[10px] text-slate-400">+{teacherAssignments.length - 4} more...</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* PERFORMANCE ANALYTICS TAB */}
      {activeTab === 'performance' && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Student Performance Analytics</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Exam scores and academic performance trends across the department.</p>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Exam Records', value: studentExamRecords.length, color: 'text-sky-500' },
              { label: 'Avg Score', value: studentExamRecords.length > 0 ? Math.round(studentExamRecords.reduce((s, r) => s + (r.score/r.total_marks*100), 0)/studentExamRecords.length) + '%' : 'N/A', color: 'text-emerald-500' },
              { label: 'Students Tracked', value: new Set(studentExamRecords.map(r => r.student_id)).size, color: 'text-amber-500' },
              { label: 'Subjects Covered', value: new Set(studentExamRecords.map(r => r.subject_name)).size, color: 'text-blue-500' },
            ].map(card => (
              <div key={card.label} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                <p className={`text-2xl font-black ${card.color}`}>{card.value}</p>
                <p className="text-xs text-slate-500 mt-1">{card.label}</p>
              </div>
            ))}
          </div>

          {/* Per-student breakdown */}
          {Array.from(new Set(studentExamRecords.map(r => r.student_id))).map(studentId => {
            const records = studentExamRecords.filter(r => r.student_id === studentId);
            const studentName = records[0]?.student_name || 'Unknown';
            const avgScore = Math.round(records.reduce((s, r) => s + (r.score/r.total_marks*100), 0)/records.length);
            return (
              <div key={studentId} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{studentName}</h3>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ avgScore >= 80 ? 'bg-emerald-100 text-emerald-700' : avgScore >= 60 ? 'bg-sky-100 text-sky-700' : avgScore >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700' }`}>Avg {avgScore}%</span>
                </div>
                <div className="space-y-2">
                  {records.map(rec => (
                    <div key={rec.id} className="flex items-center gap-3 text-xs">
                      <span className="w-32 text-slate-500 truncate">{rec.subject_name}</span>
                      <span className="w-28 text-slate-600 dark:text-slate-400 truncate">{rec.exam_name}</span>
                      <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-2 rounded-full">
                        <div
                          className={`h-full rounded-full ${ (rec.score/rec.total_marks*100) >= 80 ? 'bg-emerald-500' : (rec.score/rec.total_marks*100) >= 60 ? 'bg-sky-500' : (rec.score/rec.total_marks*100) >= 40 ? 'bg-amber-500' : 'bg-red-500' }`}
                          style={{ width: `${Math.round(rec.score/rec.total_marks*100)}%` }}
                        />
                      </div>
                      <span className="w-16 font-mono font-bold text-slate-900 dark:text-white">{rec.score}/{rec.total_marks}</span>
                      <span className={`w-8 font-bold px-1.5 py-0.5 rounded text-center ${ rec.grade === 'A' || rec.grade === 'A+' ? 'bg-emerald-100 text-emerald-700' : rec.grade === 'B' ? 'bg-sky-100 text-sky-700' : rec.grade === 'C' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700' }`}>{rec.grade}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EVENT ORGANIZERS TAB - HOD */}
      {activeTab === 'volunteers' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Event Organizers</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Full event volunteer registry with contact info and section assignments.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={eventSectionFilter}
              onChange={e => setEventSectionFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            >
              <option value="all">All Sections</option>
              {['technical','cultural','sports','marketing','media','registration','hospitality','logistics','operations','other'].map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
          {/* Summary by section */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {['technical','cultural','sports','marketing','media'].map(section => {
              const count = eventStaffMembers.filter(s => s.section === section).length;
              return (
                <div key={section} onClick={() => setEventSectionFilter(section)} className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center cursor-pointer hover:border-sky-400 transition-all">
                  <p className="text-xl font-black text-sky-500">{count}</p>
                  <p className="text-[10px] font-bold text-slate-500 capitalize">{section}</p>
                </div>
              );
            })}
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
                  <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-700 font-bold capitalize shrink-0">{member.section}</span>
                </div>
                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                  {member.department && <div className="font-semibold text-slate-700 dark:text-slate-300">{member.department} • {member.year_semester}</div>}
                  {member.phone && <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-sky-500" />{member.phone}</div>}
                  {member.email && <div className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-sky-500" /><span className="truncate">{member.email}</span></div>}
                  {member.assigned_event_title && <div className="flex items-center gap-1.5"><CalendarIcon className="w-3 h-3 text-amber-500" />{member.assigned_event_title}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
