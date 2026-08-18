export type UserRole = 'admin' | 'hod' | 'teacher' | 'student';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface User {
  id: string;
  unique_id: string; // e.g. ADMIN@123, STU-4001, TCH-3001, HOD-2001
  email: string;
  role: UserRole;
  full_name: string;
  department_id?: string;
  department_name?: string;
  class_id?: string;
  class_name?: string;
  section?: string;
  avatar_url?: string;
  phone?: string;
  bio?: string;
  skills?: string[];
  must_change_password?: boolean;
  profile_completed?: boolean;
  quiz_completed?: boolean;
  whatsapp_enabled?: boolean;
  created_at: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  hod_id?: string;
  hod_name?: string;
  faculty_count: number;
  student_count?: number;
  class_count: number;
  description?: string;
}

export interface AcademicClass {
  id: string;
  name: string;
  code: string;
  section: string;
  department_id: string;
  department_name: string;
  term: string;
  room_number: string;
  teacher_id?: string;
  teacher_name?: string;
  subject?: string;
  student_count: number;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  department_id: string;
  department_name: string;
  semester_year: string;
  teacher_id?: string;
  teacher_name?: string;
  class_id?: string;
  class_name?: string;
  credits?: number;
}

export interface SyllabusItem {
  id: string;
  class_id: string;
  class_name: string;
  subject_name: string;
  topic_name: string;
  unit_number: string;
  key_concepts: string[];
  content_text: string;
  textbook_reference: string;
  teacher_notes_snippets: string;
  uploaded_by: string;
  created_at: string;
}

export interface SubTask {
  id: string;
  step_number: number;
  title: string;
  description?: string;
  due_date: string;
  completed: boolean;
  completed_at?: string;
  estimated_minutes?: number;
  actual_minutes?: number;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  class_id: string;
  class_name: string;
  subject_name: string;
  topic_tag: string;
  teacher_id: string;
  teacher_name: string;
  due_date: string;
  due_time?: string;
  priority_level: 'low' | 'medium' | 'high' | 'critical';
  estimated_hours: number;
  personalized_hours?: number;
  status: 'upcoming' | 'in_progress' | 'completed' | 'overdue';
  created_at: string;
  sub_tasks?: SubTask[];
  attachments?: string[];
  suggested_split?: boolean;
}

export interface InstitutionalEvent {
  id: string;
  title: string;
  event_type: 'exam' | 'holiday' | 'meeting' | 'special_class' | 'college_event' | 'department_event' | 'personal' | 'deadline';
  start_date: string;
  end_date: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  department_id?: string;
  department_name?: string;
  class_id?: string;
  section?: string;
  target_role: 'all' | 'teachers' | 'students' | 'department' | 'section' | 'organizers' | 'volunteers';
  assigned_teachers?: string[];
  assigned_volunteers?: string[];
  created_by: string;
  created_by_name: string;
  description: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  archived?: boolean;
}

export interface ProjectTask {
  id: string;
  title: string;
  description?: string;
  assigned_to: string;
  assigned_to_name: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  due_date: string;
}

export interface ProjectComment {
  id: string;
  author_id: string;
  author_name: string;
  author_role: UserRole;
  author_avatar?: string;
  content: string;
  created_at: string;
  attachment_name?: string;
}

export interface ProjectFileItem {
  id: string;
  name: string;
  size: string;
  uploaded_by: string;
  uploaded_at: string;
  file_type: string;
  download_url?: string;
}

export interface ProjectGroup {
  id: string;
  class_id: string;
  class_name: string;
  subject_name: string;
  teacher_id?: string;
  teacher_name?: string;
  title: string;
  description: string;
  created_by: string;
  start_date: string;
  deadline: string;
  members: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
    phone?: string;
  }[];
  tasks: ProjectTask[];
  comments?: ProjectComment[];
  files?: ProjectFileItem[];
}

// 15-Question Numerical Student Learning Profile Model (Section 84-96)
export interface StudentLearningProfile {
  id: string;
  student_id: string;
  // Section 1: Study Time
  weekdayAvailabilityScore: number; // 1-5
  weekendAvailabilityScore: number; // 1-4
  // Section 2: Theory Learning
  theoryLearningRequirement: number; // 1-5
  preferredTheoryMethod: 'reading' | 'video' | 'notes' | 'examples' | 'practice'; // categorical + numerical 1-5
  preferredTheoryMethodScore: number;
  // Section 3: Problem Solving
  problemUnderstandingScore: number; // 1-5
  problemBatchPreference: 'all' | '5-10' | '2-5' | 'single'; // 1-4
  problemBatchScore: number;
  // Section 4: Focus & Breaks
  focusDurationScore: number; // 1-5 (15m, 20-30m, 30-45m, 45-60m, >60m)
  longSessionToleranceScore: number; // 1-5
  // Section 5: Task Preference
  longestTaskType: 'reading_theory' | 'understanding_theory' | 'solving_problems' | 'writing_answers' | 'memorizing' | 'projects';
  taskOrderingPreference: 'easy_first' | 'difficult_first' | 'short_first' | 'closest_deadline' | 'flexible';
  taskOrderingScore: number; // 1-5
  // Section 6: Revision
  revisionNeedScore: number; // 1-5
  revisionTimingPreference: 'same_day' | 'next_day' | 'few_days' | 'weekly' | 'before_exam';
  // Section 7: Stress / Workload Sensitivity
  stressSensitivityScore: number; // 1-5
  // Section 8: Multiple-Deadline Difficulty
  deadlineDifficultyType: 'dont_know_start' | 'underestimate_time' | 'procrastination' | 'overwhelmed' | 'forget_deadlines' | 'too_much_time_one';
  // Section 9: Assignment Splitting
  assignmentSplittingPreference: 'small_daily' | 'larger_few_days' | 'finish_early' | 'spread_evenly' | 'ai_decide';
  // Computed summary characteristics
  overallWorkloadCapacity: number; // calculated hours/week
  profileVersion: number;
  updated_at: string;
}

export interface QuizQuestionOption {
  text: string;
  value: number;
  metaKey?: string;
}

export interface QuizQuestion {
  id: number;
  section: string;
  question: string;
  field: keyof StudentLearningProfile;
  options: QuizQuestionOption[];
  helpText?: string;
}

// Scheduled Timetable Task item (Section 18 & 102)
export interface ScheduledTaskItem {
  id: string;
  assignment_id?: string;
  sub_task_id?: string;
  title: string;
  subject_name: string;
  duration_minutes: number;
  date: string;
  time_slot?: string;
  task_type: 'theory_review' | 'problem_solving' | 'project_work' | 'revision' | 'exam_prep' | 'break';
  priority: 'low' | 'medium' | 'high' | 'critical';
  completed: boolean;
  recommendation_reason: string; // Transparent explanation (Section 103)
}

export interface DailyPersonalizedTimetable {
  date: string;
  day_name: string;
  display_date: string;
  total_study_minutes: number;
  capacity_minutes: number;
  stress_score: number;
  is_overloaded: boolean;
  tasks: ScheduledTaskItem[];
}

export interface StressTaskBreakdown {
  assignment_id: string;
  title: string;
  subject?: string;
  subject_name?: string;
  priority?: string;
  priority_level?: string;
  days_until_deadline: number;
  estimated_hours: number;
  proficiency_score?: number;
  proficiency_index?: number;
  priority_weight?: number;
  task_stress_contribution?: number;
  subject_proficiency?: number;
  calculated_stress_contribution?: number;
}

export interface CollisionWarning {
  date: string;
  class_id: string;
  existing_assignments_count: number;
  existing_exams_count: number;
  severity: 'none' | 'amber' | 'coral';
  total_workload_hours: number;
  conflicting_subjects: string[];
  message: string;
  recommended_alternative_dates?: string[];
}

export interface StudentDiagnostic {
  subject_name: string;
  proficiency_score: number;
  pace_rating?: string;
  peak_focus_hours?: string;
  preferred_session_minutes?: number;
  extracurricular_hours_per_week?: number;
}

export type StressScoreResult = StressAnalysisResult;

export interface DailyStressProjection {
  date: string;
  display_date: string;
  displayDate?: string;
  day_name: string;
  dayName?: string;
  stress_score: number;
  status: 'low' | 'moderate' | 'elevated' | 'critical';
  tasks_due_count: number;
  task_titles: string[];
}

export interface StressAnalysisResult {
  base_stress_score: number;
  normalized_score: number;
  stress_level: 'Low' | 'Moderate' | 'Elevated' | 'Critical';
  color_code?: string;
  contributing_factors?: {
    total_assignments: number;
    high_priority_count: number;
    upcoming_exams_count: number;
    imminent_deadlines_count: number;
  };
  breakdown?: StressTaskBreakdown[];
  daily_projections: DailyStressProjection[];
  actionable_recommendations: string[];
  next_recommended_task?: {
    title: string;
    subject: string;
    due_in_days: number;
    estimated_minutes: number;
    reason: string;
  };
}

export interface WhatsAppNotification {
  id: string;
  type: 'assignment_reminder' | 'workload_warning' | 'hod_event_announcement' | 'volunteer_assignment' | 'urgent_collision';
  recipient_user_id: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_role: UserRole;
  title: string;
  message: string;
  target_audience?: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  created_at: string;
  sent_at?: string;
  error_message?: string;
}

export interface StudySessionLog {
  id: string;
  student_id: string;
  subject_name: string;
  task_title?: string;
  duration_minutes: number;
  logged_at: string;
  date: string;
  mode: 'timer' | 'manual';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  category: 'Auth' | 'User' | 'Department' | 'Assignment' | 'Event' | 'WhatsApp' | 'System';
  user_id?: string;
  user_name?: string;
  user_role?: UserRole;
  details?: Record<string, any>;
}
