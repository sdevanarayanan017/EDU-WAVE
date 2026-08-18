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
    createEvent,
    archiveEvent,
    queueWhatsAppAlert,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');

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
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
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
                        <span className={classLoad >= 60 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}>
                          {classLoad}% ({status})
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${classLoad >= 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
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
                  className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Publish & Broadcast via WhatsApp</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
