'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { User, Department, AcademicClass, Subject, UserRole } from '@/lib/types';
import {
  ShieldCheck,
  Users,
  GraduationCap,
  Briefcase,
  Layers,
  Building,
  Plus,
  Trash2,
  Edit2,
  KeyRound,
  FileText,
  Search,
  Sparkles,
  Phone,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Calendar as CalendarIcon,
  RefreshCw,
  Eye,
  Sliders,
  Settings,
} from 'lucide-react';

interface AdminViewProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ activeTab, setActiveTab }) => {
  const {
    currentUser,
    users,
    departments,
    classes,
    subjects,
    events,
    auditLogs,
    whatsAppQueue,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    createUser,
    updateUser,
    deleteUser,
    resetUserPassword,
    createClass,
    createSubject,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');

  // Department Modal State
  const [isDeptModalOpen, setDeptModalOpen] = useState(false);
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptDesc, setDeptDesc] = useState('');

  // User Creation Modal State
  const [isUserModalOpen, setUserModalOpen] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('student');
  const [userFullName, setUserFullName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userDeptId, setUserDeptId] = useState(departments[0]?.id || '');
  const [userClassId, setUserClassId] = useState(classes[0]?.id || '');
  const [userSection, setUserSection] = useState('A');
  const [createdCredentialInfo, setCreatedCredentialInfo] = useState<{ id: string; pass: string } | null>(null);

  // Subject Modal State
  const [isSubjModalOpen, setSubjModalOpen] = useState(false);
  const [subjName, setSubjName] = useState('');
  const [subjCode, setSubjCode] = useState('');
  const [subjSem, setSubjSem] = useState('Semester 3');

  // Class Modal State
  const [isClassModalOpen, setClassModalOpen] = useState(false);
  const [className, setClassName] = useState('');
  const [classSection, setClassSection] = useState('A');
  const [classRoom, setClassRoom] = useState('Hall B-101');

  const studentsList = users.filter(u => u.role === 'student');
  const teachersList = users.filter(u => u.role === 'teacher');
  const hodsList = users.filter(u => u.role === 'hod');

  const handleCreateDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptName.trim() || !deptCode.trim()) return;
    createDepartment({
      name: deptName.trim(),
      code: deptCode.trim().toUpperCase(),
      description: deptDesc.trim(),
      faculty_count: 0,
      class_count: 0,
    });
    setDeptName('');
    setDeptCode('');
    setDeptDesc('');
    setDeptModalOpen(false);
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFullName.trim() || !userEmail.trim()) return;

    const selectedDept = departments.find(d => d.id === userDeptId);
    const selectedCls = classes.find(c => c.id === userClassId);

    const newUser = createUser({
      full_name: userFullName.trim(),
      email: userEmail.trim(),
      role: userRole,
      phone: userPhone.trim() || '+1 (555) 000-0000',
      department_id: userDeptId,
      department_name: selectedDept?.name,
      class_id: userClassId,
      class_name: selectedCls?.name,
      section: userSection,
      must_change_password: true,
      profile_completed: false,
    });

    setCreatedCredentialInfo({
      id: newUser.unique_id,
      pass: 'password123',
    });

    setUserFullName('');
    setUserEmail('');
    setUserPhone('');
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjName.trim() || !subjCode.trim()) return;
    const selectedDept = departments.find(d => d.id === userDeptId) || departments[0];

    createSubject({
      name: subjName.trim(),
      code: subjCode.trim().toUpperCase(),
      department_id: selectedDept?.id || 'dept-1',
      department_name: selectedDept?.name || 'Academic Dept',
      semester_year: subjSem,
      credits: 4,
    });

    setSubjName('');
    setSubjCode('');
    setSubjModalOpen(false);
  };

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return;
    const selectedDept = departments.find(d => d.id === userDeptId) || departments[0];

    createClass({
      name: className.trim(),
      code: `${className.substring(0, 3).toUpperCase()}-101`,
      section: classSection,
      department_id: selectedDept?.id || 'dept-1',
      department_name: selectedDept?.name || 'Academic Dept',
      term: 'Fall 2026',
      room_number: classRoom,
      student_count: 0,
    });

    setClassName('');
    setClassModalOpen(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
              Status: ADMIN • Platform Master Console
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {currentUser?.full_name || 'Administrator'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Institutional governance, department provisioning, role identity issuance, and audit trail oversight.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setUserModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-sky-500/25 transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Account ID</span>
          </button>

          <button
            onClick={() => setDeptModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold text-xs transition-colors"
          >
            + Department
          </button>
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Departments Managed
              </span>
              <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {departments.length}
              </p>
              <p className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold">
                With assigned HOD heads
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Active Faculty & Teachers
              </span>
              <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {teachersList.length}
              </p>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                Class & Section Mapped
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Enrolled Students
              </span>
              <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {studentsList.length}
              </p>
              <p className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold">
                15-MCQ Profile Ready
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                WhatsApp Queue Alerts
              </span>
              <p className="text-2xl font-black text-sky-600 dark:text-sky-400 font-mono">
                {whatsAppQueue.length}
              </p>
              <p className="text-[11px] text-slate-400 font-semibold">
                Meta Cloud API Dispatch
              </p>
            </div>
          </div>

          {/* Department List & Recent Accounts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Academic Departments
                </h2>
                <button
                  onClick={() => setDeptModalOpen(true)}
                  className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline"
                >
                  + Add Department
                </button>
              </div>

              <div className="space-y-3">
                {departments.map((dept) => (
                  <div
                    key={dept.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-400">
                          {dept.code}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          HOD: {dept.hod_name || 'Dr. Marcus Vance'}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {dept.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {dept.description}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                        {dept.faculty_count || 8} Faculty • {dept.class_count || 4} Classes
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Audit Log Snippet */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Live Audit Trail
                </h2>
                <button
                  onClick={() => setActiveTab('audit')}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  View All
                </button>
              </div>

              <div className="space-y-2.5">
                {auditLogs.slice(0, 5).map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>{log.category}</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {log.action}
                    </p>
                  </div>
                ))}
                {auditLogs.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-6">
                    System ready. Actions will log here in real-time.
                  </p>
                )}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* STUDENTS TAB */}
      {activeTab === 'students' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Student Directory & Credentials
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage registered students, issue STU-XXXX IDs, reset passwords, and assign classes.
              </p>
            </div>

            <button
              onClick={() => {
                setUserRole('student');
                setUserModalOpen(true);
              }}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Student
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studentsList.map((stu) => (
              <div
                key={stu.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={stu.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={stu.full_name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/30"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {stu.full_name}
                      </h3>
                      <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                        {stu.unique_id}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      stu.must_change_password
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    {stu.must_change_password ? 'First Login Pending' : 'Active'}
                  </span>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                  <p>Dept: <strong className="text-slate-800 dark:text-slate-200">{stu.department_name || 'CSE'}</strong></p>
                  <p>Class: <strong className="text-slate-800 dark:text-slate-200">{stu.class_name || 'BCA - A'}</strong></p>
                  <p>Phone: <strong className="text-slate-800 dark:text-slate-200 font-mono">{stu.phone || 'N/A'}</strong></p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <button
                    onClick={() => {
                      const res = resetUserPassword(stu.id);
                      alert(`Password reset for ${stu.unique_id}. Temporary pass: ${res.temporaryPassword}`);
                    }}
                    className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <KeyRound className="w-3.5 h-3.5" /> Reset Pass
                  </button>

                  <button
                    onClick={() => deleteUser(stu.id)}
                    className="text-[11px] font-bold text-red-500 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TEACHERS TAB */}
      {activeTab === 'teachers' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Faculty & Teacher Allocation
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Provision TCH-XXXX credentials and allocate teachers to subjects & class sections.
              </p>
            </div>

            <button
              onClick={() => {
                setUserRole('teacher');
                setUserModalOpen(true);
              }}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Teacher
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachersList.map((tch) => (
              <div
                key={tch.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={tch.avatar_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'}
                      alt={tch.full_name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/30"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {tch.full_name}
                      </h3>
                      <p className="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-bold">
                        {tch.unique_id}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                  <p>Dept: <strong className="text-slate-800 dark:text-slate-200">{tch.department_name}</strong></p>
                  <p>Class: <strong className="text-slate-800 dark:text-slate-200">{tch.class_name || 'BCA - A'}</strong></p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <button
                    onClick={() => {
                      const res = resetUserPassword(tch.id);
                      alert(`Password reset for ${tch.unique_id}. Temporary pass: ${res.temporaryPassword}`);
                    }}
                    className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <KeyRound className="w-3.5 h-3.5" /> Reset Pass
                  </button>

                  <button
                    onClick={() => deleteUser(tch.id)}
                    className="text-[11px] font-bold text-red-500 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HODS TAB */}
      {activeTab === 'hods' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Department Heads (HODs) Management
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Designate HODs to lead academic faculties and coordinate events.
              </p>
            </div>

            <button
              onClick={() => {
                setUserRole('hod');
                setUserModalOpen(true);
              }}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Appoint HOD
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hodsList.map((hod) => (
              <div
                key={hod.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={hod.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                      alt={hod.full_name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-500/30"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {hod.full_name}
                      </h3>
                      <p className="text-[11px] font-mono text-purple-600 dark:text-purple-400 font-bold">
                        {hod.unique_id}
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                    HOD Head
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {hod.bio}
                </p>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Department: {hod.department_name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DEPARTMENTS TAB */}
      {activeTab === 'departments' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Academic Departments
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Structure academic faculties and assign classes and faculty members.
              </p>
            </div>

            <button
              onClick={() => setDeptModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Create Department
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {dept.name}
                  </h3>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                    {dept.code}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {dept.description}
                </p>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>HOD: <strong className="text-slate-800 dark:text-slate-200">{dept.hod_name || 'Dr. Marcus Vance'}</strong></span>
                  <button
                    onClick={() => deleteDepartment(dept.id)}
                    className="text-red-500 font-bold hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBJECTS & CLASSES TAB */}
      {activeTab === 'subjects' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Course Subjects & Class Catalog
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Curriculum courses and academic term mappings.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSubjModalOpen(true)}
                className="px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                + Add Subject
              </button>
              <button
                onClick={() => setClassModalOpen(true)}
                className="px-3.5 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                + Add Class
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {subjects.map((subj) => (
              <div
                key={subj.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {subj.code}
                  </span>
                  <span className="text-[10px] text-slate-400">{subj.credits || 4} Credits</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {subj.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {subj.department_name} • {subj.semester_year}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AUDIT LOGS & NOTIFICATIONS TAB */}
      {activeTab === 'audit' && (
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              System Audit Trail & Notification Monitoring
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Immutable logging of administrative actions, account issuances, and WhatsApp broadcasts.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 dark:text-white">
                      {log.action}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {log.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    Actor: {log.user_name} ({log.user_role || 'system'})
                  </p>
                </div>

                <span className="text-[10px] font-mono text-slate-400 shrink-0">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Creation Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Generate User Account & ID Credentials
            </h3>

            {createdCredentialInfo ? (
              <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-xs space-y-3">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Account Generated Successfully!</span>
                </div>
                <div className="space-y-1 font-mono text-slate-800 dark:text-slate-200">
                  <p>Generated User ID: <strong className="text-emerald-600 dark:text-emerald-400">{createdCredentialInfo.id}</strong></p>
                  <p>Temporary Password: <strong>{createdCredentialInfo.pass}</strong></p>
                  <p className="text-[11px] text-slate-500 pt-1">
                    *The user will be forced to complete their profile and change this default password upon first login.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCreatedCredentialInfo(null);
                    setUserModalOpen(false);
                  }}
                  className="w-full py-2 bg-emerald-600 text-white rounded-xl font-bold"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateUser} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Account Role
                  </label>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="student">Student (STU-XXXX)</option>
                    <option value="teacher">Teacher (TCH-XXXX)</option>
                    <option value="hod">HOD Department Head (HOD-XXXX)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Full Legal Name
                    </label>
                    <input
                      type="text"
                      value={userFullName}
                      onChange={(e) => setUserFullName(e.target.value)}
                      placeholder="e.g. Maya Patel"
                      required
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="maya@student.eduweave.edu"
                      required
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number (WhatsApp)
                    </label>
                    <input
                      type="tel"
                      value={userPhone}
                      onChange={(e) => setUserPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Department
                    </label>
                    <select
                      value={userDeptId}
                      onChange={(e) => setUserDeptId(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setUserModalOpen(false)}
                    className="px-3 py-2 text-xs font-bold text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm"
                  >
                    Generate Credentials
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Department Modal */}
      {isDeptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Create New Department
            </h3>
            <form onSubmit={handleCreateDepartment} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Department Name
                </label>
                <input
                  type="text"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  placeholder="e.g. Electrical & Electronics Engineering"
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Code
                </label>
                <input
                  type="text"
                  value={deptCode}
                  onChange={(e) => setDeptCode(e.target.value)}
                  placeholder="e.g. EEE"
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={deptDesc}
                  onChange={(e) => setDeptDesc(e.target.value)}
                  placeholder="Academic faculty summary..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeptModalOpen(false)}
                  className="px-3 py-2 text-xs font-bold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subject Modal */}
      {isSubjModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Add Subject Course
            </h3>
            <form onSubmit={handleCreateSubject} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  value={subjName}
                  onChange={(e) => setSubjName(e.target.value)}
                  placeholder="e.g. Operating Systems"
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Subject Code
                </label>
                <input
                  type="text"
                  value={subjCode}
                  onChange={(e) => setSubjCode(e.target.value)}
                  placeholder="e.g. CS-303"
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white uppercase font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSubjModalOpen(false)}
                  className="px-3 py-2 text-xs font-bold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Add Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Class Modal */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Create Class & Section
            </h3>
            <form onSubmit={handleCreateClass} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Class Name
                </label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="e.g. BCA - Section C"
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Section
                </label>
                <input
                  type="text"
                  value={classSection}
                  onChange={(e) => setClassSection(e.target.value)}
                  placeholder="e.g. C"
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setClassModalOpen(false)}
                  className="px-3 py-2 text-xs font-bold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
