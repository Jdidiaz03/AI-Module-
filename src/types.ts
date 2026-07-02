export interface TaskBreakdown {
  id: string;
  title: string;
  durationMinutes: number;
  completed: boolean;
  category: 'reading' | 'research' | 'drafting' | 'review' | 'problem-solving' | 'other';
}

export interface EffortEstimate {
  assignmentId: string;
  estimatedMinutes: number;
  difficulty: 'Low' | 'Medium' | 'Med-High' | 'High';
  riskLevel: 'Low' | 'Medium' | 'High';
  confidence: number;
  reasons: string[];
  tasks: TaskBreakdown[];
}

export interface Assignment {
  id: string;
  courseName: string;
  courseCode: string;
  title: string;
  dueAt: string; // ISO string
  points: number;
  instructions: string;
  rubricText?: string;
  submissionType: string;
  url?: string;
}

export interface PracticeQuestion {
  id: string;
  question: string;
  options?: string[]; // for multiple choice
  correctAnswer?: string;
  explanation: string;
  hint: string;
}

export interface PracticeSession {
  assignmentId: string;
  concepts: string[];
  questions: PracticeQuestion[];
}

export interface WorkBlock {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  courseCode: string;
  taskTitle: string;
  startAt: string; // ISO string
  durationMinutes: number;
  completed: boolean;
}

export interface EstimateFeedback {
  assignmentId: string;
  predictedMinutes: number;
  actualMinutes: number;
  feedbackType: 'accurate' | 'too-low' | 'too-high';
  notes?: string;
  submittedAt: string;
}

export interface AppSettings {
  lmsEnabled: 'canvas' | 'blackboard';
  theme: 'retro-heavy' | 'soft-minimalist';
  privacyMode: boolean;
  historyRetentionDays: number;
}
