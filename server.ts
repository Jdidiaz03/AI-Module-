import express from "express";
import type { NextFunction, Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json({ limit: "32kb" }));

const PORT = 3000;
const API_RATE_LIMIT_WINDOW_MS = Number(process.env.API_RATE_LIMIT_WINDOW_MS || 60_000);
const API_RATE_LIMIT_MAX_REQUESTS = Number(process.env.API_RATE_LIMIT_MAX_REQUESTS || 30);

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const apiRateLimitBuckets = new Map<string, RateLimitBucket>();

function isConfiguredEnvValue(value: string | undefined, placeholder: string) {
  return Boolean(value && value !== placeholder && value.trim() !== "");
}

function getClientIp(req: Request) {
  const forwardedFor = req.header("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return req.socket.remoteAddress || "unknown";
}

function enforceSameOrigin(req: Request, res: Response, next: NextFunction) {
  const origin = req.header("origin");
  if (!origin) {
    return next();
  }

  const host = req.header("host");
  const allowedOrigins = new Set<string>();
  if (host) {
    allowedOrigins.add(`http://${host}`);
    allowedOrigins.add(`https://${host}`);
  }

  if (process.env.APP_URL) {
    try {
      allowedOrigins.add(new URL(process.env.APP_URL).origin);
    } catch {
      console.warn("APP_URL is not a valid URL; same-origin API guard will ignore it.");
    }
  }

  if (!allowedOrigins.has(origin)) {
    return res.status(403).json({ error: "Cross-origin API requests are not allowed." });
  }

  next();
}

function rateLimitApi(req: Request, res: Response, next: NextFunction) {
  const now = Date.now();
  const key = getClientIp(req);
  const bucket = apiRateLimitBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    apiRateLimitBuckets.set(key, {
      count: 1,
      resetAt: now + API_RATE_LIMIT_WINDOW_MS
    });
    return next();
  }

  bucket.count += 1;
  if (bucket.count > API_RATE_LIMIT_MAX_REQUESTS) {
    const retryAfterSeconds = Math.ceil((bucket.resetAt - now) / 1000);
    res.setHeader("Retry-After", String(retryAfterSeconds));
    return res.status(429).json({ error: "Too many requests. Please try again shortly." });
  }

  next();
}

app.use("/api", enforceSameOrigin, rateLimitApi);

// Initialize GoogleGenAI client lazily or with check to prevent crashes if key is missing
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseAuth = isConfiguredEnvValue(supabaseUrl, "YOUR_SUPABASE_URL_HERE")
  && isConfiguredEnvValue(supabaseAnonKey, "YOUR_SUPABASE_ANON_KEY_HERE")
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY" && apiKey.trim() !== "") {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("GoogleGenAI initialized successfully with API key.");
  } catch (error) {
    console.error("Failed to initialize GoogleGenAI:", error);
  }
} else {
  console.log("No GEMINI_API_KEY detected. Running in heuristic simulation mode.");
}

async function hasVerifiedSupabaseSession(req: Request) {
  if (!supabaseAuth) {
    return false;
  }

  const authHeader = req.header("authorization") || "";
  const tokenMatch = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!tokenMatch) {
    return false;
  }

  const { data, error } = await supabaseAuth.auth.getUser(tokenMatch[1]);
  return !error && Boolean(data.user);
}

function getAiFallbackMessage(kind: "Estimate" | "Practice guide") {
  if (!ai) {
    return `${kind} generated locally (Running in sandbox demo mode)`;
  }
  return `${kind} generated locally because Gemini requests require a signed-in Supabase session.`;
}

// Custom heuristic generator for fallback when API key is missing
function generateHeuristicEstimate(title: string, courseName: string, instructions: string) {
  const combined = `${title} ${courseName} ${instructions}`.toLowerCase();

  let baseMinutes = 60;
  let difficulty: 'Low' | 'Medium' | 'Med-High' | 'High' = 'Medium';
  let riskLevel: 'Low' | 'Medium' | 'High' = 'Medium';
  const reasons: string[] = [];

  if (combined.includes("review") || combined.includes("literature") || combined.includes("thesis")) {
    baseMinutes = 135; // 2h 15m
    difficulty = 'Med-High';
    riskLevel = 'High';
    reasons.push("Requires synthesis of multiple academic sources.");
    reasons.push("Complex conceptual mapping with high cognitive load.");
    reasons.push("Requires precise academic formatting constraints.");
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
  } else if (combined.includes("read") || combined.includes("prompt")) {
    baseMinutes = 45;
    difficulty = 'Low';
    riskLevel = 'Low';
    reasons.push("Mainly focused on reading retention and basic prompt comprehension.");
    reasons.push("Low-stakes reflective activity.");
  } else {
    // Standard default
    baseMinutes = 120;
    difficulty = 'Medium';
    riskLevel = 'Medium';
    reasons.push("General research and writing tasks detected.");
    reasons.push("Requires structuring and peer review prep.");
  }

  // Create tasks
  const tasks = [
    {
      id: "task-1",
      title: "Read instructions and plan outline",
      durationMinutes: Math.round(baseMinutes * 0.15),
      completed: false,
      category: 'reading' as const
    },
    {
      id: "task-2",
      title: "Gather resources and review materials",
      durationMinutes: Math.round(baseMinutes * 0.25),
      completed: false,
      category: 'research' as const
    },
    {
      id: "task-3",
      title: "Draft core assignment response",
      durationMinutes: Math.round(baseMinutes * 0.45),
      completed: false,
      category: 'drafting' as const
    },
    {
      id: "task-4",
      title: "Review checklist, edit, and submit",
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

// 1. API Route: Estimate Effort for an Assignment
app.post("/api/estimate", async (req, res) => {
  const { title, courseName, instructions, rubricText } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Assignment title is required" });
  }

  // Fallback to simulation if AI is unavailable or the request is not tied to
  // a verified Supabase session. This prevents the server key from becoming
  // an open public Gemini proxy.
  if (!ai || !(await hasVerifiedSupabaseSession(req))) {
    const simulation = generateHeuristicEstimate(title, courseName || "", instructions || "");
    return res.json({
      ...simulation,
      isSimulation: true,
      message: getAiFallbackMessage("Estimate")
    });
  }

  try {
    const prompt = `
      You are an expert academic scheduling assistant. Analyze this assignment and estimate the total study/work effort required in minutes.

      Assignment Details:
      - Title: ${title}
      - Course Name: ${courseName || "Unknown Course"}
      - Instructions: ${instructions || "None provided"}
      - Rubric: ${rubricText || "None provided"}

      Your output must be a JSON object with:
      1. estimatedMinutes (integer) - Realistic time needed to complete from scratch.
      2. difficulty (string) - Must be either: 'Low', 'Medium', 'Med-High', 'High'.
      3. riskLevel (string) - Underestimation risk level: 'Low', 'Medium', 'High'.
      4. confidence (integer) - Confidence score out of 100 based on detail provided.
      5. reasons (array of strings) - 2-3 bullet points explaining why it takes this long.
      6. tasks (array of objects) - Breakdown of tasks. Each task has:
         - title (string): short action (e.g. 'Read prompt carefully', 'Draft outline')
         - durationMinutes (integer)
         - category (string): 'reading', 'research', 'drafting', 'review', 'problem-solving', 'other'
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["estimatedMinutes", "difficulty", "riskLevel", "confidence", "reasons", "tasks"],
          properties: {
            estimatedMinutes: {
              type: Type.INTEGER,
              description: "Estimated total duration to complete the assignment in minutes."
            },
            difficulty: {
              type: Type.STRING,
              description: "Difficulty assessment. Low, Medium, Med-High, or High."
            },
            riskLevel: {
              type: Type.STRING,
              description: "The level of risk of underestimating the time needed."
            },
            confidence: {
              type: Type.INTEGER,
              description: "Confidence percentage in this estimate."
            },
            reasons: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2 to 3 reasons explaining why this assignment takes this long or why the difficulty is rated as such."
            },
            tasks: {
              type: Type.ARRAY,
              description: "Subtask breakdown of work stages.",
              items: {
                type: Type.OBJECT,
                required: ["title", "durationMinutes", "category"],
                properties: {
                  title: { type: Type.STRING, description: "Action statement for this work phase." },
                  durationMinutes: { type: Type.INTEGER, description: "Time estimated for this step in minutes." },
                  category: {
                    type: Type.STRING,
                    description: "Category of work: reading, research, drafting, review, problem-solving, other"
                  }
                }
              }
            }
          }
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    // Inject IDs on the server
    if (parsedData.tasks && Array.isArray(parsedData.tasks)) {
      parsedData.tasks = parsedData.tasks.map((task: any, index: number) => ({
        ...task,
        id: `task-${index + 1}`,
        completed: false
      }));
    }

    res.json({
      ...parsedData,
      isSimulation: false
    });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    // If anything fails, fallback gracefully to heuristics
    const simulation = generateHeuristicEstimate(title, courseName || "", instructions || "");
    res.json({
      ...simulation,
      isSimulation: true,
      error: error.message,
      message: "Fallback to local estimation due to service limitation"
    });
  }
});

// 2. API Route: Generate Practice Questions (Study Companion / Concepts Check)
app.post("/api/practice", async (req, res) => {
  const { title, courseName, instructions } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Assignment title is required" });
  }

  const fallbackQuestions = [
    {
      id: "q-1",
      question: `What is the primary objective of a ${title || "this assignment"} analysis?`,
      options: [
        "To summarize without analyzing critical flaws.",
        "To synthesize findings and critique methodology.",
        "To write a personal reflection with no source citations.",
        "To copy summaries directly from online databases."
      ],
      correctAnswer: "To synthesize findings and critique methodology.",
      explanation: "A rigorous scholarly literature review or thesis analysis is designed to find relationships between diverse research articles and point out methodological gaps, not just summarize.",
      hint: "Recall the key distinction between a simple book report and a synthesize-and-critique review."
    },
    {
      id: "q-2",
      question: "Which academic formatting is typically required for professional literature reviews in psychology?",
      options: [
        "MLA Handbook 9th Edition",
        "Chicago Manual of Style (Notes & Bibliography)",
        "APA 7th Edition style guide",
        "IEEE Transactions format"
      ],
      correctAnswer: "APA 7th Edition style guide",
      explanation: "The American Psychological Association (APA) 7th Edition regulates formatting, headings, parenthetical in-text citations, and referencing style for scientific writing in behavioral and social sciences.",
      hint: "Look for the acronym commonly associated with psychological and sociological publications."
    }
  ];

  if (!ai || !(await hasVerifiedSupabaseSession(req))) {
    return res.json({
      assignmentId: req.body.assignmentId || "assignment-demo",
      concepts: ["Critical Research Synthesis", "APA 7th formatting", "Methodological critique"],
      questions: fallbackQuestions,
      isSimulation: true,
      message: getAiFallbackMessage("Practice guide")
    });
  }

  try {
    const prompt = `
      Create a study companion concept checker for this assignment.
      CRITICAL ACADEMIC INTEGRITY DIRECTIVE:
      - StudyCompanion acts as a scheduling assistant and study companion only.
      - Do NOT generate content or answers to the actual assignment itself.
      - Instead, create 2 multiple-choice questions checking the theoretical concepts behind the assignment, so students can practice or clarify concepts.

      Assignment Info:
      - Title: ${title}
      - Course Name: ${courseName || "Unknown"}
      - Context / Instructions: ${instructions || "None"}

      Your response must be JSON containing:
      1. concepts (array of strings) - 2 to 3 core concepts required to succeed.
      2. questions (array of objects) - exactly 2 multiple choice practice questions. Each question needs:
         - id (string, unique)
         - question (string)
         - options (array of exactly 4 strings)
         - correctAnswer (string, matching one of the options)
         - explanation (string)
         - hint (string)
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["concepts", "questions"],
          properties: {
            concepts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Main learning concepts related to the assignment topic."
            },
            questions: {
              type: Type.ARRAY,
              description: "MCQs to verify concept mastery.",
              items: {
                type: Type.OBJECT,
                required: ["id", "question", "options", "correctAnswer", "explanation", "hint"],
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Exactly 4 options."
                  },
                  correctAnswer: { type: Type.STRING, description: "The string representing the correct option." },
                  explanation: { type: Type.STRING, description: "Detailed explanation of why this answer is correct." },
                  hint: { type: Type.STRING, description: "A helpful guidance cue." }
                }
              }
            }
          }
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({
      assignmentId: req.body.assignmentId || "assignment-demo",
      concepts: parsed.concepts || ["Conceptual analysis"],
      questions: parsed.questions || fallbackQuestions,
      isSimulation: false
    });
  } catch (error: any) {
    console.error("Practice generation error:", error);
    res.json({
      assignmentId: req.body.assignmentId || "assignment-demo",
      concepts: ["Critical Research Synthesis", "APA 7th formatting", "Methodological critique"],
      questions: fallbackQuestions,
      isSimulation: true,
      error: error.message
    });
  }
});

// Serve frontend assets using Vite middleware or static server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Serving compiled static files from dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express full-stack server running on http://localhost:${PORT}`);
  });
}

startServer();
