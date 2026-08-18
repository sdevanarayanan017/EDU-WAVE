import {
  StudentLearningProfile,
  Assignment,
  InstitutionalEvent,
  DailyPersonalizedTimetable,
  ScheduledTaskItem,
} from './types';
import { DEFAULT_STUDENT_LEARNING_PROFILE } from './seedData';

/**
 * Normalization & Feature Extraction Service (Section 96)
 * Converts raw 15-MCQ answers into a structured numerical StudentLearningProfile.
 */
export function normalizeLearningProfile(
  studentId: string,
  answers: Record<string, any>,
  existingProfile?: StudentLearningProfile | null
): StudentLearningProfile {
  const weekdayScore = Number(answers.weekdayAvailabilityScore) || 3; // 1-5
  const weekendScore = Number(answers.weekendAvailabilityScore) || 3; // 1-4

  // Derived weekly capacity hours:
  // Weekday hours approx: [0.75, 1.5, 2.5, 3.5, 5.0] * 5 days
  // Weekend hours approx: [1.5, 3.0, 5.0, 7.0] * 2 days
  const weekdayHoursMap = [0, 0.75, 1.5, 2.5, 3.5, 5.0];
  const weekendHoursMap = [0, 1.5, 3.0, 5.0, 7.0];
  const computedWeeklyCapacity =
    (weekdayHoursMap[weekdayScore] || 2.5) * 5 +
    (weekendHoursMap[weekendScore] || 4.0) * 2;

  const version = (existingProfile?.profileVersion || 0) + 1;

  return {
    id: `lp-${studentId}-${version}`,
    student_id: studentId,
    weekdayAvailabilityScore: weekdayScore,
    weekendAvailabilityScore: weekendScore,
    theoryLearningRequirement: Number(answers.theoryLearningRequirement) || 3,
    preferredTheoryMethod: answers.preferredTheoryMethod || 'examples',
    preferredTheoryMethodScore: Number(answers.preferredTheoryMethodScore) || 4,
    problemUnderstandingScore: Number(answers.problemUnderstandingScore) || 2,
    problemBatchPreference: answers.problemBatchPreference || '5-10',
    problemBatchScore: Number(answers.problemBatchScore) || 2,
    focusDurationScore: Number(answers.focusDurationScore) || 3,
    longSessionToleranceScore: Number(answers.longSessionToleranceScore) || 2,
    longestTaskType: answers.longestTaskType || 'solving_problems',
    taskOrderingPreference: answers.taskOrderingPreference || 'closest_deadline',
    taskOrderingScore: Number(answers.taskOrderingScore) || 4,
    revisionNeedScore: Number(answers.revisionNeedScore) || 3,
    revisionTimingPreference: answers.revisionTimingPreference || 'few_days',
    stressSensitivityScore: Number(answers.stressSensitivityScore) || 4,
    deadlineDifficultyType: answers.deadlineDifficultyType || 'underestimate_time',
    assignmentSplittingPreference: answers.assignmentSplittingPreference || 'small_daily',
    overallWorkloadCapacity: Math.round(computedWeeklyCapacity),
    profileVersion: version,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Personalized Task Duration Estimator (Section 97 & 98)
 * Calculates personalized study duration in minutes based on learning profile & historical multiplier.
 */
export function calculatePersonalizedDuration(
  baseHours: number,
  taskType: 'theory' | 'problems' | 'project' | 'writing' | 'revision',
  profile: StudentLearningProfile = DEFAULT_STUDENT_LEARNING_PROFILE,
  historicalMultiplier = 1.05
): number {
  const baseMinutes = (baseHours || 1.5) * 60;
  let modifier = 1.0;

  if (taskType === 'theory') {
    // Scales with theoryLearningRequirement (1-5)
    modifier += (profile.theoryLearningRequirement - 3) * 0.12;
  } else if (taskType === 'problems') {
    // Scales with problemUnderstandingScore (1-5)
    modifier += (profile.problemUnderstandingScore - 2) * 0.15;
  } else if (taskType === 'project' || taskType === 'writing') {
    if (profile.longestTaskType === 'writing_answers' || profile.longestTaskType === 'projects') {
      modifier += 0.20;
    }
  }

  // Adjust for focus duration (if short focus duration, add small break transition buffer)
  if (profile.focusDurationScore <= 2) {
    modifier += 0.10;
  }

  // Multiply by past completion historical multiplier
  const finalMinutes = Math.round(baseMinutes * modifier * historicalMultiplier);
  return Math.max(20, Math.min(360, finalMinutes));
}

/**
 * Task Priority Score Algorithm (Section 100)
 * Priority Score = Urgency + Difficulty + Academic Importance + Personalized Duration + Current Workload Impact
 */
export function calculateTaskPriorityScore(
  assignment: Assignment,
  daysUntilDeadline: number,
  profile: StudentLearningProfile = DEFAULT_STUDENT_LEARNING_PROFILE
): number {
  // 1. Urgency (closer deadline = higher score)
  const urgencyScore = daysUntilDeadline <= 1 ? 40 : daysUntilDeadline <= 3 ? 30 : daysUntilDeadline <= 5 ? 20 : 10;

  // 2. Priority Level
  const priorityMap = { critical: 35, high: 25, medium: 15, low: 5 };
  const levelScore = priorityMap[assignment.priority_level] || 15;

  // 3. Estimated Duration Impact
  const durationScore = Math.min(20, Math.round((assignment.estimated_hours || 2) * 4));

  // 4. Student Stress Sensitivity & Task Ordering Preference
  let preferenceBonus = 0;
  if (profile.taskOrderingPreference === 'closest_deadline' && daysUntilDeadline <= 3) {
    preferenceBonus = 10;
  } else if (profile.taskOrderingPreference === 'difficult_first' && assignment.priority_level === 'high') {
    preferenceBonus = 10;
  }

  return urgencyScore + levelScore + durationScore + preferenceBonus;
}

/**
 * Deterministic AI Scheduling Engine (Sections 18, 99, 101, 102, 103)
 * Distributes tasks and generates transparent reasoning.
 */
export function generatePersonalizedTimetable(
  assignments: Assignment[],
  events: InstitutionalEvent[],
  profile: StudentLearningProfile = DEFAULT_STUDENT_LEARNING_PROFILE,
  startDate = new Date()
): DailyPersonalizedTimetable[] {
  const timetable: DailyPersonalizedTimetable[] = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate daily capacity in minutes based on weekday/weekend availability
  const weekdayMinutes = [0, 45, 90, 150, 210, 270][profile.weekdayAvailabilityScore] || 120;
  const weekendMinutes = [0, 90, 180, 300, 420][profile.weekendAvailabilityScore] || 240;

  for (let i = 0; i < 14; i++) {
    const targetDate = new Date(startDate);
    targetDate.setDate(startDate.getDate() + i);
    const dateStr = targetDate.toISOString().split('T')[0];
    const isWeekend = targetDate.getDay() === 0 || targetDate.getDay() === 6;
    const capacity = isWeekend ? weekendMinutes : weekdayMinutes;

    const dayTasks: ScheduledTaskItem[] = [];
    let totalMinutes = 0;

    // Check for exam on this date
    const dayExams = events.filter(e => {
      const eDate = new Date(e.start_date).toISOString().split('T')[0];
      return eDate === dateStr && e.event_type === 'exam';
    });

    if (dayExams.length > 0) {
      dayExams.forEach(exam => {
        dayTasks.push({
          id: `sch-exam-${exam.id}-${i}`,
          title: `EXAM: ${exam.title}`,
          subject_name: exam.department_name || 'Academic Exam',
          duration_minutes: 90,
          date: dateStr,
          time_slot: exam.start_time || '09:30 AM',
          task_type: 'exam_prep',
          priority: 'critical',
          completed: false,
          recommendation_reason: `Official examination scheduled today. Prioritize exam readiness and final formula review.`,
        });
        totalMinutes += 90;
      });
    }

    // Schedule assignment sub-tasks and milestones
    assignments.forEach(asg => {
      const asgDueDate = new Date(asg.due_date);
      const daysRemaining = Math.max(0, Math.ceil((asgDueDate.getTime() - targetDate.getTime()) / 86400000));
      const subTasks = asg.sub_tasks || [];

      subTasks.forEach((st, sIdx) => {
        if (!st.completed) {
          const stDueDate = new Date(st.due_date).toISOString().split('T')[0];
          
          // Match scheduled milestone day or distribute before assignment deadline
          if (stDueDate === dateStr || (daysRemaining <= 2 && sIdx === 0 && totalMinutes + 45 <= capacity)) {
            const taskMinutes = calculatePersonalizedDuration(
              (st.estimated_minutes ? st.estimated_minutes / 60 : 0.75),
              'problems',
              profile
            );

            // Transparent explanation logic (Section 103)
            let reason = `Due in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}. `;
            if (asg.priority_level === 'high' || asg.priority_level === 'critical') {
              reason += `High academic priority. `;
            }
            if (profile.assignmentSplittingPreference === 'small_daily') {
              reason += `EDU-WAVE split this into a ${taskMinutes}-minute milestone to match your ${profile.focusDurationScore * 15}m focus duration.`;
            } else {
              reason += `Recommended study block based on your ${profile.weekdayAvailabilityScore}/5 weekday availability profile.`;
            }

            dayTasks.push({
              id: `sch-${asg.id}-${st.id}-${i}`,
              assignment_id: asg.id,
              sub_task_id: st.id,
              title: `${asg.subject_name}: ${st.title}`,
              subject_name: asg.subject_name,
              duration_minutes: taskMinutes,
              date: dateStr,
              task_type: 'problem_solving',
              priority: asg.priority_level,
              completed: st.completed,
              recommendation_reason: reason,
            });

            totalMinutes += taskMinutes;
          }
        }
      });
    });

    // Check for overload
    const isOverloaded = totalMinutes > capacity;
    const dayStress = Math.min(100, Math.round((totalMinutes / Math.max(1, capacity)) * 75 + (dayExams.length * 20)));

    timetable.push({
      date: dateStr,
      day_name: dayNames[targetDate.getDay()],
      display_date: targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      total_study_minutes: totalMinutes,
      capacity_minutes: capacity,
      stress_score: dayStress,
      is_overloaded: isOverloaded,
      tasks: dayTasks,
    });
  }

  return timetable;
}

/**
 * Generates Top "What should I work on next?" recommendation card (Section 25 & 103)
 */
export function getTopNextTaskRecommendation(
  assignments: Assignment[],
  profile: StudentLearningProfile = DEFAULT_STUDENT_LEARNING_PROFILE
) {
  const activeAssignments = assignments.filter(a => a.status !== 'completed');
  if (activeAssignments.length === 0) {
    return {
      title: 'All Deadlines Completed!',
      subject: 'Well Done',
      due_in_days: 0,
      estimated_minutes: 0,
      reason: 'You have zero pending assignments. Great job staying ahead of your academic schedule!',
    };
  }

  // Sort by calculated priority score
  const sorted = [...activeAssignments].sort((a, b) => {
    const daysA = Math.max(0, Math.ceil((new Date(a.due_date).getTime() - Date.now()) / 86400000));
    const daysB = Math.max(0, Math.ceil((new Date(b.due_date).getTime() - Date.now()) / 86400000));
    const scoreA = calculateTaskPriorityScore(a, daysA, profile);
    const scoreB = calculateTaskPriorityScore(b, daysB, profile);
    return scoreB - scoreA;
  });

  const top = sorted[0];
  const days = Math.max(0, Math.ceil((new Date(top.due_date).getTime() - Date.now()) / 86400000));
  const estimatedMins = calculatePersonalizedDuration(top.estimated_hours, 'problems', profile);

  // Incomplete subtask title or main title
  const nextSubtask = top.sub_tasks?.find(st => !st.completed);
  const taskTitle = nextSubtask ? `${top.title} — ${nextSubtask.title}` : top.title;

  return {
    title: taskTitle,
    subject: top.subject_name,
    due_in_days: days,
    estimated_minutes: estimatedMins,
    reason: `Your ${top.subject_name} assignment has ${top.priority_level} priority due in ${days} days. Personalized for your ${profile.focusDurationScore * 15}-minute focus block and theory preference.`,
  };
}
