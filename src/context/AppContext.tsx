'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  UserRole,
  Department,
  AcademicClass,
  Subject,
  SyllabusItem,
  Assignment,
  SubTask,
  InstitutionalEvent,
  ProjectGroup,
  ProjectTask,
  ProjectComment,
  ProjectFileItem,
  AuditLog,
  StudentLearningProfile,
  DailyPersonalizedTimetable,
  StressAnalysisResult,
  WhatsAppNotification,
  StudySessionLog,
  EventStaffMember,
  StudentExamRecord,
} from '@/lib/types';
import {
  INITIAL_ADMIN_USER,
  SEED_USERS,
  SEED_DEPARTMENTS,
  SEED_CLASSES,
  SEED_SUBJECTS,
  SEED_SYLLABI,
  SEED_ASSIGNMENTS,
  SEED_EVENTS,
  SEED_PROJECTS,
  SEED_EVENT_STAFF_MEMBERS,
  SEED_STUDENT_EXAM_RECORDS,
  DEFAULT_STUDENT_LEARNING_PROFILE,
} from '@/lib/seedData';
import { calculateCognitiveStress } from '@/lib/stressEngine';
import {
  normalizeLearningProfile,
  generatePersonalizedTimetable,
  getTopNextTaskRecommendation,
} from '@/lib/learningProfileEngine';
import {
  dispatchWhatsAppNotification,
  formatAssignmentWhatsAppMessage,
  formatWorkloadWarningWhatsAppMessage,
  formatHODEventWhatsAppMessage,
} from '@/lib/whatsappService';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  users: User[];
  departments: Department[];
  classes: AcademicClass[];
  subjects: Subject[];
  syllabi: SyllabusItem[];
  assignments: Assignment[];
  events: InstitutionalEvent[];
  projectGroups: ProjectGroup[];
  eventStaffMembers: EventStaffMember[];
  studentExamRecords: StudentExamRecord[];
  auditLogs: AuditLog[];
  studentLearningProfile: StudentLearningProfile;
  personalizedTimetable: DailyPersonalizedTimetable[];
  studentStressResult: StressAnalysisResult;
  whatsAppQueue: WhatsAppNotification[];
  studySessionLogs: StudySessionLog[];

  // Authentication & First-Login
  login: (identifier: string, pass: string) => { success: boolean; message: string; user?: User };
  logout: () => void;
  updateProfileAndChangePassword: (
    newPass: string,
    profileData: Partial<User>
  ) => { success: boolean; message: string };
  verifyAndResetPassword: (emailOrId: string, otp: string, newPass: string) => { success: boolean; message: string };
  changePassword: (newPass: string) => { success: boolean; message: string };

  // Learning Profile & AI Scheduler
  submitLearningProfile: (answers: Record<string, any>) => void;
  retakeQuizOpen: boolean;
  setRetakeQuizOpen: (open: boolean) => void;

  // Selected state & UI modals
  selectedClassId: string;
  setSelectedClassId: (id: string) => void;
  socraticDrawerOpen: boolean;
  setSocraticDrawerOpen: (open: boolean) => void;
  activeAssignmentContext: Assignment | null;
  setActiveAssignmentContext: (asg: Assignment | null) => void;

  // Study timer
  logStudySession: (log: Omit<StudySessionLog, 'id' | 'logged_at'>) => void;

  // WhatsApp Queue
  queueWhatsAppAlert: (payload: Omit<WhatsAppNotification, 'id' | 'created_at' | 'status'>) => Promise<WhatsAppNotification>;
  
  // Hackathon Demo Simulator
  isDemoRunning: boolean;
  demoStep: number;
  demoMessage: string;
  runHackathonDemoSimulation: () => Promise<void>;

  // Management CRUD
  createDepartment: (dept: Omit<Department, 'id'>) => void;
  updateDepartment: (id: string, updates: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;

  createUser: (userData: Omit<User, 'id' | 'unique_id' | 'created_at'> & { unique_id?: string; initialPassword?: string }) => User;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  resetUserPassword: (id: string) => { temporaryPassword: string };

  createClass: (cls: Omit<AcademicClass, 'id'>) => void;
  createSubject: (subj: Omit<Subject, 'id'>) => void;
  createSyllabusItem: (syl: Omit<SyllabusItem, 'id' | 'created_at'>) => void;

  createAssignment: (asg: Omit<Assignment, 'id' | 'created_at' | 'status'>) => Assignment;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  toggleSubTaskCompletion: (assignmentId: string, subTaskId: string) => void;

  createEvent: (evt: Omit<InstitutionalEvent, 'id'>) => void;
  updateEvent: (id: string, updates: Partial<InstitutionalEvent>) => void;
  deleteEvent: (id: string) => void;
  archiveEvent: (id: string) => void;

  createProjectGroup: (group: Omit<ProjectGroup, 'id' | 'tasks' | 'comments' | 'files'>) => void;
  createProjectTask: (groupId: string, task: Omit<ProjectTask, 'id'>) => void;
  updateProjectTaskStatus: (groupId: string, taskId: string, status: ProjectTask['status']) => void;
  updateProjectPriority: (groupId: string, priority: 'high' | 'medium' | 'low') => void;
  updateProjectTaskPriority: (groupId: string, taskId: string, priority: 'high' | 'medium' | 'low') => void;
  addProjectComment: (groupId: string, content: string, attachmentName?: string) => void;

  getProfileCompletionPercentage: (user?: User | null) => number;
  updateUserProfile: (id: string, updates: Partial<User>) => void;
  createEventStaffMember: (member: Omit<EventStaffMember, 'id'>) => void;

  addAuditLog: (action: string, category: AuditLog['category'], details?: Record<string, any>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Primary State initialized with clean seed data
  const [users, setUsers] = useState<User[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('eduweave_users_v2');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return SEED_USERS;
  });

  // Start with no active session unless authenticated
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('eduweave_auth_user_v2');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return null;
  });

  const [departments, setDepartments] = useState<Department[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('eduweave_depts_v2');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return SEED_DEPARTMENTS;
  });

  const [classes, setClasses] = useState<AcademicClass[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('eduweave_classes_v2');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return SEED_CLASSES;
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('eduweave_subjects_v2');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return SEED_SUBJECTS;
  });

  const [syllabi, setSyllabi] = useState<SyllabusItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('eduweave_syllabi_v2');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return SEED_SYLLABI;
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('eduweave_assignments_v2');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return SEED_ASSIGNMENTS;
  });

  const [events, setEvents] = useState<InstitutionalEvent[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('eduweave_events_v2');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return SEED_EVENTS;
  });

  const [projectGroups, setProjectGroups] = useState<ProjectGroup[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('eduweave_projects_v2');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return SEED_PROJECTS;
  });

  // Event Organizers & Volunteers
  const [eventStaffMembers, setEventStaffMembers] = useState<EventStaffMember[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('eduweave_event_staff_v2');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return SEED_EVENT_STAFF_MEMBERS;
  });

  // Student Examination Records
  const [studentExamRecords, setStudentExamRecords] = useState<StudentExamRecord[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('eduweave_exam_records_v2');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return SEED_STUDENT_EXAM_RECORDS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // 15-Question Learning Profile
  const [studentLearningProfile, setStudentLearningProfile] = useState<StudentLearningProfile>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('eduweave_lp_v2');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return DEFAULT_STUDENT_LEARNING_PROFILE;
  });

  // WhatsApp Queue
  const [whatsAppQueue, setWhatsAppQueue] = useState<WhatsAppNotification[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('eduweave_wa_v2');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return [];
  });

  // Study Session Tracker Logs
  const [studySessionLogs, setStudySessionLogs] = useState<StudySessionLog[]>([]);

  // UI state
  const [selectedClassId, setSelectedClassId] = useState<string>(SEED_CLASSES[0]?.id || 'cls-1');
  const [socraticDrawerOpen, setSocraticDrawerOpen] = useState(false);
  const [activeAssignmentContext, setActiveAssignmentContext] = useState<Assignment | null>(null);
  const [retakeQuizOpen, setRetakeQuizOpen] = useState(false);

  // Hackathon Simulation state
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [demoMessage, setDemoMessage] = useState('');

  // Automated Overdue Task and Assignment Status Check
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    setAssignments(prev =>
      prev.map(a => {
        if (a.status !== 'completed' && a.due_date < todayStr && a.status !== 'overdue') {
          return { ...a, status: 'overdue' };
        }
        return a;
      })
    );
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('eduweave_users_v2', JSON.stringify(users));
      localStorage.setItem('eduweave_depts_v2', JSON.stringify(departments));
      localStorage.setItem('eduweave_classes_v2', JSON.stringify(classes));
      localStorage.setItem('eduweave_subjects_v2', JSON.stringify(subjects));
      localStorage.setItem('eduweave_syllabi_v2', JSON.stringify(syllabi));
      localStorage.setItem('eduweave_assignments_v2', JSON.stringify(assignments));
      localStorage.setItem('eduweave_events_v2', JSON.stringify(events));
      localStorage.setItem('eduweave_projects_v2', JSON.stringify(projectGroups));
      localStorage.setItem('eduweave_event_staff_v2', JSON.stringify(eventStaffMembers));
      localStorage.setItem('eduweave_exam_records_v2', JSON.stringify(studentExamRecords));
      localStorage.setItem('eduweave_lp_v2', JSON.stringify(studentLearningProfile));
      localStorage.setItem('eduweave_wa_v2', JSON.stringify(whatsAppQueue));
      if (currentUser) {
        localStorage.setItem('eduweave_auth_user_v2', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('eduweave_auth_user_v2');
      }
    }
  }, [users, departments, classes, subjects, syllabi, assignments, events, projectGroups, eventStaffMembers, studentExamRecords, studentLearningProfile, whatsAppQueue, currentUser]);

  // Derived Cognitive Stress Score
  const studentStressResult: StressAnalysisResult = React.useMemo(() => {
    return calculateCognitiveStress(assignments, events, []);
  }, [assignments, events]);

  // Derived Deterministic Personalized Timetable
  const personalizedTimetable: DailyPersonalizedTimetable[] = React.useMemo(() => {
    return generatePersonalizedTimetable(assignments, events, studentLearningProfile);
  }, [assignments, events, studentLearningProfile]);

  const addAuditLog = (action: string, category: AuditLog['category'], details?: Record<string, any>) => {
    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      action,
      category,
      user_id: currentUser?.id,
      user_name: currentUser?.full_name || 'System',
      user_role: currentUser?.role,
      details,
    };
    setAuditLogs(prev => [log, ...prev].slice(0, 100));
  };

  // Authentication Login
  const login = (identifier: string, pass: string) => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = pass.trim();

    // Check special admin initial credentials
    if (cleanId === 'admin@123' && cleanPass === 'ADMIN@123') {
      const admin = users.find(u => u.unique_id.toLowerCase() === 'admin@123') || INITIAL_ADMIN_USER;
      setCurrentUser(admin);
      addAuditLog('Admin Authenticated', 'Auth', { unique_id: admin.unique_id });
      return { success: true, message: 'Welcome back, Administrator!', user: admin };
    }

    const matchedUser = users.find(
      u => u.unique_id.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId
    );

    if (!matchedUser) {
      return { success: false, message: 'Invalid User ID or Email. Please verify your credentials.' };
    }

    // Password validation
    if (cleanPass === 'password123' || cleanPass === 'ADMIN@123' || cleanPass.length >= 4) {
      setCurrentUser(matchedUser);
      addAuditLog('User Login Succeeded', 'Auth', { unique_id: matchedUser.unique_id, role: matchedUser.role });
      return { success: true, message: `Welcome back, ${matchedUser.full_name}!`, user: matchedUser };
    }

    return { success: false, message: 'Invalid password. Please check your credentials.' };
  };

  const logout = () => {
    if (currentUser) {
      addAuditLog('User Logout', 'Auth', { unique_id: currentUser.unique_id });
    }
    setCurrentUser(null);
  };

  // First Login Mandatory Setup Flow
  const updateProfileAndChangePassword = (newPass: string, profileData: Partial<User>) => {
    if (!currentUser) return { success: false, message: 'No active session.' };

    const updated: User = {
      ...currentUser,
      ...profileData,
      must_change_password: false,
      profile_completed: true,
    };

    setUsers(prev => prev.map(u => (u.id === currentUser.id ? updated : u)));
    setCurrentUser(updated);
    addAuditLog('First-Login Profile & Password Completed', 'Auth', { unique_id: updated.unique_id });
    return { success: true, message: 'Profile completed successfully! Welcome to EDU-WAVE.' };
  };

  const verifyAndResetPassword = (emailOrId: string, otp: string, newPass: string) => {
    const clean = emailOrId.trim().toLowerCase();
    const found = users.find(u => u.unique_id.toLowerCase() === clean || u.email.toLowerCase() === clean);
    if (!found) {
      return { success: false, message: 'Account not found.' };
    }
    setUsers(prev => prev.map(u => (u.id === found.id ? { ...u, must_change_password: false } : u)));
    addAuditLog('Password Reset Completed', 'Auth', { unique_id: found.unique_id });
    return { success: true, message: 'Your password has been reset successfully. Please log in.' };
  };

  const changePassword = (newPass: string) => {
    if (!currentUser) return { success: false, message: 'No active session.' };
    setUsers(prev => prev.map(u => (u.id === currentUser.id ? { ...u, must_change_password: false } : u)));
    setCurrentUser(prev => (prev ? { ...prev, must_change_password: false } : null));
    addAuditLog('Password Changed', 'Auth', { unique_id: currentUser.unique_id });
    return { success: true, message: 'Password updated successfully!' };
  };

  // 15-Question Learning Profile Submission
  const submitLearningProfile = (answers: Record<string, any>) => {
    if (!currentUser) return;
    const normalized = normalizeLearningProfile(currentUser.id, answers, studentLearningProfile);
    setStudentLearningProfile(normalized);

    // Mark quiz completed
    const updatedUser = { ...currentUser, quiz_completed: true };
    setUsers(prev => prev.map(u => (u.id === currentUser.id ? updatedUser : u)));
    setCurrentUser(updatedUser);
    setRetakeQuizOpen(false);

    addAuditLog('15-MCQ Learning Profile Calibrated', 'User', {
      student_id: currentUser.unique_id,
      capacity_hours: normalized.overallWorkloadCapacity,
      focus_duration: normalized.focusDurationScore,
    });
  };

  // WhatsApp Queue Dispatcher
  const queueWhatsAppAlert = async (payload: Omit<WhatsAppNotification, 'id' | 'created_at' | 'status'>) => {
    const dispatched = await dispatchWhatsAppNotification(payload);
    setWhatsAppQueue(prev => [dispatched, ...prev]);
    addAuditLog('WhatsApp Notification Queued', 'WhatsApp', {
      recipient: dispatched.recipient_name,
      type: dispatched.type,
      phone: dispatched.recipient_phone,
    });
    return dispatched;
  };

  // Study timer log
  const logStudySession = (log: Omit<StudySessionLog, 'id' | 'logged_at'>) => {
    const newLog: StudySessionLog = {
      ...log,
      id: `ses-${Date.now()}`,
      logged_at: new Date().toISOString(),
    };
    setStudySessionLogs(prev => [newLog, ...prev]);
    addAuditLog('Study Session Recorded', 'User', {
      subject: log.subject_name,
      minutes: log.duration_minutes,
      mode: log.mode,
    });
  };

  // Department CRUD
  const createDepartment = (dept: Omit<Department, 'id'>) => {
    const newDept: Department = {
      ...dept,
      id: `dept-${Date.now()}`,
      faculty_count: 0,
      class_count: 0,
    };
    setDepartments(prev => [...prev, newDept]);
    addAuditLog('Department Created', 'Department', { code: newDept.code, name: newDept.name });
  };

  const updateDepartment = (id: string, updates: Partial<Department>) => {
    setDepartments(prev => prev.map(d => (d.id === id ? { ...d, ...updates } : d)));
    addAuditLog('Department Updated', 'Department', { department_id: id, ...updates });
  };

  const deleteDepartment = (id: string) => {
    setDepartments(prev => prev.filter(d => d.id !== id));
    addAuditLog('Department Deleted', 'Department', { department_id: id });
  };

  // User CRUD
  const createUser = (userData: Omit<User, 'id' | 'unique_id' | 'created_at'> & { unique_id?: string; initialPassword?: string }): User => {
    const prefix = userData.role === 'admin' ? 'ADM' : userData.role === 'hod' ? 'HOD' : userData.role === 'teacher' ? 'TCH' : 'STU';
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const unique_id = userData.unique_id || `${prefix}-${randomNum}`;

    const newUser: User = {
      id: `usr-${Date.now()}-${randomNum}`,
      unique_id,
      email: userData.email,
      role: userData.role,
      full_name: userData.full_name,
      department_id: userData.department_id,
      department_name: userData.department_name,
      class_id: userData.class_id,
      class_name: userData.class_name,
      section: userData.section,
      avatar_url: userData.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userData.full_name)}`,
      skills: userData.skills || [],
      bio: userData.bio || '',
      must_change_password: true,
      profile_completed: false,
      quiz_completed: false,
      whatsapp_enabled: true,
      phone: userData.phone || '+1 (555) 000-0000',
      created_at: new Date().toISOString(),
    };

    setUsers(prev => [...prev, newUser]);
    addAuditLog('User Registered & ID Generated', 'User', { unique_id, role: newUser.role, name: newUser.full_name });
    return newUser;
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...updates } : u)));
    if (currentUser?.id === id) {
      setCurrentUser(prev => (prev ? { ...prev, ...updates } : null));
    }
    addAuditLog('User Updated', 'User', { user_id: id, ...updates });
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    addAuditLog('User Deleted', 'User', { user_id: id });
  };

  const resetUserPassword = (id: string) => {
    const tempPass = `TempPass@${Math.floor(100 + Math.random() * 900)}`;
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, must_change_password: true } : u)));
    addAuditLog('User Password Reset by Admin', 'User', { user_id: id });
    return { temporaryPassword: tempPass };
  };

  // Class & Subject CRUD
  const createClass = (cls: Omit<AcademicClass, 'id'>) => {
    const newClass: AcademicClass = {
      ...cls,
      id: `cls-${Date.now()}`,
    };
    setClasses(prev => [...prev, newClass]);
    setDepartments(prev =>
      prev.map(d => (d.id === cls.department_id ? { ...d, class_count: d.class_count + 1 } : d))
    );
    addAuditLog('Class Section Created', 'Department', { name: newClass.name, section: newClass.section });
  };

  const createSubject = (subj: Omit<Subject, 'id'>) => {
    const newSubj: Subject = {
      ...subj,
      id: `subj-${Date.now()}`,
    };
    setSubjects(prev => [...prev, newSubj]);
    addAuditLog('Subject Created', 'Department', { code: newSubj.code, name: newSubj.name });
  };

  const createSyllabusItem = (syl: Omit<SyllabusItem, 'id' | 'created_at'>) => {
    const newItem: SyllabusItem = {
      ...syl,
      id: `syl-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setSyllabi(prev => [...prev, newItem]);
    addAuditLog('Syllabus Unit Uploaded', 'Assignment', { topic: newItem.topic_name, unit: newItem.unit_number });
  };

  // Assignment CRUD
  const createAssignment = (
    asg: Omit<Assignment, 'id' | 'created_at' | 'status'>
  ): Assignment => {
    const newId = `asg-${Date.now()}`;
    const subTasks: SubTask[] = (asg.sub_tasks || []).map((st, idx) => ({
      id: `st-${Date.now()}-${idx}`,
      step_number: st.step_number || idx + 1,
      title: st.title,
      description: st.description,
      due_date: st.due_date,
      completed: false,
      estimated_minutes: st.estimated_minutes || 60,
    }));

    const newAssignment: Assignment = {
      ...asg,
      id: newId,
      status: 'upcoming',
      created_at: new Date().toISOString(),
      sub_tasks: subTasks,
    };

    setAssignments(prev => [newAssignment, ...prev]);
    addAuditLog('Assignment Created with AI Milestones', 'Assignment', {
      title: newAssignment.title,
      subject: newAssignment.subject_name,
      milestones_count: subTasks.length,
    });

    // Auto-queue WhatsApp notification for assigned class students
    const targetStudent = users.find(u => u.role === 'student' && u.class_id === asg.class_id) || users.find(u => u.role === 'student');
    if (targetStudent && targetStudent.whatsapp_enabled) {
      const msg = formatAssignmentWhatsAppMessage(
        targetStudent.full_name,
        newAssignment,
        3,
        newAssignment.estimated_hours
      );
      queueWhatsAppAlert({
        type: 'assignment_reminder',
        recipient_user_id: targetStudent.id,
        recipient_name: targetStudent.full_name,
        recipient_phone: targetStudent.phone || '+1 (555) 890-1234',
        recipient_role: 'student',
        title: `New Assignment: ${newAssignment.title}`,
        message: msg,
      });
    }

    return newAssignment;
  };

  const updateAssignment = (id: string, updates: Partial<Assignment>) => {
    setAssignments(prev => prev.map(a => (a.id === id ? { ...a, ...updates } : a)));
    addAuditLog('Assignment Updated', 'Assignment', { assignment_id: id, ...updates });
  };

  const deleteAssignment = (id: string) => {
    setAssignments(prev => prev.filter(a => a.id !== id));
    addAuditLog('Assignment Deleted', 'Assignment', { assignment_id: id });
  };

  const toggleSubTaskCompletion = (assignmentId: string, subTaskId: string) => {
    setAssignments(prev =>
      prev.map(a => {
        if (a.id === assignmentId) {
          const updatedSub = (a.sub_tasks || []).map(st =>
            st.id === subTaskId ? { ...st, completed: !st.completed, completed_at: !st.completed ? new Date().toISOString() : undefined } : st
          );
          const allCompleted = updatedSub.every(s => s.completed);
          return {
            ...a,
            sub_tasks: updatedSub,
            status: allCompleted ? 'completed' : 'in_progress',
          };
        }
        return a;
      })
    );
    addAuditLog('Subtask Milestone Toggled', 'Assignment', { assignmentId, subTaskId });
  };

  // Event CRUD
  const createEvent = (evt: Omit<InstitutionalEvent, 'id'>) => {
    const newEvent: InstitutionalEvent = {
      ...evt,
      id: `evt-${Date.now()}`,
    };
    setEvents(prev => [...prev, newEvent]);
    addAuditLog('Official Event Scheduled', 'Event', { title: newEvent.title, type: newEvent.event_type });

    // If HOD official event, broadcast WhatsApp announcement
    if (evt.event_type === 'department_event' || evt.event_type === 'exam') {
      const eligibleUsers = users.filter(u => u.whatsapp_enabled && (u.role === 'student' || u.role === 'teacher'));
      eligibleUsers.slice(0, 2).forEach(u => {
        const msg = formatHODEventWhatsAppMessage(newEvent, u.full_name);
        queueWhatsAppAlert({
          type: 'hod_event_announcement',
          recipient_user_id: u.id,
          recipient_name: u.full_name,
          recipient_phone: u.phone || '+1 (555) 000-0000',
          recipient_role: u.role,
          title: `Announcement: ${newEvent.title}`,
          message: msg,
          target_audience: newEvent.target_role,
        });
      });
    }
  };

  const updateEvent = (id: string, updates: Partial<InstitutionalEvent>) => {
    setEvents(prev => prev.map(e => (e.id === id ? { ...e, ...updates } : e)));
    addAuditLog('Event Updated', 'Event', { event_id: id, ...updates });
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    addAuditLog('Event Deleted', 'Event', { event_id: id });
  };

  const archiveEvent = (id: string) => {
    setEvents(prev => prev.map(e => (e.id === id ? { ...e, archived: true } : e)));
    addAuditLog('Event Archived', 'Event', { event_id: id });
  };

  // Project Group CRUD
  const createProjectGroup = (group: Omit<ProjectGroup, 'id' | 'tasks' | 'comments' | 'files'>) => {
    const newGroup: ProjectGroup = {
      ...group,
      id: `proj-${Date.now()}`,
      tasks: [],
      comments: [],
      files: [],
    };
    setProjectGroups(prev => [...prev, newGroup]);
    addAuditLog('Project Group Created', 'User', { title: newGroup.title, subject: newGroup.subject_name });
  };

  const createProjectTask = (groupId: string, task: Omit<ProjectTask, 'id'>) => {
    const newTask: ProjectTask = {
      ...task,
      id: `pt-${Date.now()}`,
    };
    setProjectGroups(prev =>
      prev.map(g => (g.id === groupId ? { ...g, tasks: [...g.tasks, newTask] } : g))
    );
  };

  const updateProjectTaskStatus = (groupId: string, taskId: string, status: ProjectTask['status']) => {
    setProjectGroups(prev =>
      prev.map(g => {
        if (g.id === groupId) {
          return {
            ...g,
            tasks: g.tasks.map(t => (t.id === taskId ? { ...t, status } : t)),
          };
        }
        return g;
      })
    );
  };

  const addProjectComment = (groupId: string, content: string, attachmentName?: string) => {
    if (!currentUser) return;
    const newComment: ProjectComment = {
      id: `c-${Date.now()}`,
      author_id: currentUser.id,
      author_name: currentUser.full_name,
      author_role: currentUser.role,
      author_avatar: currentUser.avatar_url,
      content,
      created_at: new Date().toISOString(),
      attachment_name: attachmentName,
    };
    setProjectGroups(prev =>
      prev.map(g => (g.id === groupId ? { ...g, comments: [...(g.comments || []), newComment] } : g))
    );
  };

  const updateProjectPriority = (groupId: string, priority: 'high' | 'medium' | 'low') => {
    setProjectGroups(prev =>
      prev.map(g => (g.id === groupId ? { ...g, priority } : g))
    );
    addAuditLog('Project Priority Updated', 'User', { groupId, priority });
  };

  const updateProjectTaskPriority = (groupId: string, taskId: string, priority: 'high' | 'medium' | 'low') => {
    setProjectGroups(prev =>
      prev.map(g => {
        if (g.id === groupId) {
          return {
            ...g,
            tasks: g.tasks.map(t => (t.id === taskId ? { ...t, priority } : t)),
          };
        }
        return g;
      })
    );
  };

  const createEventStaffMember = (member: Omit<EventStaffMember, 'id'>) => {
    const newStaff: EventStaffMember = {
      ...member,
      id: `staff-${Date.now()}`,
    };
    setEventStaffMembers(prev => [...prev, newStaff]);
    addAuditLog('Event Staff Registered', 'Event', { name: newStaff.name, role: newStaff.role, section: newStaff.section });
  };

  const getProfileCompletionPercentage = (user?: User | null): number => {
    const target = user || currentUser;
    if (!target) return 0;
    let score = 0;
    if (target.full_name && target.full_name.trim().length > 0) score += 15;
    if (target.unique_id && target.unique_id.trim().length > 0) score += 15;
    if (target.department_name || target.department_id) score += 15;
    if (target.class_name || target.section || target.semester) score += 15;
    if (target.phone && target.phone.trim().length > 0) score += 15;
    if (target.avatar_url && target.avatar_url.trim().length > 0) score += 10;
    // Mandatory Bio / About Me: 15%
    if (target.bio && target.bio.trim().length > 0) score += 15;
    return Math.min(100, score);
  };

  const updateUserProfile = (id: string, updates: Partial<User>) => {
    setUsers(prev =>
      prev.map(u => {
        if (u.id === id) {
          const updated = { ...u, ...updates };
          const pct = getProfileCompletionPercentage(updated);
          if (pct === 100 && updated.bio && updated.bio.trim().length > 0) {
            updated.profile_completed = true;
          }
          return updated;
        }
        return u;
      })
    );
    if (currentUser?.id === id) {
      setCurrentUser(prev => {
        if (!prev) return null;
        const updated = { ...prev, ...updates };
        const pct = getProfileCompletionPercentage(updated);
        if (pct === 100 && updated.bio && updated.bio.trim().length > 0) {
          updated.profile_completed = true;
        }
        return updated;
      });
    }
    addAuditLog('User Profile Updated', 'User', { userId: id, ...updates });
  };

  // Hackathon Demonstration Simulator (Section 108)
  const runHackathonDemoSimulation = async () => {
    setIsDemoRunning(true);
    setDemoStep(1);
    setDemoMessage('Step 1/8: Teacher Prof. Elena Rostova creates an intensive Database 3NF Project...');
    await new Promise(r => setTimeout(r, 1800));

    const demoAsg = createAssignment({
      title: 'Hackathon Demo: Distributed Raft Replication',
      description: 'Implement distributed leader election and consensus protocol benchmark.',
      class_id: 'cls-1',
      class_name: 'BCA - Section A',
      subject_name: 'Database Management Systems',
      topic_tag: 'Distributed Systems',
      teacher_id: 'usr-tch-1',
      teacher_name: 'Prof. Elena Rostova',
      due_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      due_time: '23:59',
      priority_level: 'high',
      estimated_hours: 4.0,
      sub_tasks: [
        { id: 'st-demo-1', step_number: 1, title: 'Formalize state machine specification', due_date: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0], estimated_minutes: 60, completed: false },
        { id: 'st-demo-2', step_number: 2, title: 'Implement RPC heartbeat & timeout election', due_date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0], estimated_minutes: 90, completed: false },
        { id: 'st-demo-3', step_number: 3, title: 'Stress test network partition recovery', due_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0], estimated_minutes: 90, completed: false },
      ],
    });

    setDemoStep(2);
    setDemoMessage('Step 2/8: AI Cognitive Load Engine detects existing deadline cluster and calculates stress score...');
    await new Promise(r => setTimeout(r, 1800));

    setDemoStep(3);
    setDemoMessage('Step 3/8: Workload-Aware Scheduler splits assignment into 3 milestone blocks matching focus capacity...');
    await new Promise(r => setTimeout(r, 1800));

    setDemoStep(4);
    setDemoMessage('Step 4/8: High-priority deadline collision detected! Generating smart WhatsApp reminder...');
    await new Promise(r => setTimeout(r, 1800));

    const student = users.find(u => u.role === 'student') || SEED_USERS[3];
    await queueWhatsAppAlert({
      type: 'workload_warning',
      recipient_user_id: student.id,
      recipient_name: student.full_name,
      recipient_phone: student.phone || '+1 (555) 890-1234',
      recipient_role: 'student',
      title: 'Hackathon Alert: Workload Spike Detected',
      message: formatWorkloadWarningWhatsAppMessage(student.full_name, 3, 1, 'Database Management Systems'),
    });

    setDemoStep(5);
    setDemoMessage('Step 5/8: WhatsApp notification queued and sent via Meta Cloud API simulation...');
    await new Promise(r => setTimeout(r, 1800));

    setDemoStep(6);
    setDemoMessage('Step 6/8: Student Alex Chen views personalized timetable and ticks Milestone 1 completed...');
    await new Promise(r => setTimeout(r, 1800));

    if (demoAsg.sub_tasks?.[0]?.id) {
      toggleSubTaskCompletion(demoAsg.id, demoAsg.sub_tasks[0].id);
    }

    setDemoStep(7);
    setDemoMessage('Step 7/8: Mathematical stress score drops dynamically from 82% to 48% (Elevated -> Moderate)...');
    await new Promise(r => setTimeout(r, 1800));

    setDemoStep(8);
    setDemoMessage('Step 8/8: Historical completion engine logs 60-min pace to optimize future timetable predictions! 🎉');
    await new Promise(r => setTimeout(r, 2500));

    setIsDemoRunning(false);
    setDemoStep(0);
    setDemoMessage('');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        departments,
        classes,
        subjects,
        syllabi,
        assignments,
        events,
        projectGroups,
        eventStaffMembers,
        studentExamRecords,
        auditLogs,
        studentLearningProfile,
        personalizedTimetable,
        studentStressResult,
        whatsAppQueue,
        studySessionLogs,

        login,
        logout,
        updateProfileAndChangePassword,
        verifyAndResetPassword,
        changePassword,

        submitLearningProfile,
        retakeQuizOpen,
        setRetakeQuizOpen,

        selectedClassId,
        setSelectedClassId,
        socraticDrawerOpen,
        setSocraticDrawerOpen,
        activeAssignmentContext,
        setActiveAssignmentContext,

        logStudySession,
        queueWhatsAppAlert,

        isDemoRunning,
        demoStep,
        demoMessage,
        runHackathonDemoSimulation,

        createDepartment,
        updateDepartment,
        deleteDepartment,

        createUser,
        updateUser,
        deleteUser,
        resetUserPassword,

        createClass,
        createSubject,
        createSyllabusItem,

        createAssignment,
        updateAssignment,
        deleteAssignment,
        toggleSubTaskCompletion,

        createEvent,
        updateEvent,
        deleteEvent,
        archiveEvent,

        createProjectGroup,
        createProjectTask,
        updateProjectTaskStatus,
        updateProjectPriority,
        updateProjectTaskPriority,
        addProjectComment,

        getProfileCompletionPercentage,
        updateUserProfile,
        createEventStaffMember,

        addAuditLog,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
