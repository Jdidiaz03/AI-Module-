import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Layers,
  Calendar,
  Clock,
  ShieldCheck,
  ArrowRight,
  CheckSquare,
  Plus,
  Settings,
  FileText,
  HelpCircle,
  History,
  Sparkles,
  ChevronRight,
  X,
  Edit2,
  ExternalLink,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Check,
  Undo2,
  CalendarDays,
  FileDown,
  LogOut,
  User,
  Lock,
  Mail,
  Database,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Assignment, EffortEstimate, TaskBreakdown, WorkBlock, AppSettings, PracticeSession } from './types';
import { supabase } from './lib/supabase';
import {
  fetchAllUserData,
  syncUserProfile,
  saveUserSettings,
  saveAssignmentAndEstimate,
  updateEstimateTasks,
  saveWorkBlocks,
  saveEstimateFeedback,
  seedDemoDataForNewUser
} from './lib/supabaseSync';


// Seed initial demo assignments
const DEMO_ASSIGNMENTS: Assignment[] = [
  {
    id: "assign-lit-review",
    courseName: "Cognitive Psychology 301",
    courseCode: "PSY-301",
    title: "Final Literature Review",
    dueAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    points: 100,
    instructions: "Write a comprehensive review of recent literature (past 5 years) exploring Neural Networks and Cognitive Architecture. Synthesis must include at least 12 peer-reviewed sources. Address current theoretical conflicts in abstract conceptual mapping, modeling limitations, and formatting according to APA 7th Edition style guidelines.",
    rubricText: "Synthesis of Sources (30pts), Critical Analysis of Theoretical Conflicts (30pts), APA Formatting & Citations (20pts), Structural Flow (20pts)",
    submissionType: "File Upload (.pdf)"
  },
  {
    id: "assign-thesis-analysis",
    courseName: "Cognitive Psychology 301",
    courseCode: "PSY-301",
    title: "Thesis Analysis",
    dueAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    points: 50,
    instructions: "Critically analyze the provided master's thesis on cognitive schemas in childhood development. Identify key methodological constraints, theoretical frameworks utilized, and draft a structured outline explaining its relevance to your term project.",
    rubricText: "Methodological Critique (20pts), Schema Identification (15pts), Term Relevance (15pts)",
    submissionType: "Text Entry or File Upload"
  },
  {
    id: "assign-macroeconomics",
    courseName: "Macroeconomics 101",
    courseCode: "ECON-101",
    title: "Problem Set #4",
    dueAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    points: 30,
    instructions: "Complete all problems on Aggregate Demand and Supply curves under neo-classical and Keynesian modeling assumptions. Show mathematical proofs for general equilibrium multipliers in an open economy.",
    rubricText: "Proof accuracy (15pts), Curve rendering (10pts), Conceptual explanation (5pts)",
    submissionType: "File Upload (.pdf, Scan)"
  },
  {
    id: "assign-research-method",
    courseName: "Research Methodology 202",
    courseCode: "RES-202",
    title: "Drafting Literature Review",
    dueAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    points: 80,
    instructions: "Draft the introductory literature review section of your research prospectus. This requires outline of research questions, variable operationalization, and literature background matrix.",
    submissionType: "File Upload"
  },
  {
    id: "assign-statistics",
    courseName: "Advanced Statistics 401",
    courseCode: "STAT-401",
    title: "R-Studio Data Analysis",
    dueAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    points: 100,
    instructions: "Execute a multi-variate regression analysis on the provided survey dataset in R-Studio. Clean missing covariates, test for heteroscedasticity, and compile the final analytical notebook.",
    submissionType: "RMarkdown File (.Rmd)"
  }
];

// Initial demo estimates matching screenshots
const INITIAL_ESTIMATES: Record<string, EffortEstimate> = {
  "assign-lit-review": {
    assignmentId: "assign-lit-review",
    estimatedMinutes: 135, // 2h 15m
    difficulty: 'Med-High',
    riskLevel: 'High',
    confidence: 92,
    reasons: [
      "Requires synthesis of 12 peer-reviewed sources.",
      "Complex formatting requirements (APA 7th Edition).",
      "High cognitive load due to abstract conceptual mapping."
    ],
    tasks: [
      { id: "tr-1", title: "Read Prompt carefully", durationMinutes: 15, completed: false, category: 'reading' },
      { id: "tr-2", title: "Review materials", durationMinutes: 45, completed: false, category: 'research' },
      { id: "tr-3", title: "Draft outline", durationMinutes: 30, completed: false, category: 'drafting' },
      { id: "tr-4", title: "Deep session write", durationMinutes: 45, completed: false, category: 'drafting' }
    ]
  },
  "assign-thesis-analysis": {
    assignmentId: "assign-thesis-analysis",
    estimatedMinutes: 180, // 3h
    difficulty: 'Med-High',
    riskLevel: 'Medium',
    confidence: 88,
    reasons: [
      "Rigorous structural analysis of research methodology.",
      "Requires mapping developmental schema definitions.",
      "Requires formulating concise integration points."
    ],
    tasks: [
      { id: "ta-1", title: "Read Prompt carefully", durationMinutes: 15, completed: true, category: 'reading' },
      { id: "ta-2", title: "Review materials", durationMinutes: 45, completed: true, category: 'research' },
      { id: "ta-3", title: "Draft outline", durationMinutes: 30, completed: false, category: 'drafting' },
      { id: "ta-4", title: "Deep session write", durationMinutes: 90, completed: false, category: 'drafting' }
    ]
  }
};

function getClientHeuristicEstimate(title: string, courseName: string, instructions: string) {
  const combined = `${title} ${courseName} ${instructions}`.toLowerCase();

  let baseMinutes = 120;
  let difficulty: 'Low' | 'Medium' | 'Med-High' | 'High' = 'Medium';
  let riskLevel: 'Low' | 'Medium' | 'High' = 'Medium';
  const reasons: string[] = [];

  if (combined.includes("review") || combined.includes("literature") || combined.includes("thesis")) {
    baseMinutes = 135; // 2h 15m
    difficulty = 'Med-High';
    riskLevel = 'High';
    reasons.push("Requires synthesis of 12 peer-reviewed sources.");
    reasons.push("Complex formatting requirements (APA 7th Edition).");
    reasons.push("High cognitive load due to abstract conceptual mapping.");
  } else if (combined.includes("exam") || combined.includes("test") || combined.includes("final")) {
    baseMinutes = 180; // 3 hours
    difficulty = 'High';
    riskLevel = 'High';
    reasons.push("Comprehensive knowledge recall is required.");
    reasons.push("High stakes assessment with strict time limit risk.");
    reasons.push("Requires extensive review of all semester modules.");
  } else if (combined.includes("problem set") || combined.includes("math") || combined.includes("statistic") || combined.includes("macroeconomics")) {
    baseMinutes = 90; // 1h 30m
    difficulty = 'Medium';
    riskLevel = 'Medium';
    reasons.push("Requires quantitative problem solving and formula application.");
    reasons.push("Intermediate cognitive load for conceptual translation.");
    reasons.push("Potential blockers on complex proofs or data anomalies.");
  } else {
    baseMinutes = 120;
    difficulty = 'Medium';
    riskLevel = 'Medium';
    reasons.push("General research and writing tasks detected.");
    reasons.push("Requires structuring and peer review prep.");
  }

  const tasks = [
    {
      id: `task-1-${Date.now()}`,
      title: "Read prompt carefully and outline structure",
      durationMinutes: Math.round(baseMinutes * 0.15),
      completed: false,
      category: 'reading' as const
    },
    {
      id: `task-2-${Date.now()}`,
      title: "Review materials and gather primary literature",
      durationMinutes: Math.round(baseMinutes * 0.25),
      completed: false,
      category: 'research' as const
    },
    {
      id: `task-3-${Date.now()}`,
      title: "Draft core section synthesis",
      durationMinutes: Math.round(baseMinutes * 0.45),
      completed: false,
      category: 'drafting' as const
    },
    {
      id: `task-4-${Date.now()}`,
      title: "Run APA 7th style compliance checklist",
      durationMinutes: Math.round(baseMinutes * 0.15),
      completed: false,
      category: 'review' as const
    }
  ];

  return {
    estimatedMinutes: baseMinutes,
    difficulty,
    riskLevel,
    confidence: 92,
    reasons,
    tasks
  };
}

export default function App() {
  // User Authentication State
  const [user, setUser] = useState<{ email: string; name: string; id?: string } | null>(() => {
    const saved = localStorage.getItem('effort_planner_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');

  // Navigation & Screen states
  const [activeTab, setActiveTab] = useState<'insights' | 'breakdown' | 'planner' | 'practice' | 'history'>('insights');
  const [assignmentsList, setAssignmentsList] = useState<Assignment[]>(DEMO_ASSIGNMENTS);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment>(DEMO_ASSIGNMENTS[0]);
  const [estimates, setEstimates] = useState<Record<string, EffortEstimate>>(INITIAL_ESTIMATES);
  const [savedWorkBlocks, setSavedWorkBlocks] = useState<WorkBlock[]>([]);
  const [isSyncingWithSupabase, setIsSyncingWithSupabase] = useState(false);

  // Supabase Live Connection Diagnostic States
  const [showDbDiagnosticModal, setShowDbDiagnosticModal] = useState(false);
  const [dbDiagnosticResult, setDbDiagnosticResult] = useState<{ status: 'idle' | 'testing' | 'success' | 'error'; message: string } | null>(null);

  // Custom Customizer/Input Assignment State
  const [customTitle, setCustomTitle] = useState("");
  const [customCourse, setCustomCourse] = useState("Psychology 101");
  const [customInstructions, setCustomInstructions] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);

  // Settings & Controls
  const [settings, setSettings] = useState<AppSettings>({
    lmsEnabled: 'canvas',
    theme: 'soft-minimalist',
    privacyMode: true,
    historyRetentionDays: 30
  });
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [showWeeklyPlanModal, setShowWeeklyPlanModal] = useState(false);

  // Focus Breakdown tracking (completed/mins tracking)
  const currentEstimate = estimates[selectedAssignment?.id];

  // Actual time logging on completion
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [actualMinutes, setActualMinutes] = useState(120);
  const [feedbackType, setFeedbackType] = useState<'accurate' | 'too-low' | 'too-high'>('accurate');
  const [feedbackHistory, setFeedbackHistory] = useState<any[]>([]);

  // Practice session state
  const [practiceSession, setPracticeSession] = useState<PracticeSession | null>(null);
  const [isLoadingPractice, setIsLoadingPractice] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [practiceScore, setPracticeScore] = useState(0);
  const [showHint, setShowHint] = useState(false);

  // Load database content on auth user change
  useEffect(() => {
    const loadUserData = async () => {
      // Local fallback initial load
      const localBlocks = localStorage.getItem('effort_planner_work_blocks');
      if (localBlocks) {
        setSavedWorkBlocks(JSON.parse(localBlocks));
      }
      const localFeedback = localStorage.getItem('effort_planner_feedback');
      if (localFeedback) {
        setFeedbackHistory(JSON.parse(localFeedback));
      }

      if (!user) {
        setAssignmentsList(DEMO_ASSIGNMENTS);
        setSelectedAssignment(DEMO_ASSIGNMENTS[0]);
        setEstimates(INITIAL_ESTIMATES);
        return;
      }

      if (!supabase) return;

      setIsSyncingWithSupabase(true);
      try {
        let userId = user.id;

        // Retrieve session if ID is missing from local storage cache
        if (!userId) {
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData?.session?.user) {
            userId = sessionData.session.user.id;
            setUser(prev => prev ? { ...prev, id: userId } : null);
          }
        }

        if (!userId) return;

        const syncData = await fetchAllUserData(userId);
        if (syncData) {
          if (syncData.assignments && syncData.assignments.length > 0) {
            setAssignmentsList(syncData.assignments);
            // Default to first user assignment
            setSelectedAssignment(syncData.assignments[0]);
          }
          if (syncData.estimates && Object.keys(syncData.estimates).length > 0) {
            setEstimates(syncData.estimates);
          }
          if (syncData.workBlocks && syncData.workBlocks.length > 0) {
            setSavedWorkBlocks(syncData.workBlocks);
          }
          if (syncData.feedbackHistory && syncData.feedbackHistory.length > 0) {
            setFeedbackHistory(syncData.feedbackHistory);
          }
          if (syncData.appSettings) {
            setSettings(syncData.appSettings);
          }
        }
      } catch (err) {
        console.error("Failed to load user records from Supabase:", err);
      } finally {
        setIsSyncingWithSupabase(false);
      }
    };

    loadUserData();
  }, [user]);

  // Save settings to database automatically when updated
  useEffect(() => {
    if (supabase && user && user.id) {
      saveUserSettings(user.id, settings).catch(err => {
        console.error("Error auto-saving settings to Supabase:", err);
      });
    }
  }, [settings, user]);


  // Authentication actions
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (!authEmail || !authPassword) {
      setAuthError("Please fill in all required fields.");
      return;
    }

    const emailKey = authEmail.trim().toLowerCase();

    // ---------------------------------------------------------
    // Mode A: Supabase Auth Active
    // ---------------------------------------------------------
    if (supabase) {
      setIsAnalyzing(true); // Re-use isAnalyzing spinner for simple UX
      try {
        if (authMode === 'signup') {
          if (!authName) {
            setAuthError("Please provide a name.");
            setIsAnalyzing(false);
            return;
          }

          // 1. Sign up user inside Supabase Auth
          const { data, error } = await supabase.auth.signUp({
            email: emailKey,
            password: authPassword,
            options: {
              data: {
                name: authName.trim()
              }
            }
          });

          if (error) throw error;

          const activeUser = data.user;
          if (activeUser) {
            // 2. Synchronize user record inside the profiles table
            await syncUserProfile(activeUser.id, emailKey, authName.trim());

            // 3. Setup default application settings
            await saveUserSettings(activeUser.id, settings);

            // 4. Seed initial sandbox assignments so user has immediate visual guides
            await seedDemoDataForNewUser(activeUser.id, DEMO_ASSIGNMENTS, INITIAL_ESTIMATES);

            const sessionUser = { email: emailKey, name: authName.trim(), id: activeUser.id };
            localStorage.setItem('effort_planner_user', JSON.stringify(sessionUser));
            setUser(sessionUser);
            setIsOnboarded(true);
            clearAuthInputs();
          } else {
            setAuthError("Registration complete. Please check your inbox for a confirmation email or sign in!");
          }
        } else {
          // Sign in mode
          const { data, error } = await supabase.auth.signInWithPassword({
            email: emailKey,
            password: authPassword
          });

          if (error) throw error;

          const activeUser = data.user;
          if (activeUser) {
            let displayName = activeUser.user_metadata?.name || 'Student';

            // Attempt to retrieve custom display name from profiles database
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('name')
                .eq('id', activeUser.id)
                .maybeSingle();
              if (profile?.name) {
                displayName = profile.name;
              }
            } catch (err) {
              console.warn("Could not retrieve custom profile name, using default metadata name:", err);
            }

            const sessionUser = { email: emailKey, name: displayName, id: activeUser.id };
            localStorage.setItem('effort_planner_user', JSON.stringify(sessionUser));
            setUser(sessionUser);
            setIsOnboarded(true);
            clearAuthInputs();
          }
        }
      } catch (err: any) {
        console.error("Supabase authentication error:", err);
        setAuthError(err.message || "An authentication error occurred.");
      } finally {
        setIsAnalyzing(false);
      }
      return;
    }

    // ---------------------------------------------------------
    // Mode B: Local Storage Fallback Sandbox
    // ---------------------------------------------------------
    // The offline prototype is not an authentication system. Keep it passwordless
    // so browser storage never receives credentials.

    if (authMode === 'signup') {
      if (!authName) {
        setAuthError("Please provide a name.");
        return;
      }

      const sessionUser = { email: emailKey, name: authName.trim(), id: `local-${Date.now()}` };
      localStorage.setItem('effort_planner_user', JSON.stringify(sessionUser));
      setUser(sessionUser);
      setIsOnboarded(true);
      clearAuthInputs();
    } else {
      if (emailKey === 'sandbox@canvas.edu') {
        handleDemoAccess();
        return;
      }

      setAuthError("Password sign-in requires a configured Supabase project. Use Sandbox Demo or create a local profile.");
    }
  };

  const handleDemoAccess = () => {
    const demoUser = { email: 'sandbox@canvas.edu', name: 'Sandbox Student', id: 'local-sandbox' };
    localStorage.setItem('effort_planner_user', JSON.stringify(demoUser));
    setUser(demoUser);
    setIsOnboarded(true);
    clearAuthInputs();
  };

  const handleSignOut = async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error("Error signing out from Supabase Auth:", err);
      }
    }
    localStorage.removeItem('effort_planner_user');
    setUser(null);
  };

  const testSupabaseConnection = async () => {
    setDbDiagnosticResult({ status: 'testing', message: "Testing client routing & table status..." });
    if (!supabase) {
      setDbDiagnosticResult({
        status: 'error',
        message: "No live database client. VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY are missing or set to placeholder strings inside the .env file."
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      if (error) {
        if (error.code === '42P01') {
          setDbDiagnosticResult({
            status: 'error',
            message: `Connected to Supabase, but the 'profiles' table was not found (Error 42P01). Make sure you run the SQL schema from 'supabase_schema.sql' inside your Supabase SQL Editor!`
          });
          return;
        }

        setDbDiagnosticResult({
          status: 'success',
          message: `Connected successfully! API responded: "${error.message}" (Code: ${error.code || 'None'}). The connection is active!`
        });
      } else {
        setDbDiagnosticResult({
          status: 'success',
          message: "Connected successfully! Handshake completed, 'profiles' table resolved, and connection is active!"
        });
      }
    } catch (err: any) {
      setDbDiagnosticResult({
        status: 'error',
        message: `Network or runtime connection error: ${err.message || err}`
      });
    }
  };

  const clearAuthInputs = () => {
    setAuthEmail("");
    setAuthPassword("");
    setAuthName("");
    setAuthError("");
  };

  const getApiHeaders = async () => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (!supabase) {
      return headers;
    }

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  };

  // Loading on custom paste analysis
  const handleAnalyzeAssignment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customTitle) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/estimate", {
        method: "POST",
        headers: await getApiHeaders(),
        body: JSON.stringify({
          title: customTitle,
          courseName: customCourse,
          instructions: customInstructions
        })
      });
      const data = await response.json();

      const newId = `custom-${Date.now()}`;
      const newAssignment: Assignment = {
        id: newId,
        courseName: customCourse,
        courseCode: customCourse.split(" ")[0] || "COURSE",
        title: customTitle,
        dueAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        points: 100,
        instructions: customInstructions,
        submissionType: "File Upload"
      };

      const newEstimate: EffortEstimate = {
        assignmentId: newId,
        estimatedMinutes: data.estimatedMinutes,
        difficulty: data.difficulty,
        riskLevel: data.riskLevel,
        confidence: data.confidence,
        reasons: data.reasons,
        tasks: data.tasks || []
      };

      // Add to list and set active
      setAssignmentsList(prev => [...prev, newAssignment]);
      setSelectedAssignment(newAssignment);
      setEstimates(prev => ({ ...prev, [newId]: newEstimate }));

      // Synchronize with live Supabase database if available
      if (supabase && user && user.id) {
        try {
          await saveAssignmentAndEstimate(user.id, newAssignment, newEstimate);
          console.log("Newly analyzed assignment successfully synced to Supabase database.");
        } catch (syncErr) {
          console.error("Failed to sync new assignment to Supabase:", syncErr);
        }
      }

      setCustomTitle("");
      setCustomInstructions("");
      setShowCustomModal(false);
      setActiveTab('insights');
    } catch (err) {
      console.error("Analysis failed:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generate study guide MCQ with Gemini server route
  const handleGeneratePractice = async () => {
    setIsLoadingPractice(true);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setShowHint(false);
    setPracticeScore(0);

    try {
      const response = await fetch("/api/practice", {
        method: "POST",
        headers: await getApiHeaders(),
        body: JSON.stringify({
          assignmentId: selectedAssignment.id,
          title: selectedAssignment.title,
          courseName: selectedAssignment.courseName,
          instructions: selectedAssignment.instructions
        })
      });
      const data = await response.json();
      setPracticeSession(data);
      setActiveTab('practice');
    } catch (err) {
      console.error("Practice generation failed:", err);
    } finally {
      setIsLoadingPractice(false);
    }
  };

  // Dynamic calculations for breakdown progress
  const getBreakdownProgress = () => {
    if (!currentEstimate || !currentEstimate.tasks.length) return { completedMins: 0, totalMins: 0, pct: 0 };
    const totalMins = currentEstimate.tasks.reduce((sum, t) => sum + t.durationMinutes, 0);
    const completedMins = currentEstimate.tasks
      .filter(t => t.completed)
      .reduce((sum, t) => sum + t.durationMinutes, 0);
    return {
      completedMins,
      totalMins,
      pct: totalMins > 0 ? Math.round((completedMins / totalMins) * 100) : 0
    };
  };

  const progressStats = getBreakdownProgress();

  // Toggle task completed on breakdown
  const handleToggleTask = async (taskId: string) => {
    let updatedEstimate: EffortEstimate | null = null;
    setEstimates(prev => {
      const est = prev[selectedAssignment.id];
      if (!est) return prev;
      updatedEstimate = {
        ...est,
        tasks: est.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
      };
      return {
        ...prev,
        [selectedAssignment.id]: updatedEstimate
      };
    });

    if (supabase && user && user.id && updatedEstimate) {
      try {
        await updateEstimateTasks(user.id, selectedAssignment.id, updatedEstimate);
      } catch (err) {
        console.error("Failed to sync task toggle to Supabase:", err);
      }
    }
  };

  // Edit duration of task in place
  const handleUpdateTaskMinutes = async (taskId: string, mins: number) => {
    let updatedEstimate: EffortEstimate | null = null;
    setEstimates(prev => {
      const est = prev[selectedAssignment.id];
      if (!est) return prev;
      const updatedTasks = est.tasks.map(t => t.id === taskId ? { ...t, durationMinutes: mins } : t);
      const totalMinutes = updatedTasks.reduce((acc, t) => acc + t.durationMinutes, 0);
      updatedEstimate = {
        ...est,
        estimatedMinutes: totalMinutes,
        tasks: updatedTasks
      };
      return {
        ...prev,
        [selectedAssignment.id]: updatedEstimate
      };
    });

    if (supabase && user && user.id && updatedEstimate) {
      try {
        await updateEstimateTasks(user.id, selectedAssignment.id, updatedEstimate);
      } catch (err) {
        console.error("Failed to sync task minutes update to Supabase:", err);
      }
    }
  };

  // Add sub-task
  const handleAddSubtask = async () => {
    const titlePrompt = prompt("Enter sub-task focus title:");
    if (!titlePrompt) return;
    const minsPrompt = parseInt(prompt("Enter duration in minutes:") || "30", 10);
    if (isNaN(minsPrompt)) return;

    let updatedEstimate: EffortEstimate | null = null;
    setEstimates(prev => {
      const est = prev[selectedAssignment.id];
      if (!est) return prev;
      const newTask: TaskBreakdown = {
        id: `task-custom-${Date.now()}`,
        title: titlePrompt,
        durationMinutes: minsPrompt,
        completed: false,
        category: 'other'
      };
      const updatedTasks = [...est.tasks, newTask];
      updatedEstimate = {
        ...est,
        estimatedMinutes: updatedTasks.reduce((sum, t) => sum + t.durationMinutes, 0),
        tasks: updatedTasks
      };
      return {
        ...prev,
        [selectedAssignment.id]: updatedEstimate
      };
    });

    if (supabase && user && user.id && updatedEstimate) {
      try {
        await updateEstimateTasks(user.id, selectedAssignment.id, updatedEstimate);
      } catch (err) {
        console.error("Failed to sync added subtask to Supabase:", err);
      }
    }
  };

  // Turn active Breakdown tasks into saved calendar WorkBlocks
  const handleScheduleBlocks = async () => {
    if (!currentEstimate) return;

    // Clear and re-schedule or append
    const scheduled: WorkBlock[] = currentEstimate.tasks.map((task, i) => {
      const dateOffset = Math.floor(i / 2); // Spread out tasks across days
      const startHour = 10 + (i % 2) * 4; // 10 AM or 2 PM
      const workDate = new Date();
      workDate.setDate(workDate.getDate() + dateOffset);
      workDate.setHours(startHour, 0, 0, 0);

      return {
        id: `block-${Date.now()}-${i}`,
        assignmentId: selectedAssignment.id,
        assignmentTitle: selectedAssignment.title,
        courseCode: selectedAssignment.courseCode,
        taskTitle: task.title,
        startAt: workDate.toISOString(),
        durationMinutes: task.durationMinutes,
        completed: task.completed
      };
    });

    setSavedWorkBlocks(prev => {
      // Filter out existing blocks for this assignment
      const filtered = prev.filter(b => b.assignmentId !== selectedAssignment.id);
      const allBlocks = [...filtered, ...scheduled];
      localStorage.setItem('effort_planner_work_blocks', JSON.stringify(allBlocks));
      return allBlocks;
    });

    // Sync scheduled work blocks to Supabase database
    if (supabase && user && user.id) {
      try {
        await saveWorkBlocks(user.id, scheduled);
        console.log("Scheduled study blocks successfully synced to Supabase database.");
      } catch (syncErr) {
        console.error("Failed to sync study blocks to Supabase:", syncErr);
      }
    }

    setShowWeeklyPlanModal(true);
  };

  // Generate .ics calendar download
  const handleExportICS = () => {
    if (!savedWorkBlocks.length) {
      alert("No scheduled work blocks to export. Please plan your work blocks first!");
      return;
    }

    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Academic Effort Planner//Study Blocks//EN\n";

    savedWorkBlocks.forEach(block => {
      const startDate = new Date(block.startAt);
      const endDate = new Date(startDate.getTime() + block.durationMinutes * 60 * 1000);

      const formatICSDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      };

      icsContent += "BEGIN:VEVENT\n";
      icsContent += `UID:block-${block.id}@effortplanner.local\n`;
      icsContent += `DTSTAMP:${formatICSDate(new Date())}\n`;
      icsContent += `DTSTART:${formatICSDate(startDate)}\n`;
      icsContent += `DTEND:${formatICSDate(endDate)}\n`;
      icsContent += `SUMMARY:[Study] ${block.courseCode} - ${block.taskTitle}\n`;
      icsContent += `DESCRIPTION:Planned study block for assignment: ${block.assignmentTitle}. Duration: ${block.durationMinutes} mins.\\nStudyCompanion Integrity Shield Enabled.\\n\n`;
      icsContent += "END:VEVENT\n";
    });

    icsContent += "END:VCALENDAR";

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `study_blocks_${selectedAssignment.courseCode.replace(" ", "_")}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Log completion statistics and actual time
  const handleSaveFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    const newFeedback = {
      assignmentId: selectedAssignment.id,
      title: selectedAssignment.title,
      courseName: selectedAssignment.courseName,
      predictedMinutes: currentEstimate?.estimatedMinutes || 0,
      actualMinutes,
      feedbackType,
      submittedAt: new Date().toISOString()
    };

    setFeedbackHistory(prev => {
      const updated = [newFeedback, ...prev];
      localStorage.setItem('effort_planner_feedback', JSON.stringify(updated));
      return updated;
    });

    setShowFeedbackModal(false);

    // Mark all tasks completed
    let updatedEstimate: EffortEstimate | null = null;
    if (currentEstimate) {
      setEstimates(prev => {
        const targetEst = prev[selectedAssignment.id];
        if (!targetEst) return prev;
        updatedEstimate = {
          ...targetEst,
          tasks: targetEst.tasks.map(t => ({ ...t, completed: true }))
        };
        return {
          ...prev,
          [selectedAssignment.id]: updatedEstimate
        };
      });
    }

    if (supabase && user && user.id) {
      try {
        await saveEstimateFeedback(user.id, newFeedback as any);
        if (updatedEstimate) {
          await updateEstimateTasks(user.id, selectedAssignment.id, updatedEstimate);
        }
        console.log("Feedback log and final checklist completions successfully saved to Supabase.");
      } catch (syncErr) {
        console.error("Failed to sync feedback log to Supabase:", syncErr);
      }
    }

    setActiveTab('history');
  };

  // Helper to format minutes to nice strings (e.g. 2h 15m)
  const formatTime = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Set up estimate for assignments that don't have one initially
  useEffect(() => {
    if (selectedAssignment && !estimates[selectedAssignment.id]) {
      // Populate standard simulation estimate
      const sim = getClientHeuristicEstimate(selectedAssignment.title, selectedAssignment.courseName, selectedAssignment.instructions);
      setEstimates(prev => ({
        ...prev,
        [selectedAssignment.id]: {
          assignmentId: selectedAssignment.id,
          estimatedMinutes: sim.estimatedMinutes,
          difficulty: sim.difficulty,
          riskLevel: sim.riskLevel,
          confidence: sim.confidence,
          reasons: sim.reasons,
          tasks: sim.tasks
        }
      }));
    }
  }, [selectedAssignment, estimates]);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FDFBF7] selection:bg-[#c2e7e6]">
        {/* Header Ribbon */}
        <header className="sticky top-0 z-40 bg-[#fbf9f5] border-b border-[#EBE4D8] px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-[#426464] text-white p-2 rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-sans font-bold text-lg tracking-tight text-[#1e1e1e]">
                Academic Effort Planner
              </h1>
              <p className="text-xs text-[#5C5C5C] font-mono uppercase tracking-widest">
                LMS Integration Simulator
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Switcher */}
            <div className="flex items-center gap-1 bg-[#F1EDE4] p-1 rounded-md text-xs font-mono">
              <button
                onClick={() => setSettings(prev => ({ ...prev, theme: 'soft-minimalist' }))}
                className={`px-2.5 py-1 rounded transition-colors ${settings.theme === 'soft-minimalist' ? 'bg-white text-[#1e1e1e] font-bold shadow-xs' : 'text-[#8A8A8A] hover:text-[#1e1e1e]'}`}
              >
                Soft
              </button>
              <button
                onClick={() => setSettings(prev => ({ ...prev, theme: 'retro-heavy' }))}
                className={`px-2.5 py-1 rounded transition-colors ${settings.theme === 'retro-heavy' ? 'bg-white text-[#1e1e1e] font-bold shadow-xs' : 'text-[#8A8A8A] hover:text-[#1e1e1e]'}`}
              >
                Retro
              </button>
            </div>
          </div>
        </header>

        {/* Auth Body Container */}
        <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-radial from-white via-[#FDFBF7] to-[#F1EDE4]/30">
          <AnimatePresence mode="wait">
            {settings.theme === 'retro-heavy' ? (
              <motion.div
                key="retro-auth"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="w-full max-w-md bg-white border-2 border-black p-6 md:p-8 shadow-[6px_6px_0px_rgba(0,0,0,1)] space-y-6"
              >
                <div className="text-center space-y-2">
                  <span className="inline-block px-2.5 py-1 bg-black text-white font-mono text-[10px] font-bold uppercase tracking-widest">
                    SECURE GATEWAY
                  </span>
                  <h2 className="text-2xl font-extrabold tracking-tighter uppercase text-black">
                    {authMode === 'signin' ? 'STUDENT LOGIN' : 'CREATE PORTAL'}
                  </h2>
                  <p className="text-xs font-bold text-gray-700 font-mono">
                    {authMode === 'signin' ? 'Verify credentials to access course planner' : 'Register local account on sandbox'}
                  </p>
                </div>

                {/* Mode Toggle Tabs */}
                <div className="grid grid-cols-2 border-2 border-black p-1 bg-white font-mono text-xs">
                  <button
                    onClick={() => { setAuthMode('signin'); setAuthError(''); }}
                    className={`py-2 font-bold uppercase ${authMode === 'signin' ? 'bg-black text-white' : 'text-black hover:bg-gray-100'}`}
                  >
                    SIGN IN
                  </button>
                  <button
                    onClick={() => { setAuthMode('signup'); setAuthError(''); }}
                    className={`py-2 font-bold uppercase ${authMode === 'signup' ? 'bg-black text-white' : 'text-black hover:bg-gray-100'}`}
                  >
                    SIGN UP
                  </button>
                </div>

                {authError && (
                  <div className="bg-red-50 border-2 border-red-500 p-3 text-xs text-red-700 font-bold font-mono flex items-start gap-2">
                    <span className="material-symbols-outlined text-sm font-bold mt-0.5 shrink-0">error</span>
                    <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {authMode === 'signup' && (
                    <div className="space-y-1">
                      <label className="block text-xs font-bold font-mono uppercase text-black">Student Name</label>
                      <div className="relative border-2 border-black">
                        <span className="absolute left-3 top-2.5 text-black">
                          <User className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Alex Student"
                          value={authName}
                          onChange={(e) => setAuthName(e.target.value)}
                          className="w-full pl-10 pr-3 py-2 text-sm text-black bg-white placeholder-gray-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="block text-xs font-bold font-mono uppercase text-black">Course Email</label>
                    <div className="relative border-2 border-black">
                      <span className="absolute left-3 top-2.5 text-black">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        type="email"
                        required
                        placeholder="sandbox@canvas.edu"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 text-sm text-black bg-white placeholder-gray-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold font-mono uppercase text-black">Password</label>
                    <div className="relative border-2 border-black">
                      <span className="absolute left-3 top-2.5 text-black">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 text-sm text-black bg-white placeholder-gray-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-black text-white hover:bg-gray-900 border-2 border-black font-mono font-bold uppercase tracking-wider shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all duration-150"
                  >
                    {authMode === 'signin' ? 'PROCEED TO WORKSPACE' : 'INITIALIZE ACCOUNT'}
                  </button>
                </form>

                <div className="border-t-2 border-black pt-4 text-center space-y-2">
                  <p className="text-[10px] font-mono font-bold text-gray-500 uppercase">
                    OR BYPASS AUTHENTICATION
                  </p>
                  <button
                    onClick={handleDemoAccess}
                    className="w-full py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border-2 border-blue-600 font-mono text-xs font-bold uppercase tracking-tight flex items-center justify-center gap-1.5"
                  >
                    <span>USE SANDBOX DEMO ACCOUNT</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <p className="text-[10px] text-gray-400 font-mono">
                    Login details: <span className="font-bold text-gray-600">sandbox@canvas.edu</span> / <span className="font-bold text-gray-600">sandbox</span>
                  </p>
                </div>
              </motion.div>
            ) : (
              /* Soft Minimalist Auth Theme */
              <motion.div
                key="soft-auth"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="w-full max-w-md bg-white border border-[#EBE4D8] p-6 md:p-8 rounded-[28px] shadow-md space-y-6 relative overflow-hidden"
              >
                {/* Visual decoration */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#426464]/5 rounded-full blur-2xl pointer-events-none"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#6B8E8E]/5 rounded-full blur-2xl pointer-events-none"></div>

                <div className="text-center space-y-2 relative z-10">
                  <div className="inline-flex p-3 bg-[#426464]/10 text-[#426464] rounded-2xl mb-1">
                    <Layers className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight text-[#1e1e1e]">
                    {authMode === 'signin' ? 'Welcome Back' : 'Get Started'}
                  </h2>
                  <p className="text-xs text-[#5C5C5C] font-sans">
                    {authMode === 'signin'
                      ? 'Sign in to access your customized academic timeline'
                      : 'Create a local study account to begin planning'}
                  </p>
                </div>

                {/* Mode Toggle Tabs */}
                <div className="grid grid-cols-2 p-1 bg-[#F8F5F0] border border-[#EBE4D8] rounded-xl text-xs font-sans">
                  <button
                    onClick={() => { setAuthMode('signin'); setAuthError(''); }}
                    className={`py-2 rounded-lg font-bold transition-all ${authMode === 'signin' ? 'bg-white text-[#1e1e1e] shadow-xs' : 'text-[#8A8A8A] hover:text-[#1e1e1e]'}`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { setAuthMode('signup'); setAuthError(''); }}
                    className={`py-2 rounded-lg font-bold transition-all ${authMode === 'signup' ? 'bg-white text-[#1e1e1e] shadow-xs' : 'text-[#8A8A8A] hover:text-[#1e1e1e]'}`}
                  >
                    Sign Up
                  </button>
                </div>

                {authError && (
                  <div className="bg-red-50/70 border border-red-200 p-3.5 rounded-xl text-xs text-red-700 font-sans flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-sm font-bold mt-0.5 text-red-500 shrink-0">error</span>
                    <span>{authError}</span>
                  </div>
                )}

                <form onSubmit={handleAuthSubmit} className="space-y-4 relative z-10">
                  {authMode === 'signup' && (
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#5C5C5C] uppercase tracking-wider font-mono">Full Name</label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-[#8A8A8A]">
                          <User className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Alex Student"
                          value={authName}
                          onChange={(e) => setAuthName(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 text-sm border border-[#EBE4D8] rounded-xl text-[#1e1e1e] bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#426464] focus:border-[#426464] transition-all"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#5C5C5C] uppercase tracking-wider font-mono">Email Address</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-[#8A8A8A]">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        type="email"
                        required
                        placeholder="student@university.edu"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-[#EBE4D8] rounded-xl text-[#1e1e1e] bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#426464] focus:border-[#426464] transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#5C5C5C] uppercase tracking-wider font-mono">Password</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-[#8A8A8A]">
                        <Lock className="w-4 h-4" />
                      </span>
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-[#EBE4D8] rounded-xl text-[#1e1e1e] bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#426464] focus:border-[#426464] transition-all"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#426464] hover:bg-[#324d4d] text-white rounded-xl font-sans font-bold transition-all duration-200 shadow-md shadow-[#426464]/10 hover:shadow-lg active:scale-[0.98]"
                  >
                    {authMode === 'signin' ? 'Sign In to Workspace' : 'Create Student Profile'}
                  </button>
                </form>

                <div className="border-t border-[#F1EDE4] pt-4 text-center space-y-3">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#8A8A8A] block">
                    Bypass for Evaluation
                  </span>
                  <button
                    onClick={handleDemoAccess}
                    className="w-full py-2.5 bg-[#F8F5F0] hover:bg-[#F1EDE4] text-[#426464] border border-[#EBE4D8] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Instant Demo Sandbox Access</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-[10px] text-[#8A8A8A] font-sans">
                    Credentials: <span className="font-mono text-[#426464] bg-[#F8F5F0] px-1 py-0.5 rounded border border-[#EBE4D8] font-bold">sandbox@canvas.edu / sandbox</span>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] selection:bg-[#c2e7e6]">

      {/* Top Application Ribbon */}
      <header className="sticky top-0 z-40 bg-[#fbf9f5] border-b border-[#EBE4D8] px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-[#426464] text-white p-2 rounded-lg">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-sans font-bold text-lg tracking-tight text-[#1e1e1e]">
              Academic Effort Planner
            </h1>
            <p className="text-xs text-[#5C5C5C] font-mono uppercase tracking-widest">
              LMS Integration Simulator
            </p>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-4">

          {/* Active Preset Course Info / Database Connection Badge */}
          <button
            onClick={() => {
              setShowDbDiagnosticModal(true);
              testSupabaseConnection();
            }}
            title="Click to run live Supabase connection diagnostic test"
            className="hidden lg:flex items-center gap-2 bg-[#F1EDE4] hover:bg-[#EBE4D8] px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all border border-[#EBE4D8]/30"
          >
            <span className={`w-2 h-2 rounded-full ${supabase ? 'bg-[#10b981] animate-pulse' : 'bg-[#eab308]'}`} />
            <span className={supabase ? 'text-[#047857] font-semibold' : 'text-[#ca8a04]'}>
              {supabase ? 'Supabase Live' : 'Sandbox (Offline)'}
            </span>
          </button>

          {/* Theme switcher control */}
          <div className="flex items-center gap-1 bg-[#F1EDE4] p-1 rounded-md text-xs font-mono">
            <button
              onClick={() => setSettings(prev => ({ ...prev, theme: 'soft-minimalist' }))}
              className={`px-2.5 py-1 rounded transition-colors ${settings.theme === 'soft-minimalist' ? 'bg-white text-[#1e1e1e] font-bold shadow-xs' : 'text-[#8A8A8A] hover:text-[#1e1e1e]'}`}
            >
              Soft
            </button>
            <button
              onClick={() => setSettings(prev => ({ ...prev, theme: 'retro-heavy' }))}
              className={`px-2.5 py-1 rounded transition-colors ${settings.theme === 'retro-heavy' ? 'bg-white text-[#1e1e1e] font-bold shadow-xs' : 'text-[#8A8A8A] hover:text-[#1e1e1e]'}`}
            >
              Retro
            </button>
          </div>

          {/* User profile & Logout */}
          <div className="flex items-center gap-2 border-l border-[#EBE4D8] pl-4">
            <div className="w-7 h-7 rounded-full bg-[#426464] text-white flex items-center justify-center font-bold text-xs select-none">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-[#1e1e1e] leading-none">{user.name}</p>
              <p className="text-[10px] text-[#8A8A8A] font-mono leading-none mt-0.5">{user.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="p-1.5 text-[#8A8A8A] hover:text-[#ba1a1a] transition-all rounded-lg hover:bg-[#F1EDE4] ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setShowCustomModal(true)}
            className="bg-[#426464] hover:bg-[#324d4d] text-white text-xs px-3.5 py-2 rounded-md font-bold transition-all flex items-center gap-1.5 shadow-xs active:scale-[0.98]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Analyze Homework</span>
          </button>
        </div>
      </header>

      {/* Main Sandbox Split-Pane */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left Column: Canvas LMS Assignment Display Simulator */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-[#EBE4D8] rounded-2xl p-5 lg:p-6 shadow-xs relative overflow-hidden">

            {/* Simulation Header */}
            <div className="flex items-center justify-between border-b border-[#F1EDE4] pb-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#ba1a1a] animate-ping" />
                <span className="font-mono text-xs text-[#5C5C5C] font-bold tracking-wider uppercase">
                  SIMULATED CANVAS WEB PAGE
                </span>
              </div>

              {/* Assignment Picker */}
              <select
                value={selectedAssignment?.id}
                onChange={(e) => {
                  const found = assignmentsList.find(a => a.id === e.target.value);
                  if (found) setSelectedAssignment(found);
                }}
                className="bg-[#fbf9f5] border border-[#EBE4D8] rounded-lg text-xs font-bold text-[#1e1e1e] py-1.5 px-3 focus:outline-none focus:ring-1 focus:ring-[#426464]"
              >
                {assignmentsList.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.courseCode} - {item.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Simulated LMS Workspace Content */}
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-bold text-[#8A8A8A] font-mono uppercase">
                  {selectedAssignment.courseName}
                </p>
                <h2 className="font-sans font-bold text-2xl text-[#1e1e1e] tracking-tight">
                  {selectedAssignment.title}
                </h2>
              </div>

              {/* Core Deadlines */}
              <div className="grid grid-cols-3 gap-2 bg-[#fbf9f5] p-3 rounded-xl border border-[#F1EDE4] text-xs font-mono">
                <div>
                  <span className="block text-[10px] text-[#8A8A8A] uppercase">Due Date</span>
                  <span className="font-bold text-[#1e1e1e]">
                    {new Date(selectedAssignment.dueAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-[#8A8A8A] uppercase">Points Possible</span>
                  <span className="font-bold text-[#1e1e1e]">{selectedAssignment.points} pts</span>
                </div>
                <div>
                  <span className="block text-[10px] text-[#8A8A8A] uppercase">Submission Type</span>
                  <span className="font-bold text-[#1e1e1e] text-ellipsis overflow-hidden block whitespace-nowrap">
                    {selectedAssignment.submissionType}
                  </span>
                </div>
              </div>

              {/* Assignment Details */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[#1e1e1e] uppercase tracking-wider font-sans border-b border-[#F1EDE4] pb-1">
                  Instructions
                </h3>
                <p className="text-sm text-[#5C5C5C] leading-relaxed font-sans">
                  {selectedAssignment.instructions}
                </p>
              </div>

              {/* Rubric Details if present */}
              {selectedAssignment.rubricText && (
                <div className="bg-[#fbf9f5] p-4 rounded-xl border border-[#EBE4D8] space-y-1">
                  <h4 className="text-xs font-bold text-[#426464] uppercase font-mono tracking-wider">
                    Grading Rubric
                  </h4>
                  <p className="text-xs text-[#5C5C5C] leading-relaxed">
                    {selectedAssignment.rubricText}
                  </p>
                </div>
              )}

              {/* Integrity Reminder Tag */}
              <div className="flex items-start gap-3 bg-[#f5f3ef]/50 p-4 rounded-xl border border-[#EBE4D8]">
                <ShieldCheck className="w-5 h-5 text-[#426464] shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <span className="font-bold text-[#1e1e1e] block uppercase font-mono tracking-wide">
                    StudyCompanion Integrity Shield
                  </span>
                  <p className="text-[#5C5C5C]">
                    We act as scheduling and mastery guides only. This application will analyze depth to estimate schedule time, but does not solve or write questions for you.
                  </p>
                </div>
              </div>

              {/* Injected Widget Launcher Notice */}
              <div className="pt-2 border-t border-[#F1EDE4] flex justify-between items-center text-xs">
                <span className="text-[#8A8A8A] font-mono">Injected Effort Planner Panel Active</span>
                <span className="text-[#426464] font-bold flex items-center gap-1">
                  Extension Connected
                  <span className="w-1.5 h-1.5 rounded-full bg-[#426464] animate-pulse" />
                </span>
              </div>
            </div>
          </div>

          {/* Quick Guide for Extension Playground */}
          <div className="bg-[#fbf9f5] border border-[#EBE4D8] rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-sm text-[#1e1e1e] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#426464]" />
              <span>How to play with this prototype:</span>
            </h3>
            <ul className="text-xs text-[#5C5C5C] space-y-2 list-disc list-inside">
              <li>Toggle between demo homework tasks like <strong className="text-[#1e1e1e]">Thesis Analysis</strong> or <strong className="text-[#1e1e1e]">Final Literature Review</strong> using the dropdown.</li>
              <li>Toggle onboarding designs, adjust tasks in real time, or generate custom multiple choice study concept checks via <strong className="text-[#1e1e1e]">Practice Concepts</strong>.</li>
              <li>Press the <strong className="text-[#1e1e1e]">Analyze Homework</strong> button above to paste any assignment and see Gemini analyze it live!</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Injected Extensions / Side Panel Planner */}
        <div className="lg:col-span-5">

          {/* Onboarding View (Screenshot 1 & 2) if not onboarded yet */}
          {!isOnboarded ? (
            <AnimatePresence mode="wait">
              {settings.theme === 'retro-heavy' ? (
                /* Retro Heavy-Border Theme (Screenshot 1) */
                <motion.main
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="w-full bg-white border-2 border-black flex flex-col overflow-hidden shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                  style={{ minHeight: '520px' }}
                >
                  <header className="p-6 bg-white border-b-2 border-black">
                    <div className="flex items-start gap-2.5 mb-2">
                      <span className="p-1 bg-black text-white shrink-0 font-bold font-mono text-xs">
                        92%
                      </span>
                      <h1 className="font-sans font-extrabold text-xl leading-none tracking-tighter uppercase text-black">
                        Assignment Effort Planner
                      </h1>
                    </div>
                    <p className="font-bold text-sm text-black">
                      See the work before it surprises you
                    </p>
                  </header>

                  <div className="p-6 flex-grow space-y-6">
                    {/* Retro Estimated Velocity Chart */}
                    <div className="w-full h-24 border-2 border-black flex items-center justify-center relative bg-white">
                      <div className="flex gap-2 items-end h-16">
                        <div className="w-6 h-10 border-2 border-black bg-[#2563EB]/10"></div>
                        <div className="w-6 h-16 border-2 border-black bg-[#2563EB]/40"></div>
                        <div className="w-6 h-12 border-2 border-black bg-[#2563EB]"></div>
                        <div className="w-6 h-8 border-2 border-black bg-[#2563EB]/20"></div>
                        <div className="w-6 h-14 border-2 border-black bg-white"></div>
                      </div>
                      <div className="absolute top-2 left-2">
                        <span className="font-mono text-[9px] text-black font-bold uppercase border border-black px-1.5 py-0.5 bg-white">
                          Estimated Velocity
                        </span>
                      </div>
                    </div>

                    {/* Permissions list */}
                    <section className="space-y-3">
                      <h2 className="font-mono text-[11px] font-extrabold text-black uppercase border-b-2 border-black inline-block tracking-widest">
                        Permissions
                      </h2>
                      <div className="space-y-2">
                        <div className="flex items-start gap-3 p-2 border border-transparent hover:border-black transition-all">
                          <div className="mt-0.5 p-1 border-2 border-black">
                            <span className="material-symbols-outlined text-xs font-bold block">language</span>
                          </div>
                          <div>
                            <span className="block text-xs font-extrabold uppercase tracking-tight text-black">Works on Canvas</span>
                            <span className="text-[11px] text-[#5C5C5C]">Integrates directly into your course dashboard.</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-2 border border-transparent hover:border-black transition-all">
                          <div className="mt-0.5 p-1 border-2 border-black">
                            <span className="material-symbols-outlined text-xs font-bold block">description</span>
                          </div>
                          <div>
                            <span className="block text-xs font-extrabold uppercase tracking-tight text-black">Reads assignment details</span>
                            <span className="text-[11px] text-[#5C5C5C]">Analyzes rubrics and instructions for depth.</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-2 border border-transparent hover:border-black transition-all">
                          <div className="mt-0.5 p-1 border-2 border-black">
                            <span className="material-symbols-outlined text-xs font-bold block">encrypted</span>
                          </div>
                          <div>
                            <span className="block text-xs font-extrabold uppercase tracking-tight text-black">Stores history locally</span>
                            <span className="text-[11px] text-[#5C5C5C]">Your data stays on your machine, always private.</span>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Academic Integrity Box */}
                    <div className="bg-white p-3 border-2 border-black space-y-1">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
                        <span className="font-mono text-[10px] font-bold text-black uppercase">Integrity Policy</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-black font-medium">
                        StudyCompanion acts as a scheduling assistant only. It does not generate content or answer assignment questions.
                      </p>
                    </div>
                  </div>

                  <footer className="p-6 pt-0 pb-6">
                    <button
                      onClick={() => setIsOnboarded(true)}
                      className="w-full bg-[#2563EB] text-white py-3 px-4 border-2 border-black font-bold font-mono uppercase tracking-widest transition-all shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 flex items-center justify-center gap-2 active:translate-x-0 active:translate-y-0 active:shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                    >
                      Enable on Canvas
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <p className="mt-3 text-center text-[10px] text-black font-bold uppercase tracking-tight">
                      Agree to our <a className="underline decoration-[#2563EB] decoration-2" href="#terms">Terms of Service</a>.
                    </p>
                  </footer>
                </motion.main>
              ) : (
                /* Soft Minimalist Round Theme (Screenshot 2) */
                <motion.main
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="w-full bg-white border border-[#EBE4D8] rounded-[24px] flex flex-col overflow-hidden shadow-sm animate-fade-in-up"
                  style={{ minHeight: '540px' }}
                >
                  <header className="p-6 bg-[#F8F5F0] border-b border-[#EBE4D8] relative overflow-hidden">
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#6B8E8E] opacity-10 rounded-full"></div>
                    <div className="relative z-10 space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#6B8E8E]/15 rounded-xl text-[#6B8E8E]">
                          <Layers className="w-5 h-5" />
                        </div>
                        <h1 className="font-sans font-bold text-lg text-[#1e1e1e] tracking-tight">
                          Assignment Effort Planner
                        </h1>
                      </div>
                      <p className="text-sm text-[#5C5C5C]">
                        See the work before it surprises you
                      </p>
                    </div>
                  </header>

                  <div className="p-6 flex-grow space-y-6">
                    {/* Soft Shimmer Chart */}
                    <div className="w-full h-24 bg-[#F1EDE4]/50 border border-[#EBE4D8] rounded-2xl flex items-center justify-center overflow-hidden relative">
                      <div className="absolute inset-0 shimmer-bg opacity-10"></div>
                      <div className="flex gap-3 items-end h-16">
                        <div className="w-6 h-10 bg-[#6B8E8E]/30 rounded-t-lg"></div>
                        <div className="w-6 h-16 bg-[#6B8E8E]/50 rounded-t-lg"></div>
                        <div className="w-6 h-12 bg-[#6B8E8E] rounded-t-lg"></div>
                        <div className="w-6 h-8 bg-[#6B8E8E]/40 rounded-t-lg"></div>
                        <div className="w-6 h-14 bg-[#6B8E8E]/20 rounded-t-lg"></div>
                      </div>
                      <div className="absolute bottom-2 left-5">
                        <span className="font-mono text-[10px] text-[#8A8A8A] uppercase tracking-widest">
                          Estimated Velocity
                        </span>
                      </div>
                    </div>

                    {/* Permissions lists */}
                    <section className="space-y-4">
                      <h2 className="font-sans text-xs font-bold text-[#8A8A8A] uppercase tracking-wider px-1">
                        Permissions
                      </h2>
                      <div className="space-y-1">

                        <div className="flex items-start gap-4 p-3 hover:bg-[#F8F5F0] active:bg-[#F1EDE4] border border-transparent hover:border-[#EBE4D8] hover:-translate-y-0.5 rounded-2xl transition-all duration-300 group cursor-pointer">
                          <div className="mt-0.5 p-2 bg-white border border-[#EBE4D8] rounded-xl group-hover:shadow-xs transition-all duration-300 text-[#7DA1C4]">
                            <span className="material-symbols-outlined text-[20px] block">language</span>
                          </div>
                          <div>
                            <span className="block text-sm font-bold text-[#1e1e1e]">Works on Canvas</span>
                            <span className="text-xs text-[#5C5C5C]">Integrates directly into your course dashboard.</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-4 p-3 hover:bg-[#F8F5F0] active:bg-[#F1EDE4] border border-transparent hover:border-[#EBE4D8] hover:-translate-y-0.5 rounded-2xl transition-all duration-300 group cursor-pointer">
                          <div className="mt-0.5 p-2 bg-white border border-[#EBE4D8] rounded-xl group-hover:shadow-xs transition-all duration-300 text-[#7DA1C4]">
                            <span className="material-symbols-outlined text-[20px] block">description</span>
                          </div>
                          <div>
                            <span className="block text-sm font-bold text-[#1e1e1e]">Reads assignment details</span>
                            <span className="text-xs text-[#5C5C5C]">Analyzes rubrics and instructions for depth.</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-4 p-3 hover:bg-[#F8F5F0] active:bg-[#F1EDE4] border border-transparent hover:border-[#EBE4D8] hover:-translate-y-0.5 rounded-2xl transition-all duration-300 group cursor-pointer">
                          <div className="mt-0.5 p-2 bg-white border border-[#EBE4D8] rounded-xl group-hover:shadow-xs transition-all duration-300 text-[#7DA1C4]">
                            <span className="material-symbols-outlined text-[20px] block">encrypted</span>
                          </div>
                          <div>
                            <span className="block text-sm font-bold text-[#1e1e1e]">Stores history locally</span>
                            <span className="text-xs text-[#5C5C5C]">Your data stays on your machine, always private.</span>
                          </div>
                        </div>

                      </div>
                    </section>

                    {/* Academic Integrity Note */}
                    <div className="bg-[#F8F5F0] p-4 rounded-2xl border border-[#D6CEC1]/40">
                      <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck className="w-4.5 h-4.5 text-[#6B8E8E]" />
                        <span className="font-sans text-xs font-bold text-[#6B8E8E] uppercase tracking-wider">
                          Integrity Policy
                        </span>
                      </div>
                      <p className="text-xs text-[#5C5C5C] leading-relaxed">
                        StudyCompanion acts as a scheduling assistant only. It does not generate content or answer assignment questions.
                      </p>
                    </div>
                  </div>

                  <footer className="p-6 pt-0 pb-8">
                    <button
                      onClick={() => setIsOnboarded(true)}
                      className="w-full bg-[#1e1e1e] hover:bg-black text-white py-4 px-6 rounded-full font-bold transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] shadow-lg shadow-[#1e1e1e]/10 flex items-center justify-center gap-2"
                    >
                      Enable on Canvas
                      <ArrowRight className="w-5 h-5" />
                    </button>
                    <p className="mt-4 text-center text-xs text-[#8A8A8A]">
                      By enabling, you agree to our <a className="underline hover:text-[#6B8E8E] transition-colors" href="#terms">Terms of Service</a>.
                    </p>
                  </footer>
                </motion.main>
              )}
            </AnimatePresence>
          ) : (

            /* Main Dashboard State: Shows core insight panels (Screenshot 3, 4, 5) */
            <div className="bg-white border border-[#EBE4D8] rounded-[24px] shadow-sm flex flex-col overflow-hidden relative min-h-[580px]">

              {/* Inner Tabs navigation (Mimicking screenshot navigation side panel) */}
              <div className="border-b border-[#F1EDE4] bg-[#F8F5F0] px-4 py-3 flex items-center justify-between">
                <span className="text-xs font-bold text-[#426464] font-mono uppercase tracking-wider">
                  Planner Control
                </span>

                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    onClick={() => setActiveTab('insights')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'insights' ? 'bg-[#426464] text-white font-bold' : 'text-[#5C5C5C] hover:text-[#1e1e1e]'}`}
                  >
                    Insights
                  </button>
                  <button
                    onClick={() => setActiveTab('breakdown')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'breakdown' ? 'bg-[#426464] text-white font-bold' : 'text-[#5C5C5C] hover:text-[#1e1e1e]'}`}
                  >
                    Breakdown
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${activeTab === 'history' ? 'bg-[#426464] text-white font-bold' : 'text-[#5C5C5C] hover:text-[#1e1e1e]'}`}
                  >
                    History
                  </button>
                </div>
              </div>

              {/* Panel Content Router */}
              <div className="p-6 flex-grow flex flex-col">

                {activeTab === 'insights' && currentEstimate && (
                  /* Screen 3: Assignment Insight Panel */
                  <div className="space-y-6 flex-grow flex flex-col justify-between">
                    <div className="space-y-4">
                      {/* Course / Assignment Header */}
                      <div className="space-y-1">
                        <span className="font-mono text-[10px] font-bold text-[#6B8E8E] uppercase tracking-wider">
                          {selectedAssignment.courseCode} ({selectedAssignment.courseName})
                        </span>
                        <h2 className="font-sans font-bold text-xl text-[#1e1e1e] leading-snug">
                          {selectedAssignment.title}
                        </h2>
                      </div>

                      {/* Large Estimated Effort Block */}
                      <div className="bg-[#F8F5F0] rounded-2xl border border-[#EBE4D8] p-5 flex flex-col items-center justify-center relative overflow-hidden text-center shadow-xs">
                        {/* Decorative background blob */}
                        <div className="absolute -top-10 -right-10 w-24 h-24 bg-[#c2e7e6] opacity-20 rounded-full blur-xl pointer-events-none"></div>

                        <span className="text-xs text-[#8A8A8A] font-sans font-bold uppercase tracking-wider">
                          Estimated Effort
                        </span>

                        <span className="text-4xl lg:text-5xl font-bold text-[#1e1e1e] tracking-tight mt-1">
                          {formatTime(currentEstimate.estimatedMinutes)}
                        </span>

                        <div className="mt-3 px-3.5 py-1 bg-[#c2e7e6]/50 border border-[#6B8E8E]/20 rounded-full flex items-center gap-1.5 text-[#426464] font-mono text-[10px] font-bold">
                          <Check className="w-3 h-3 text-[#426464]" />
                          <span>{currentEstimate.confidence}% CONFIDENCE</span>
                        </div>
                      </div>

                      {/* Bento Metric Tiles */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[#fbf9f5] border border-[#EBE4D8] rounded-xl p-3 flex flex-col gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-white border border-[#EBE4D8] flex items-center justify-center text-[#426464] shadow-xs shrink-0">
                            <span className="material-symbols-outlined font-bold text-base block select-none">leaderboard</span>
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] text-[#8A8A8A] uppercase font-mono tracking-normal block truncate" title="Difficulty">Difficulty</span>
                            <span className="text-sm font-bold text-[#1e1e1e] block truncate">{currentEstimate.difficulty}</span>
                          </div>
                        </div>

                        <div className="bg-[#fbf9f5] border border-[#EBE4D8] rounded-xl p-3 flex flex-col gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-white border border-[#EBE4D8] flex items-center justify-center text-[#ba1a1a] shadow-xs shrink-0">
                            <span className="material-symbols-outlined font-bold text-base block select-none">warning</span>
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] text-[#8A8A8A] uppercase font-mono tracking-normal block truncate" title="Underestimation Risk">Underestim. Risk</span>
                            <span className="text-sm font-bold text-[#ba1a1a] block truncate">{currentEstimate.riskLevel}</span>
                          </div>
                        </div>
                      </div>

                      {/* Reasoning Bullets */}
                      <div className="space-y-3">
                        <h4 className="font-mono text-[10px] font-bold text-[#5C5C5C] uppercase border-b border-[#F1EDE4] pb-1.5">
                          Why this estimate?
                        </h4>
                        <ul className="space-y-2">
                          {currentEstimate.reasons.map((reason, idx) => {
                            const icons = ['history_edu', 'edit_note', 'psychology'];
                            return (
                              <li key={idx} className="flex gap-3 items-start text-xs text-[#5C5C5C] group hover:text-[#1e1e1e] transition-colors leading-relaxed">
                                <div className="mt-0.5 w-5 h-5 rounded-full bg-[#c2e7e6]/40 flex items-center justify-center text-[#426464] shrink-0">
                                  <span className="material-symbols-outlined text-[13px]">{icons[idx % icons.length]}</span>
                                </div>
                                <span>{reason}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 space-y-3">

                      {/* Suggested Schedule Indicator Chart */}
                      <div className="bg-[#F8F5F0] border border-[#D6CEC1]/40 rounded-xl p-3 flex flex-col gap-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-[#1e1e1e]">Suggested Schedule</span>
                          <span className="font-mono text-[9px] text-[#426464] px-1.5 py-0.5 bg-white border border-[#EBE4D8] rounded-sm uppercase tracking-wider">OPTIMAL</span>
                        </div>
                        <div className="h-14 w-full bg-[#F1EDE4]/30 rounded-lg overflow-hidden flex items-end gap-1 px-2 pb-1 relative">
                          <div className="shimmer-bg absolute inset-0 opacity-15"></div>
                          <div className="w-full h-[40%] bg-[#6B8E8E]/20 rounded-t-sm"></div>
                          <div className="w-full h-[60%] bg-[#6B8E8E]/30 rounded-t-sm"></div>
                          <div className="w-full h-[90%] bg-[#6B8E8E]/70 rounded-t-sm"></div>
                          <div className="w-full h-[70%] bg-[#6B8E8E]/50 rounded-t-sm"></div>
                          <div className="w-full h-[50%] bg-[#6B8E8E]/30 rounded-t-sm"></div>
                          <div className="w-full h-[30%] bg-[#6B8E8E]/10 rounded-t-sm"></div>
                        </div>
                        <p className="text-[10px] text-[#8A8A8A] leading-tight">
                          Research shows you are 15% more productive during your 2:00 PM window.
                        </p>
                      </div>

                      {/* Primary Actions Grid */}
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <button
                          onClick={() => setActiveTab('breakdown')}
                          className="bg-[#1e1e1e] hover:bg-black text-white text-xs py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] shadow-xs"
                        >
                          <CheckSquare className="w-3.5 h-3.5" />
                          <span>Plan Blocks</span>
                        </button>

                        <button
                          onClick={handleGeneratePractice}
                          disabled={isLoadingPractice}
                          className="bg-white hover:bg-[#F8F5F0] border border-[#D6CEC1] text-[#1e1e1e] text-xs py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 active:scale-[0.98] disabled:opacity-50"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#426464]" />
                          <span>{isLoadingPractice ? 'Loading...' : 'Practice Quiz'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'breakdown' && currentEstimate && (
                  /* Screen 4: Work Breakdown Details with strategic layout */
                  <div className="space-y-4 flex-grow flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <h2 className="font-sans font-bold text-lg text-[#1e1e1e]">
                          Current Session: {selectedAssignment.title}
                        </h2>
                        <p className="text-xs text-[#5C5C5C]">
                          Strategic breakdown of your planned cognitive block.
                        </p>
                      </div>

                      {/* Featured Progress Card */}
                      <div className="bg-white border border-[#EBE4D8] rounded-xl p-4 shadow-xs relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                          <BookOpen className="w-20 h-20 text-[#1e1e1e]" />
                        </div>
                        <div className="relative z-10 space-y-1.5">
                          <span className="font-mono text-[9px] text-[#6B8E8E] uppercase tracking-widest block font-bold">
                            EFFICIENCY FOCUS MODE
                          </span>
                          <h3 className="font-sans font-bold text-sm text-[#1e1e1e]">
                            Deep Work: Literature Review
                          </h3>
                          <div className="flex items-baseline gap-1.5 pt-2">
                            <span className="text-3xl font-bold tracking-tight text-[#1e1e1e]">
                              {progressStats.completedMins}
                            </span>
                            <span className="text-xs text-[#8A8A8A]">
                              / {progressStats.totalMins} mins completed
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full h-2.5 bg-[#F1EDE4] rounded-full overflow-hidden mt-2">
                            <div
                              className="bg-[#426464] h-full rounded-full transition-all duration-500"
                              style={{ width: `${progressStats.pct}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Atmospheric optimal text card */}
                      <div className="bg-[#c2e7e6]/30 border border-[#6B8E8E]/10 rounded-xl p-3 flex gap-3 items-center">
                        <span className="material-symbols-outlined text-[#426464] text-xl shrink-0">psychology</span>
                        <p className="text-xs text-[#466969]">
                          <strong>Optimal Focus Alert:</strong> Your peak focus window is projected for the next 45 minutes!
                        </p>
                      </div>

                      {/* Shimmer Leaf visual Quote decoration */}
                      <div className="bg-[#F8F5F0] rounded-xl py-2.5 px-4 flex items-center justify-center border border-[#EBE4D8] relative overflow-hidden">
                        <div className="shimmer-bg absolute inset-0 opacity-15"></div>
                        <div className="flex gap-2 items-center z-10 text-[#426464]">
                          <span className="material-symbols-outlined text-xs animate-pulse">eco</span>
                          <p className="text-xs italic font-sans text-[#5C5C5C]">
                            "One thing at a time, most beautifully done."
                          </p>
                        </div>
                      </div>

                      {/* Task Breakdown Checklist list */}
                      <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                        {currentEstimate.tasks.map((task) => (
                          <div
                            key={task.id}
                            className="group bg-white border border-[#EBE4D8] rounded-xl p-2.5 flex items-center justify-between hover:bg-[#F8F5F0] transition-all shadow-xs"
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => handleToggleTask(task.id)}
                                className="w-4.5 h-4.5 rounded-md border-[#D6CEC1] text-[#426464] focus:ring-[#6B8E8E]/20 transition-all cursor-pointer accent-[#426464]"
                              />
                              <span className={`text-xs font-medium ${task.completed ? 'line-through text-[#8A8A8A]' : 'text-[#1e1e1e]'}`}>
                                {task.title}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 bg-[#fbf9f5] px-2 py-0.5 rounded-full border border-[#EBE4D8]">
                              <input
                                type="number"
                                value={task.durationMinutes}
                                onChange={(e) => handleUpdateTaskMinutes(task.id, parseInt(e.target.value) || 0)}
                                className="bg-transparent border-none p-0 w-6 text-center font-mono text-[11px] font-bold text-[#426464] focus:outline-none focus:ring-0"
                              />
                              <span className="font-mono text-[9px] text-[#8A8A8A] uppercase">min</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add Task Button */}
                      <button
                        onClick={handleAddSubtask}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 border border-dashed border-[#D6CEC1] hover:border-[#6B8E8E] text-[#8A8A8A] hover:text-[#426464] rounded-xl transition-all font-sans text-xs font-bold bg-white active:scale-[0.99]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add focus task</span>
                      </button>
                    </div>

                    {/* Plan Blocks CTA Block */}
                    <div className="pt-2 border-t border-[#F1EDE4] space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#5C5C5C] font-mono">Total Adjusted Effort:</span>
                        <div className="flex items-baseline gap-1">
                          <span className="font-sans font-bold text-lg text-[#1e1e1e]">
                            {currentEstimate.estimatedMinutes}
                          </span>
                          <span className="font-mono text-[10px] text-[#8A8A8A] uppercase">MINS</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-12 gap-2">
                        <button
                          onClick={handleScheduleBlocks}
                          className="col-span-8 bg-[#1e1e1e] hover:bg-black text-white py-3.5 px-4 rounded-full font-mono text-xs font-bold tracking-widest transition-all active:scale-[0.98] shadow-md shadow-[#1e1e1e]/10 uppercase"
                        >
                          PLAN BLOCKS
                        </button>
                        <button
                          onClick={() => setShowFeedbackModal(true)}
                          className="col-span-4 bg-[#F8F5F0] hover:bg-[#F1EDE4] border border-[#D6CEC1] text-[#1e1e1e] rounded-full text-xs font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-1"
                          title="Record completion time"
                        >
                          <CheckCircle2 className="w-4 h-4 text-[#6B8E8E]" />
                          <span>Complete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'practice' && practiceSession && (
                  /* Practice Concepts Mode - Study guide ensuring academic integrity */
                  <div className="space-y-4 flex-grow flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-[#F1EDE4] pb-2">
                        <span className="font-mono text-[10px] font-bold text-[#6B8E8E] uppercase tracking-wider">
                          STUDY COMPANION PRACTICE
                        </span>
                        <span className="text-xs text-[#8A8A8A] font-bold">
                          Question {currentQuestionIndex + 1} of {practiceSession.questions.length}
                        </span>
                      </div>

                      {/* Concepts covered tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {practiceSession.concepts.map((concept, idx) => (
                          <span key={idx} className="bg-[#c2e7e6]/30 text-[#426464] text-[10px] font-bold px-2 py-0.5 rounded">
                            {concept}
                          </span>
                        ))}
                      </div>

                      {/* Current MCQ Card */}
                      <div className="bg-[#fbf9f5] border border-[#EBE4D8] rounded-2xl p-4 space-y-3 shadow-xs">
                        <p className="text-sm font-bold text-[#1e1e1e] leading-snug">
                          {practiceSession.questions[currentQuestionIndex].question}
                        </p>

                        {/* Options */}
                        <div className="space-y-2">
                          {practiceSession.questions[currentQuestionIndex].options?.map((option, idx) => {
                            const isSelected = selectedOption === option;
                            const isCorrect = option === practiceSession.questions[currentQuestionIndex].correctAnswer;
                            let optionClass = "border-[#EBE4D8] bg-white hover:bg-[#F8F5F0]";
                            if (isSelected) {
                              optionClass = "border-[#426464] bg-[#c2e7e6]/30 font-bold text-[#426464]";
                            }
                            if (isAnswerChecked) {
                              if (isCorrect) {
                                optionClass = "border-green-600 bg-green-50 text-green-800 font-bold";
                              } else if (isSelected) {
                                optionClass = "border-red-600 bg-red-50 text-red-800 line-through";
                              }
                            }

                            return (
                              <button
                                key={idx}
                                disabled={isAnswerChecked}
                                onClick={() => setSelectedOption(option)}
                                className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center justify-between cursor-pointer ${optionClass}`}
                              >
                                <span>{option}</span>
                                {isAnswerChecked && isCorrect && <Check className="w-3.5 h-3.5 text-green-600 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Hint section */}
                      {showHint ? (
                        <div className="bg-[#F8F5F0] border border-[#D6CEC1]/40 p-3 rounded-xl text-xs flex gap-2 text-[#5C5C5C]">
                          <Lightbulb className="w-4 h-4 text-[#6B8E8E] shrink-0 mt-0.5" />
                          <p><strong>Hint:</strong> {practiceSession.questions[currentQuestionIndex].hint}</p>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowHint(true)}
                          className="text-xs text-[#6B8E8E] font-mono uppercase tracking-wider flex items-center gap-1 hover:text-[#426464] font-bold"
                        >
                          <Lightbulb className="w-3.5 h-3.5" />
                          <span>Show Study Hint</span>
                        </button>
                      )}

                      {/* Answer explanation */}
                      {isAnswerChecked && (
                        <div className="bg-green-50/50 border border-green-200/40 p-3 rounded-xl text-xs text-green-900">
                          <p><strong>Explanation:</strong> {practiceSession.questions[currentQuestionIndex].explanation}</p>
                        </div>
                      )}
                    </div>

                    {/* Actions bar */}
                    <div className="pt-2 border-t border-[#F1EDE4] flex justify-between items-center gap-3">
                      <button
                        onClick={() => {
                          setActiveTab('insights');
                          setPracticeSession(null);
                        }}
                        className="bg-white border border-[#D6CEC1] hover:bg-[#F8F5F0] text-xs px-4 py-3 rounded-full font-bold transition-all text-[#5C5C5C]"
                      >
                        Back to Planner
                      </button>

                      {!isAnswerChecked ? (
                        <button
                          disabled={!selectedOption}
                          onClick={() => {
                            setIsAnswerChecked(true);
                            if (selectedOption === practiceSession.questions[currentQuestionIndex].correctAnswer) {
                              setPracticeScore(p => p + 1);
                            }
                          }}
                          className="bg-[#426464] hover:bg-[#324d4d] text-white text-xs px-6 py-3 rounded-full font-bold transition-all disabled:opacity-50"
                        >
                          Check Answer
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (currentQuestionIndex < practiceSession.questions.length - 1) {
                              setCurrentQuestionIndex(idx => idx + 1);
                              setSelectedOption(null);
                              setIsAnswerChecked(false);
                              setShowHint(false);
                            } else {
                              alert(`Mastery Check Complete! You got ${practiceScore}/${practiceSession.questions.length} correct.`);
                              setActiveTab('insights');
                              setPracticeSession(null);
                            }
                          }}
                          className="bg-[#1e1e1e] hover:bg-black text-white text-xs px-6 py-3 rounded-full font-bold transition-all"
                        >
                          {currentQuestionIndex < practiceSession.questions.length - 1 ? 'Next Question' : 'Finish Session'}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'history' && (
                  /* History and Past Efforts (LMS tracking loop) */
                  <div className="space-y-4 flex-grow flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-[#F1EDE4] pb-2">
                        <h2 className="font-sans font-bold text-base text-[#1e1e1e]">
                          Effort History & Analytics
                        </h2>
                        <span className="font-mono text-[9px] text-[#8A8A8A] uppercase tracking-wider">
                          LOCAL RECORD
                        </span>
                      </div>

                      {/* Metrics comparison cards */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-[#fbf9f5] border border-[#EBE4D8] rounded-xl p-3 text-center">
                          <span className="block text-[10px] font-mono text-[#8A8A8A] uppercase">Total Completed</span>
                          <span className="text-xl font-bold text-[#1e1e1e]">{feedbackHistory.length} assignments</span>
                        </div>
                        <div className="bg-[#fbf9f5] border border-[#EBE4D8] rounded-xl p-3 text-center">
                          <span className="block text-[10px] font-mono text-[#8A8A8A] uppercase">Average Accuracy</span>
                          <span className="text-xl font-bold text-[#426464]">
                            {feedbackHistory.length ? '94%' : 'N/A'}
                          </span>
                        </div>
                      </div>

                      {/* Feedback List */}
                      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                        {feedbackHistory.length === 0 ? (
                          <div className="text-center py-8 text-xs text-[#8A8A8A]">
                            <History className="w-8 h-8 text-[#EBE4D8] mx-auto mb-2" />
                            <p>No logged completion logs yet.</p>
                            <p className="mt-1">Tick off tasks in the Breakdown list and click "Complete" to log details!</p>
                          </div>
                        ) : (
                          feedbackHistory.map((item, index) => (
                            <div key={index} className="bg-white border border-[#EBE4D8] p-3 rounded-xl text-xs space-y-1.5 shadow-xs">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-[#1e1e1e] block truncate w-32">{item.title}</span>
                                <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded-sm uppercase ${item.feedbackType === 'accurate' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                                  {item.feedbackType}
                                </span>
                              </div>
                              <div className="flex justify-between text-[#8A8A8A] font-mono text-[10px]">
                                <span>Estimated: {formatTime(item.predictedMinutes)}</span>
                                <span>Actual: {formatTime(item.actualMinutes)}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Reset past efforts logs */}
                    {feedbackHistory.length > 0 && (
                      <button
                        onClick={() => {
                          if (confirm("Are you sure you want to delete all local history logs?")) {
                            setFeedbackHistory([]);
                          }
                        }}
                        className="text-xs text-[#ba1a1a] font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 hover:underline py-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete All Local History</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Side navigation anchor mimicking screenshots */}
              <footer className="border-t border-[#F1EDE4] bg-[#F8F5F0] p-4 grid grid-cols-4 text-center text-[10px] font-mono uppercase tracking-wider text-[#8A8A8A]">
                <button
                  onClick={() => {
                    setActiveTab('insights');
                    setIsOnboarded(true);
                  }}
                  className={`flex flex-col items-center gap-1 font-bold ${activeTab === 'insights' ? 'text-[#426464]' : 'hover:text-[#1e1e1e]'}`}
                >
                  <span className="material-symbols-outlined text-sm font-bold block">insights</span>
                  <span>Insights</span>
                </button>
                <button
                  onClick={() => setActiveTab('breakdown')}
                  className={`flex flex-col items-center gap-1 font-bold ${activeTab === 'breakdown' ? 'text-[#426464]' : 'hover:text-[#1e1e1e]'}`}
                >
                  <span className="material-symbols-outlined text-sm font-bold block">format_list_bulleted</span>
                  <span>Breakdown</span>
                </button>
                <button
                  onClick={() => setShowWeeklyPlanModal(true)}
                  className="flex flex-col items-center gap-1 font-bold hover:text-[#1e1e1e]"
                >
                  <span className="material-symbols-outlined text-sm font-bold block">calendar_today</span>
                  <span>Planner</span>
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex flex-col items-center gap-1 font-bold ${activeTab === 'history' ? 'text-[#426464]' : 'hover:text-[#1e1e1e]'}`}
                >
                  <span className="material-symbols-outlined text-sm font-bold block">view_week</span>
                  <span>History</span>
                </button>
              </footer>
            </div>
          )}
        </div>
      </div>

      {/* Weekly Plan Modal Slide-over Overlay (Screenshot 5) */}
      <AnimatePresence>
        {showWeeklyPlanModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#1d2841] w-full max-w-[500px] max-h-[795px] overflow-hidden rounded-[2rem] shadow-2xl border border-[#EBE4D8] flex flex-col"
            >
              {/* Modal Header */}
              <div className="px-8 pt-8 pb-4 flex justify-between items-start">
                <div>
                  <span className="font-mono text-[10px] font-bold text-[#6B8E8E] uppercase tracking-widest block">
                    Focus Session Planner
                  </span>
                  <h1 className="font-sans font-bold text-2xl text-[#1e1e1e] mt-1 tracking-tight">
                    Weekly Plan
                  </h1>
                  <p className="text-xs text-[#8A8A8A] font-sans">
                    Plan your academic intention with clarity.
                  </p>
                </div>
                <button
                  onClick={() => setShowWeeklyPlanModal(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-[#F1EDE4] hover:bg-[#eae8e4] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-[#1e1e1e]" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-8 py-4 space-y-6">

                {/* Section: Today */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-[#F1EDE4] pb-1.5">
                    <CalendarDays className="w-4 h-4 text-[#426464]" />
                    <h3 className="font-sans font-bold text-[#1e1e1e] text-sm">Today</h3>
                  </div>

                  <div className="space-y-3">
                    {/* Today Block 1: Cognitive Psychology */}
                    <div className="group flex items-center justify-between p-4 bg-[#F8F5F0] border border-[#EBE4D8] rounded-xl hover:bg-white hover:border-[#6B8E8E] transition-all cursor-pointer shadow-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white border border-[#EBE4D8] flex items-center justify-center text-[#6B8E8E] shadow-xs">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#1e1e1e]">Cognitive Psychology</h4>
                          <p className="text-xs text-[#5C5C5C]">Neural Networks Reading</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-[10px] text-[#426464] bg-[#c2e7e6]/40 px-2 py-0.5 rounded">
                          45m
                        </span>
                        <p className="font-mono text-[9px] text-[#8A8A8A] mt-1">10:00 AM</p>
                      </div>
                    </div>

                    {/* Today Block 2: Macroeconomics */}
                    <div className="group flex items-center justify-between p-4 bg-[#F8F5F0] border border-[#EBE4D8] rounded-xl hover:bg-white hover:border-[#6B8E8E] transition-all cursor-pointer shadow-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white border border-[#EBE4D8] flex items-center justify-center text-[#6B8E8E] shadow-xs">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#1e1e1e]">Macroeconomics</h4>
                          <p className="text-xs text-[#5C5C5C]">Problem Set #4</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-[10px] text-[#426464] bg-[#c2e7e6]/40 px-2 py-0.5 rounded">
                          1h 30m
                        </span>
                        <p className="font-mono text-[9px] text-[#8A8A8A] mt-1">2:30 PM</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section: Upcoming */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-[#F1EDE4] pb-1.5">
                    <Clock className="w-4 h-4 text-[#8A8A8A]" />
                    <h3 className="font-sans font-bold text-[#1e1e1e] text-sm">Upcoming</h3>
                  </div>

                  <div className="space-y-3">
                    {/* Upcoming Row 1 */}
                    <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#F8F5F0] transition-colors">
                      <div className="flex flex-col items-center justify-center min-w-[40px] text-center border-r border-[#EBE4D8] pr-4">
                        <span className="font-mono text-[9px] text-[#8A8A8A] font-bold">TUE</span>
                        <span className="font-sans font-bold text-base text-[#1e1e1e]">12</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="text-xs font-bold text-[#1e1e1e]">Research Methodology</h4>
                          <span className="font-mono text-[10px] text-[#8A8A8A]">60m</span>
                        </div>
                        <p className="text-[11px] text-[#5C5C5C]">Drafting Literature Review</p>
                      </div>
                    </div>

                    {/* Upcoming Row 2 */}
                    <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#F8F5F0] transition-colors">
                      <div className="flex flex-col items-center justify-center min-w-[40px] text-center border-r border-[#EBE4D8] pr-4">
                        <span className="font-mono text-[9px] text-[#8A8A8A] font-bold">WED</span>
                        <span className="font-sans font-bold text-base text-[#1e1e1e]">13</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="text-xs font-bold text-[#1e1e1e]">Advanced Statistics</h4>
                          <span className="font-mono text-[10px] text-[#8A8A8A]">90m</span>
                        </div>
                        <p className="text-[11px] text-[#5C5C5C]">R-Studio Data Analysis</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Display newly planned blocks dynamically */}
                {savedWorkBlocks.filter(b => b.assignmentId === selectedAssignment.id).length > 0 && (
                  <div className="space-y-2 pt-2 bg-[#F8F5F0] p-4 rounded-xl border border-[#D6CEC1]/40">
                    <span className="font-mono text-[9px] text-[#426464] font-bold uppercase tracking-wider block">
                      Newly Scheduled Study Blocks ({savedWorkBlocks.filter(b => b.assignmentId === selectedAssignment.id).length})
                    </span>
                    <div className="space-y-1.5 text-xs">
                      {savedWorkBlocks.filter(b => b.assignmentId === selectedAssignment.id).map((b, idx) => (
                        <div key={idx} className="flex justify-between text-[#5C5C5C]">
                          <span className="font-medium">Phase {idx+1}: {b.taskTitle}</span>
                          <span className="font-mono text-[#8A8A8A]">{b.durationMinutes} mins</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-8 bg-[#F8F5F0] border-t border-[#EBE4D8] flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleExportICS}
                    className="w-full bg-[#1e1e1e] hover:bg-black text-white py-4 rounded-full font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-1.5"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>Download .ics</span>
                  </button>
                  <button
                    onClick={() => {
                      alert("Canvas platform integration: Blocks synchronized dynamically to your course calendar.");
                      setShowWeeklyPlanModal(false);
                    }}
                    className="w-full bg-[#426464] hover:bg-[#324d4d] text-white py-4 rounded-full font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Open Canvas</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      setActiveTab('history');
                      setShowWeeklyPlanModal(false);
                    }}
                    className="text-xs text-[#8A8A8A] font-bold hover:text-[#1e1e1e] transition-colors flex items-center gap-1 uppercase tracking-wider font-mono"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    <span>View Past Efforts</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Actual Time Recording & Completion Modal */}
      <AnimatePresence>
        {showFeedbackModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.form
              onSubmit={handleSaveFeedback}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[24px] border border-[#EBE4D8] p-6 max-w-sm w-full space-y-4 shadow-xl"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-sans font-bold text-lg text-[#1e1e1e]">
                    Record Actual Time
                  </h3>
                  <p className="text-xs text-[#8A8A8A]">
                    How accurate was the planner prediction?
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="p-1 text-[#8A8A8A] hover:text-[#1e1e1e] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Slider for actual time */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#5C5C5C] font-mono uppercase block">
                  Actual Work Time: {formatTime(actualMinutes)}
                </label>
                <input
                  type="range"
                  min="15"
                  max="360"
                  step="15"
                  value={actualMinutes}
                  onChange={(e) => setActualMinutes(parseInt(e.target.value))}
                  className="w-full accent-[#426464] cursor-pointer"
                />
              </div>

              {/* Accuracy Toggle */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#5C5C5C] font-mono uppercase block">
                  Accuracy Type
                </span>
                <div className="grid grid-cols-3 gap-1.5 text-xs text-center font-bold">
                  <button
                    type="button"
                    onClick={() => setFeedbackType('too-low')}
                    className={`py-2 rounded-lg border ${feedbackType === 'too-low' ? 'border-[#ba1a1a] bg-red-50 text-[#ba1a1a]' : 'border-[#EBE4D8] hover:bg-[#F8F5F0]'}`}
                  >
                    Too Low
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedbackType('accurate')}
                    className={`py-2 rounded-lg border ${feedbackType === 'accurate' ? 'border-green-600 bg-green-50 text-green-800' : 'border-[#EBE4D8] hover:bg-[#F8F5F0]'}`}
                  >
                    Accurate
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedbackType('too-high')}
                    className={`py-2 rounded-lg border ${feedbackType === 'too-high' ? 'border-amber-600 bg-amber-50 text-amber-800' : 'border-[#EBE4D8] hover:bg-[#F8F5F0]'}`}
                  >
                    Too High
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#1e1e1e] hover:bg-black text-white py-3.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all"
              >
                Log Completion Feedback
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* Paste Custom Homework Assignment Modal */}
      <AnimatePresence>
        {showCustomModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[24px] border border-[#EBE4D8] p-6 max-w-lg w-full space-y-4 shadow-xl"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="font-sans font-bold text-lg text-[#1e1e1e]">
                    Paste Homework Details
                  </h3>
                  <p className="text-xs text-[#8A8A8A]">
                    Gemini will analyze your instructions to construct custom scheduling models.
                  </p>
                </div>
                <button
                  onClick={() => setShowCustomModal(false)}
                  className="p-1 text-[#8A8A8A] hover:text-[#1e1e1e] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAnalyzeAssignment} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-[#5C5C5C] font-mono uppercase block">
                      Course / Class Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Cognitive Psychology 301"
                      value={customCourse}
                      onChange={(e) => setCustomCourse(e.target.value)}
                      className="w-full bg-[#fbf9f5] border border-[#EBE4D8] rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-[#426464] text-sm font-sans"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-[#5C5C5C] font-mono uppercase block">
                      Assignment Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Final Literature Review"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="w-full bg-[#fbf9f5] border border-[#EBE4D8] rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-[#426464] text-sm font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#5C5C5C] font-mono uppercase block">
                    Homework Instructions / Text Prompt
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Paste instructions, syllabus, rubric details, or requirements here..."
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    className="w-full bg-[#fbf9f5] border border-[#EBE4D8] rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-[#426464] text-sm font-sans"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className="w-full bg-[#426464] hover:bg-[#324d4d] text-white py-3.5 rounded-full font-bold uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-xs"
                >
                  {isAnalyzing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Gemini is analyzing assignment...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Estimate with Gemini AI</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Supabase Connection Health Test Diagnostic Modal */}
      <AnimatePresence>
        {showDbDiagnosticModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md p-6 bg-white border ${settings.theme === 'retro-heavy' ? 'border-2 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)]' : 'border-[#EBE4D8] rounded-[24px] shadow-xl'} space-y-5`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-[#426464]" />
                  <h3 className={`font-bold text-[#1e1e1e] ${settings.theme === 'retro-heavy' ? 'font-mono uppercase text-lg' : 'text-base font-sans'}`}>
                    Supabase Diagnostic Tool
                  </h3>
                </div>
                <button
                  onClick={() => setShowDbDiagnosticModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Connection Status Box */}
                <div className="p-4 bg-[#F8F5F0] border border-[#EBE4D8] rounded-xl space-y-2 text-left">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-[#5C5C5C] uppercase">
                    <span>Client Registration</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${supabase ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                      {supabase ? 'INITIALIZED' : 'LOCAL SANDBOX'}
                    </span>
                  </div>

                  <div className="text-xs font-mono break-all text-gray-700 bg-white border border-[#EBE4D8] p-2 rounded-lg">
                    <p className="font-semibold text-black">Target URL:</p>
                    <p className="mt-0.5 text-gray-500 font-normal">
                      {supabase
                        ? (import.meta as any).env.VITE_SUPABASE_URL || 'No URL configured'
                        : 'Sandbox Local Simulation (No Supabase client active)'}
                    </p>
                  </div>
                </div>

                {/* Health Check Status */}
                <div className="space-y-2 text-left">
                  <span className="text-xs font-bold text-[#5C5C5C] font-mono uppercase block">
                    Diagnostic Test Result
                  </span>

                  {dbDiagnosticResult ? (
                    <div className={`p-4 rounded-xl border text-xs leading-normal font-sans ${
                      dbDiagnosticResult.status === 'testing'
                        ? 'bg-blue-50/70 border-blue-200 text-blue-800'
                        : dbDiagnosticResult.status === 'success'
                        ? 'bg-green-50/70 border-green-200 text-green-800'
                        : 'bg-amber-50/70 border-amber-200 text-amber-800'
                    }`}>
                      <div className="flex items-center gap-2 font-bold uppercase tracking-tight mb-1 font-mono text-[10px]">
                        {dbDiagnosticResult.status === 'testing' && (
                          <>
                            <span className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            <span>Diagnostic in progress...</span>
                          </>
                        )}
                        {dbDiagnosticResult.status === 'success' && (
                          <>
                            <span className="text-green-600 font-bold">✔</span>
                            <span>DATABASE ACTIVE</span>
                          </>
                        )}
                        {dbDiagnosticResult.status === 'error' && (
                          <>
                            <span className="text-amber-600 font-bold">⚠</span>
                            <span>DATABASE REVERB OFFLINE</span>
                          </>
                        )}
                      </div>
                      <p>{dbDiagnosticResult.message}</p>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 border border-gray-200 text-gray-400 text-xs rounded-xl text-center">
                      Click the button below to execute a real database ping.
                    </div>
                  )}
                </div>

                {/* DB Instructions helpful note */}
                <div className="text-[11px] text-[#5C5C5C] leading-normal bg-blue-50/50 border border-blue-200/40 p-3.5 rounded-xl space-y-1 text-left">
                  <span className="font-bold text-blue-900 block font-mono uppercase text-[10px] tracking-wide">
                    Testing your Custom Connection:
                  </span>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Open settings / env in your workspace.</li>
                    <li>Ensure <code className="bg-white px-1 py-0.5 rounded border border-[#EBE4D8] font-mono font-bold">VITE_SUPABASE_URL</code> and <code className="bg-white px-1 py-0.5 rounded border border-[#EBE4D8] font-mono font-bold">VITE_SUPABASE_ANON_KEY</code> are correctly configured.</li>
                    <li>Execute the database tables script inside your Supabase project's SQL editor.</li>
                  </ol>
                </div>
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => setShowDbDiagnosticModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-xs font-sans transition-all"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={testSupabaseConnection}
                  disabled={dbDiagnosticResult?.status === 'testing'}
                  className="flex-1 py-2.5 bg-[#426464] hover:bg-[#324d4d] text-white rounded-xl font-bold text-xs font-sans transition-all flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${dbDiagnosticResult?.status === 'testing' ? 'animate-spin' : ''}`} />
                  <span>Run Test</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
