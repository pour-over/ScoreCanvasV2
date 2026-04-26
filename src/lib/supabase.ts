/**
 * Supabase client — auth + database + storage in one.
 *
 * Configured via Vite env vars:
 *   VITE_SUPABASE_URL       — project URL (e.g. https://xxx.supabase.co)
 *   VITE_SUPABASE_ANON_KEY  — public anon key (safe to expose; RLS enforces access)
 *
 * If env vars are missing (e.g. in a fresh fork or before backend setup),
 * `isConfigured` is false and the rest of the app falls back gracefully —
 * the demo projects + Hear-It gallery still work without persistence.
 *
 * See SUPABASE_SETUP.md in the repo root for one-time backend provisioning.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isConfigured = Boolean(
  SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL.startsWith("https://")
);

// When not configured, export a stub that throws on use — but only if used.
// Import-time access stays safe so the rest of the app loads.
export const supabase: SupabaseClient = isConfigured
  ? createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      auth: {
        persistSession: true,
        detectSessionInUrl: true,
        autoRefreshToken: true,
      },
    })
  : (createUnconfiguredStub() as unknown as SupabaseClient);

function createUnconfiguredStub() {
  const err = () => {
    throw new Error(
      "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment. See SUPABASE_SETUP.md."
    );
  };
  return new Proxy(
    {},
    {
      get() {
        return err;
      },
    }
  );
}

// Storage bucket used for user-uploaded audio files.
export const AUDIO_BUCKET = "user-audio";
