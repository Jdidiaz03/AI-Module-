import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

// Check if variables are properly configured and not default placeholder strings
const isConfigured =
  !!supabaseUrl &&
  !!supabaseAnonKey &&
  supabaseUrl !== "YOUR_SUPABASE_URL_HERE" &&
  supabaseAnonKey !== "YOUR_SUPABASE_ANON_KEY_HERE" &&
  supabaseUrl.trim() !== "" &&
  supabaseAnonKey.trim() !== "";

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (supabase) {
  console.log("Supabase Client initialized successfully with environment variables.");
} else {
  console.log("Supabase Client running in offline/LocalStorage fallback mode.");
}
