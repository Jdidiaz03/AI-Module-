import { supabase } from './supabase';
import { Assignment, EffortEstimate, WorkBlock, AppSettings, EstimateFeedback } from '../types';

// Fetch all data for the authenticated user
export async function fetchAllUserData(userId: string) {
  if (!supabase) return null;

  try {
    // 1. Fetch Assignments
    const { data: assignmentsData, error: assignmentsError } = await supabase
      .from('assignments')
      .select('*')
      .eq('user_id', userId);

    if (assignmentsError) throw assignmentsError;

    // 2. Fetch Estimates
    const { data: estimatesData, error: estimatesError } = await supabase
      .from('effort_estimates')
      .select('*')
      .eq('user_id', userId);

    if (estimatesError) throw estimatesError;

    // 3. Fetch Work Blocks
    const { data: blocksData, error: blocksError } = await supabase
      .from('work_blocks')
      .select('*')
      .eq('user_id', userId);

    if (blocksError) throw blocksError;

    // 4. Fetch Feedback
    const { data: feedbackData, error: feedbackError } = await supabase
      .from('estimate_feedback')
      .select('*')
      .eq('user_id', userId);

    if (feedbackError) throw feedbackError;

    // 5. Fetch Settings
    const { data: settingsData, error: settingsError } = await supabase
      .from('app_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (settingsError) throw settingsError;

    // Map database results back to App state types
    const assignments: Assignment[] = (assignmentsData || []).map(item => ({
      id: item.id,
      courseName: item.course_name,
      courseCode: item.course_code,
      title: item.title,
      dueAt: item.due_at,
      points: item.points,
      instructions: item.instructions,
      rubricText: item.rubric_text,
      submissionType: item.submission_type,
      url: item.url
    }));

    const estimates: Record<string, EffortEstimate> = {};
    (estimatesData || []).forEach(item => {
      estimates[item.assignment_id] = {
        assignmentId: item.assignment_id,
        estimatedMinutes: item.estimated_minutes,
        difficulty: item.difficulty,
        riskLevel: item.risk_level,
        confidence: item.confidence,
        reasons: item.reasons || [],
        tasks: Array.isArray(item.tasks) ? item.tasks : []
      };
    });

    const workBlocks: WorkBlock[] = (blocksData || []).map(item => ({
      id: item.id,
      assignmentId: item.assignment_id,
      assignmentTitle: item.assignment_title,
      courseCode: item.course_code,
      taskTitle: item.task_title,
      startAt: item.start_at,
      durationMinutes: item.duration_minutes,
      completed: item.completed
    }));

    const feedbackHistory = (feedbackData || []).map(item => ({
      assignmentId: item.assignment_id,
      predictedMinutes: item.predicted_minutes,
      actualMinutes: item.actual_minutes,
      feedbackType: item.feedback_type,
      notes: item.notes,
      submittedAt: item.submitted_at
    }));

    let appSettings: AppSettings | null = null;
    if (settingsData) {
      appSettings = {
        lmsEnabled: settingsData.lms_enabled,
        theme: settingsData.theme,
        privacyMode: settingsData.privacy_mode,
        historyRetentionDays: settingsData.history_retention_days
      };
    }

    return {
      assignments,
      estimates,
      workBlocks,
      feedbackHistory,
      appSettings
    };
  } catch (error) {
    console.error("Error fetching all user data from Supabase:", error);
    throw error;
  }
}

// Save profile record in the profiles table
export async function syncUserProfile(userId: string, email: string, name: string) {
  if (!supabase) return;
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      email: email,
      name: name,
      updated_at: new Date().toISOString()
    });
  if (error) {
    console.error("Error upserting profile:", error);
    throw error;
  }
}

// Upsert app settings
export async function saveUserSettings(userId: string, settings: AppSettings) {
  if (!supabase) return;
  const { error } = await supabase
    .from('app_settings')
    .upsert({
      user_id: userId,
      lms_enabled: settings.lmsEnabled,
      theme: settings.theme,
      privacy_mode: settings.privacyMode,
      history_retention_days: settings.historyRetentionDays,
      updated_at: new Date().toISOString()
    });
  if (error) {
    console.error("Error saving app settings:", error);
    throw error;
  }
}

// Save Assignment and its Effort Estimate
export async function saveAssignmentAndEstimate(
  userId: string,
  assignment: Assignment,
  estimate: EffortEstimate
) {
  if (!supabase) return;

  try {
    // 1. Insert/Upsert Assignment
    const { error: assignError } = await supabase
      .from('assignments')
      .upsert({
        id: assignment.id,
        user_id: userId,
        course_name: assignment.courseName,
        course_code: assignment.courseCode,
        title: assignment.title,
        due_at: assignment.dueAt,
        points: assignment.points,
        instructions: assignment.instructions,
        rubric_text: assignment.rubricText,
        submission_type: assignment.submissionType,
        url: assignment.url
      });

    if (assignError) throw assignError;

    // 2. Insert/Upsert Estimate
    const { error: estError } = await supabase
      .from('effort_estimates')
      .upsert({
        assignment_id: assignment.id,
        user_id: userId,
        estimated_minutes: estimate.estimatedMinutes,
        difficulty: estimate.difficulty,
        risk_level: estimate.riskLevel,
        confidence: estimate.confidence,
        reasons: estimate.reasons,
        tasks: estimate.tasks
      }, { onConflict: 'assignment_id' });

    if (estError) throw estError;
  } catch (error) {
    console.error("Error saving assignment and estimate:", error);
    throw error;
  }
}

// Update tasks array on an Estimate
export async function updateEstimateTasks(
  userId: string,
  assignmentId: string,
  estimate: EffortEstimate
) {
  if (!supabase) return;

  const { error } = await supabase
    .from('effort_estimates')
    .update({
      estimated_minutes: estimate.estimatedMinutes,
      tasks: estimate.tasks
    })
    .eq('assignment_id', assignmentId)
    .eq('user_id', userId);

  if (error) {
    console.error("Error updating estimate tasks in Supabase:", error);
    throw error;
  }
}

// Bulk insert scheduled work blocks
export async function saveWorkBlocks(userId: string, blocks: WorkBlock[]) {
  if (!supabase || !blocks.length) return;

  const dbBlocks = blocks.map(b => ({
    id: b.id,
    user_id: userId,
    assignment_id: b.assignmentId,
    assignment_title: b.assignmentTitle,
    course_code: b.courseCode,
    task_title: b.taskTitle,
    start_at: b.startAt,
    duration_minutes: b.durationMinutes,
    completed: b.completed
  }));

  const { error } = await supabase
    .from('work_blocks')
    .upsert(dbBlocks);

  if (error) {
    console.error("Error saving work blocks to Supabase:", error);
    throw error;
  }
}

// Save estimate feedback
export async function saveEstimateFeedback(
  userId: string,
  feedback: EstimateFeedback
) {
  if (!supabase) return;

  const { error } = await supabase
    .from('estimate_feedback')
    .insert({
      user_id: userId,
      assignment_id: feedback.assignmentId,
      predicted_minutes: feedback.predictedMinutes,
      actual_minutes: feedback.actualMinutes,
      feedback_type: feedback.feedbackType,
      notes: feedback.notes,
      submitted_at: feedback.submittedAt
    });

  if (error) {
    console.error("Error saving feedback to Supabase:", error);
    throw error;
  }
}

// Seed demo data for new users upon first sign-up (to prevent blank landing screens)
export async function seedDemoDataForNewUser(
  userId: string,
  demoAssignments: Assignment[],
  demoEstimates: Record<string, EffortEstimate>
) {
  if (!supabase) return;

  try {
    for (const assignment of demoAssignments) {
      const estimate = demoEstimates[assignment.id];
      if (estimate) {
        await saveAssignmentAndEstimate(userId, assignment, estimate);
      }
    }
    console.log("Demo sandbox data successfully seeded to Supabase for user:", userId);
  } catch (error) {
    console.error("Error seeding initial demo data in Supabase:", error);
  }
}
