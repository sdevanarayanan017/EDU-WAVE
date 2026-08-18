import {
  Assignment,
  StudentDiagnostic,
  StressScoreResult,
  StressAnalysisResult,
  StressTaskBreakdown,
  DailyStressProjection,
  CollisionWarning,
  InstitutionalEvent
} from './types';

/**
 * Subject Proficiency Index mapping:
 * Score 1 (Struggling) -> Index 0.5 (Doubles perceived stress)
 * Score 2 (Needs Improvement) -> Index 0.75
 * Score 3 (Average/Competent) -> Index 1.0
 * Score 4 (Strong) -> Index 1.25
 * Score 5 (Mastery) -> Index 1.50 (Reduces perceived stress)
 */
export function getSubjectProficiencyIndex(score: number = 3): number {
  switch (score) {
    case 1: return 0.50;
    case 2: return 0.75;
    case 3: return 1.00;
    case 4: return 1.25;
    case 5: return 1.50;
    default: return 1.00;
  }
}

/**
 * Task Priority weights:
 * High -> 3.0
 * Medium -> 2.0
 * Low -> 1.0
 */
export function getPriorityWeight(priority: 'low' | 'medium' | 'high' | 'critical' | string = 'medium'): number {
  switch (priority) {
    case 'critical': return 4.0;
    case 'high': return 3.0;
    case 'medium': return 2.0;
    case 'low': return 1.0;
    default: return 2.0;
  }
}

/**
 * Calculate the PRD Stress Score according to Section 4:
 * Base Stress Score = Sum ( (Task Priority * Estimated Effort Hours) / (Days Until Deadline * Subject Proficiency Index) )
 */
export function calculateStudentStress(
  assignments: Assignment[],
  events: InstitutionalEvent[] = [],
  diagnostics: any[] = [],
  referenceDate: Date = new Date()
): StressAnalysisResult {
  const breakdown: StressTaskBreakdown[] = [];
  let totalBaseScore = 0;

  const diagMap = new Map<string, number>();
  (diagnostics || []).forEach(d => {
    if (d?.subject_name) {
      diagMap.set(d.subject_name.toLowerCase(), d.proficiency_score || 3);
    }
  });

  const refTime = referenceDate.getTime();

  assignments.forEach(assignment => {
    // Check if subtasks are all completed
    const subTasks = assignment.sub_tasks || [];
    const allCompleted = subTasks.length > 0 && subTasks.every(st => st.completed);
    if (allCompleted) {
      return; // Completed tasks do not contribute to ongoing stress
    }

    const dueTime = new Date(assignment.due_date).getTime();
    const diffDays = (dueTime - refTime) / (1000 * 60 * 60 * 24);
    
    // Ignore assignments past due by more than 1 day or completed
    if (diffDays < -1) return;

    // Minimum clamp of 0.5 days to avoid division by zero & reflect immediate urgency
    const daysUntil = Math.max(0.5, Number(diffDays.toFixed(1)));
    
    const priorityWeight = getPriorityWeight(assignment.priority_level);
    const profScore = diagMap.get(assignment.subject_name.toLowerCase()) ?? 3;
    const profIndex = getSubjectProficiencyIndex(profScore);
    const effort = assignment.estimated_hours || 2.0;

    // Remaining effort calculation if some subtasks are completed
    let remainingEffort = effort;
    if (subTasks.length > 0) {
      const completedCount = subTasks.filter(st => st.completed).length;
      const progressRatio = completedCount / subTasks.length;
      remainingEffort = Math.max(0.5, effort * (1 - progressRatio));
    }

    // Mathematical Stress Formula: (Priority * Effort) / (Days * ProficiencyIndex)
    const taskScore = (priorityWeight * remainingEffort) / (daysUntil * profIndex);

    totalBaseScore += taskScore;

    breakdown.push({
      assignment_id: assignment.id,
      title: assignment.title,
      subject: assignment.subject_name,
      priority: assignment.priority_level,
      estimated_hours: Number(remainingEffort.toFixed(1)),
      days_until_deadline: daysUntil,
      proficiency_score: profScore,
      proficiency_index: profIndex,
      priority_weight: priorityWeight,
      task_stress_contribution: Number(taskScore.toFixed(2)),
    });
  });

  // Factor in upcoming Exams in next 7 days (+3.5 stress each)
  events.forEach(evt => {
    if (evt.event_type === 'exam') {
      const examTime = new Date(evt.start_date).getTime();
      const diff = (examTime - refTime) / (1000 * 60 * 60 * 24);
      if (diff >= 0 && diff <= 7) {
        totalBaseScore += Math.max(1.5, 4.0 / Math.max(0.5, diff));
      }
    }
  });

  // Normalize to 0 - 100 scale for UI gauges
  // A raw score of 0 = 0%, raw score of 12 = ~50%, raw score of 25+ = 100%
  const normalizedScore = Math.min(100, Math.round((totalBaseScore / 24) * 100));

  let stressLevel: 'Low' | 'Moderate' | 'Elevated' | 'Critical' = 'Low';
  let colorCode: 'emerald' | 'amber' | 'coral' | 'red' = 'emerald';

  if (normalizedScore >= 75) {
    stressLevel = 'Critical';
    colorCode = 'red';
  } else if (normalizedScore >= 50) {
    stressLevel = 'Elevated';
    colorCode = 'coral';
  } else if (normalizedScore >= 25) {
    stressLevel = 'Moderate';
    colorCode = 'amber';
  } else {
    stressLevel = 'Low';
    colorCode = 'emerald';
  }

  // 14-day timeline projection
  const dailyProjections = generate14DayProjection(assignments, diagnostics, events, referenceDate);

  // Dynamic anti-burnout actionable recommendations
  const actionableRecommendations = generateRecommendations(breakdown, stressLevel, dailyProjections);

  return {
    base_stress_score: Number(totalBaseScore.toFixed(2)),
    normalized_score: normalizedScore,
    stress_level: stressLevel,
    color_code: colorCode,
    breakdown: breakdown.sort((a, b) => (b.task_stress_contribution || 0) - (a.task_stress_contribution || 0)),
    daily_projections: dailyProjections,
    actionable_recommendations: actionableRecommendations,
  };
}

function generate14DayProjection(
  assignments: Assignment[],
  diagnostics: StudentDiagnostic[],
  events: InstitutionalEvent[],
  refDate: Date
): DailyStressProjection[] {
  const days: DailyStressProjection[] = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 0; i < 14; i++) {
    const targetDate = new Date(refDate);
    targetDate.setDate(refDate.getDate() + i);
    const dateStr = targetDate.toISOString().split('T')[0];
    const dayName = dayNames[targetDate.getDay()];
    const displayDate = targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // Find assignments due on this date
    const matchingAssignments = assignments.filter(a => {
      const aDate = new Date(a.due_date).toISOString().split('T')[0];
      return aDate === dateStr;
    });

    const matchingEvents = events.filter(e => {
      const eDate = new Date(e.start_date).toISOString().split('T')[0];
      return eDate === dateStr && e.event_type === 'exam';
    });

    let dayScore = 0;
    const taskTitles: string[] = [];

    matchingAssignments.forEach(a => {
      const pWeight = getPriorityWeight(a.priority_level);
      const hours = a.estimated_hours || 2.0;
      dayScore += pWeight * hours * 3.5;
      taskTitles.push(`${a.subject_name}: ${a.title}`);
    });

    matchingEvents.forEach(e => {
      dayScore += 18.0; // Heavy weighting for exam days
      taskTitles.push(`EXAM: ${e.title}`);
    });

    // Sub-tasks scheduled for this day
    assignments.forEach(a => {
      (a.sub_tasks || []).forEach(st => {
        if (!st.completed && st.due_date === dateStr) {
          dayScore += 4.5;
          taskTitles.push(`Milestone: ${st.title}`);
        }
      });
    });

    const normalizedDayScore = Math.min(100, Math.round(dayScore));
    let status: 'low' | 'moderate' | 'elevated' | 'critical' = 'low';
    if (normalizedDayScore >= 70) status = 'critical';
    else if (normalizedDayScore >= 45) status = 'elevated';
    else if (normalizedDayScore >= 20) status = 'moderate';

    days.push({
      date: dateStr,
      display_date: displayDate,
      displayDate,
      day_name: dayName,
      dayName,
      stress_score: normalizedDayScore,
      status,
      tasks_due_count: matchingAssignments.length + matchingEvents.length,
      task_titles: taskTitles,
    });
  }

  return days;
}

function generateRecommendations(
  breakdown: StressTaskBreakdown[],
  level: 'Low' | 'Moderate' | 'Elevated' | 'Critical',
  daily: DailyStressProjection[]
): string[] {
  const recs: string[] = [];

  if (breakdown.length > 0) {
    const topStress = breakdown[0];
    if (topStress.proficiency_score && topStress.proficiency_score <= 2) {
      recs.push(
        `High Burnout Alert: "${topStress.title}" in ${topStress.subject || topStress.subject_name} is compounding stress due to lower proficiency rating (${topStress.proficiency_score}/5). Use the Socratic AI Tutor to break down key concepts tonight.`
      );
    } else {
      recs.push(
        `Priority Focus: Complete Step 1 of "${topStress.title}" today to reduce your weekly workload peak by ~35%.`
      );
    }
  }

  const peakDay = [...daily].sort((a, b) => b.stress_score - a.stress_score)[0];
  if (peakDay && peakDay.stress_score >= 50) {
    recs.push(
      `Deadline Cluster on ${peakDay.display_date || peakDay.displayDate} (${peakDay.day_name || peakDay.dayName}): ${peakDay.tasks_due_count} major deadlines coincide. Front-load 2 sub-tasks earlier in the week to balance daily focus.`
    );
  }

  if (level === 'Critical') {
    recs.push(`Urgent: Activate the Socratic Study Plan generator in the AI drawer to redistribute your 48-hour revision milestones.`);
  } else if (level === 'Low') {
    recs.push(`Optimal Learning Flow: Your schedule is well-distributed with healthy recovery buffers between subjects.`);
  }

  return recs;
}

/**
 * Cross-Subject Collision Detection for Teachers & HODs:
 * Evaluates assignment creation on target date across all class subjects
 */
export function checkScheduleCollision(
  targetDate: string,
  classId: string,
  allAssignments: Assignment[],
  allEvents: InstitutionalEvent[] = []
): CollisionWarning {
  const formattedTarget = new Date(targetDate).toISOString().split('T')[0];

  const sameDayAssignments = allAssignments.filter(a => {
    const d = new Date(a.due_date).toISOString().split('T')[0];
    return d === formattedTarget && a.class_id === classId;
  });

  const sameDayExams = allEvents.filter(e => {
    const d = new Date(e.start_date).toISOString().split('T')[0];
    return d === formattedTarget && e.event_type === 'exam';
  });

  const totalHours = sameDayAssignments.reduce((acc, a) => acc + (a.estimated_hours || 2.0), 0);
  const conflictingSubjects = Array.from(new Set(sameDayAssignments.map(a => a.subject_name)));
  
  let severity: 'none' | 'amber' | 'coral' = 'none';
  let message = 'Optimal distribution window. No major conflicting subject deadlines on this date.';

  if (sameDayExams.length > 0 || sameDayAssignments.length >= 3 || totalHours >= 7) {
    severity = 'coral';
    message = `Critical Collision: ${sameDayExams.length > 0 ? 'Major Exam scheduled' : `${sameDayAssignments.length} other subject assignments`} already due on ${formattedTarget} (${conflictingSubjects.join(', ')}). High student burnout risk.`;
  } else if (sameDayAssignments.length >= 1 || totalHours >= 3.5) {
    severity = 'amber';
    message = `Moderate Workload Warning: ${sameDayAssignments.length} assignment(s) already due on this date in ${conflictingSubjects.join(', ')} (~${totalHours} estimated study hours).`;
  }

  // Suggest 2 alternative adjacent dates with lowest workload
  const alternativeDates: string[] = [];
  const baseDate = new Date(targetDate);
  for (let offset of [-2, -1, 1, 2, 3]) {
    const candidate = new Date(baseDate);
    candidate.setDate(baseDate.getDate() + offset);
    const cStr = candidate.toISOString().split('T')[0];
    const cCollisions = allAssignments.filter(a => {
      const d = new Date(a.due_date).toISOString().split('T')[0];
      return d === cStr && a.class_id === classId;
    });
    if (cCollisions.length === 0 && candidate.getDay() !== 0 && candidate.getDay() !== 6) {
      alternativeDates.push(cStr);
      if (alternativeDates.length >= 2) break;
    }
  }

  return {
    date: formattedTarget,
    class_id: classId,
    existing_assignments_count: sameDayAssignments.length,
    existing_exams_count: sameDayExams.length,
    severity,
    total_workload_hours: totalHours,
    conflicting_subjects: conflictingSubjects,
    message,
    recommended_alternative_dates: alternativeDates,
  };
}

export const calculateCognitiveStress = calculateStudentStress;
