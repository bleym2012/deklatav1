import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * ✅ SAFE UNIVERSAL SUPABASE CLIENT
 * - Does NOT touch window
 * - Does NOT use localStorage
 * - Safe for SSR, build, not-found, etc
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
