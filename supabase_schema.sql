-- ============================================================================
-- Supabase Database Schema: Academic Effort Planner
-- Target Database: PostgreSQL (Supabase Compatible)
-- Includes: Users, Assignments, Effort Estimates, Study Blocks, Practice Sessions, Feedback, and App Settings.
-- Includes: Row Level Security (RLS) policies for direct client-safe integration.
-- ============================================================================

-- Enable UUID extension if not already active
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. USERS TABLE
-- ----------------------------------------------------------------------------
-- Standard users table. If integrating with native Supabase Auth, you can
-- link your user metadata automatically using triggers, or use this table directly.
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ----------------------------------------------------------------------------
-- 2. APP SETTINGS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.app_settings (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    lms_enabled TEXT NOT NULL DEFAULT 'canvas' CHECK (lms_enabled IN ('canvas', 'blackboard')),
    theme TEXT NOT NULL DEFAULT 'soft-minimalist' CHECK (theme IN ('retro-heavy', 'soft-minimalist')),
    privacy_mode BOOLEAN NOT NULL DEFAULT TRUE,
    history_retention_days INTEGER NOT NULL DEFAULT 30,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ----------------------------------------------------------------------------
-- 3. ASSIGNMENTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_name TEXT NOT NULL,
    course_code TEXT NOT NULL,
    title TEXT NOT NULL,
    due_at TIMESTAMP WITH TIME ZONE NOT NULL,
    points INTEGER DEFAULT 100,
    instructions TEXT NOT NULL,
    rubric_text TEXT,
    submission_type TEXT NOT NULL,
    url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ----------------------------------------------------------------------------
-- 4. EFFORT ESTIMATES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.effort_estimates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID UNIQUE REFERENCES public.assignments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    estimated_minutes INTEGER NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Low', 'Medium', 'Med-High', 'High')),
    risk_level TEXT NOT NULL CHECK (risk_level IN ('Low', 'Medium', 'High')),
    confidence INTEGER NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
    reasons TEXT[] NOT NULL, -- Stored as PostgreSQL Text Array
    tasks JSONB NOT NULL DEFAULT '[]'::jsonb, -- Subtasks with id, title, category, completed, durationMinutes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ----------------------------------------------------------------------------
-- 5. WORK STUDY BLOCKS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.work_blocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
    assignment_title TEXT NOT NULL,
    course_code TEXT NOT NULL,
    task_title TEXT NOT NULL,
    start_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ----------------------------------------------------------------------------
-- 6. PRACTICE SESSIONS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.practice_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    concepts TEXT[] NOT NULL, -- Concept tags
    questions JSONB NOT NULL DEFAULT '[]'::jsonb, -- Question bank: questions, options, correctAnswer, explanation, hint
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ----------------------------------------------------------------------------
-- 7. ESTIMATE FEEDBACK TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.estimate_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
    predicted_minutes INTEGER NOT NULL,
    actual_minutes INTEGER NOT NULL,
    feedback_type TEXT NOT NULL CHECK (feedback_type IN ('accurate', 'too-low', 'too-high')),
    notes TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ----------------------------------------------------------------------------
-- INDEXING FOR PERFORMANCE & QUERY OPTIMIZATION
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_assignments_user ON public.assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_effort_estimates_assignment ON public.effort_estimates(assignment_id);
CREATE INDEX IF NOT EXISTS idx_work_blocks_user ON public.work_blocks(user_id);
CREATE INDEX IF NOT EXISTS idx_work_blocks_start ON public.work_blocks(start_at);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_assignment ON public.practice_sessions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user ON public.estimate_feedback(user_id);

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES FOR SUPABASE
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.effort_estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimate_feedback ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
DROP POLICY IF EXISTS "Users can insert their own profiles" ON public.profiles;
CREATE POLICY "Users can insert their own profiles" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 2. App Settings Policies
DROP POLICY IF EXISTS "Users can manage their own app settings" ON public.app_settings;
CREATE POLICY "Users can manage their own app settings" ON public.app_settings
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 3. Assignments Policies
DROP POLICY IF EXISTS "Users can manage their own assignments" ON public.assignments;
CREATE POLICY "Users can manage their own assignments" ON public.assignments
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. Effort Estimates Policies
DROP POLICY IF EXISTS "Users can manage their own effort estimates" ON public.effort_estimates;
CREATE POLICY "Users can manage their own effort estimates" ON public.effort_estimates
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 5. Work Blocks Policies
DROP POLICY IF EXISTS "Users can manage their own study work blocks" ON public.work_blocks;
CREATE POLICY "Users can manage their own study work blocks" ON public.work_blocks
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 6. Practice Sessions Policies
DROP POLICY IF EXISTS "Users can manage their own practice sessions" ON public.practice_sessions;
CREATE POLICY "Users can manage their own practice sessions" ON public.practice_sessions
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 7. Estimate Feedback Policies
DROP POLICY IF EXISTS "Users can manage their own estimate feedback" ON public.estimate_feedback;
CREATE POLICY "Users can manage their own estimate feedback" ON public.estimate_feedback
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- PROACTIVE SUPABASE AUTH TRIGGER (OPTIONAL)
-- ----------------------------------------------------------------------------
-- If you use Supabase Auth (GoTrue), this trigger automatically syncs
-- newly signed-up users from `auth.users` directly to your public `profiles` table.
--
-- CREATE OR REPLACE FUNCTION public.handle_new_user()
-- RETURNS trigger AS $$
-- BEGIN
--   INSERT INTO public.profiles (id, email, name)
--   VALUES (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', 'Student'));
--
--   INSERT INTO public.app_settings (user_id, lms_enabled, theme, privacy_mode)
--   VALUES (new.id, 'canvas', 'soft-minimalist', true);
--
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;
--
-- CREATE OR REPLACE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
