/**
 * AuthContext — wraps the Supabase auth session.
 *
 * Exposes user / session / signIn / signOut via useAuth().
 * Falls back to a permanently-signed-out state when Supabase isn't configured,
 * so the demo experience stays intact.
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, isConfigured } from "../lib/supabase";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  /** Send a magic-link email. Returns null on success, an error message on failure. */
  signInWithEmail: (email: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  /** True when no backend is configured — UI uses this to gate auth-related features. */
  configured: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  loading: false,
  signInWithEmail: async () => "Auth is not configured.",
  signOut: async () => {},
  configured: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(isConfigured);

  useEffect(() => {
    if (!isConfigured) return;
    let cancelled = false;
    // Resolve initial session (might be persisted in localStorage)
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setSession(data.session ?? null);
      setLoading(false);
    });
    // Subscribe to auth state changes (sign-in, sign-out, token refresh)
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setLoading(false);
    });
    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string): Promise<string | null> => {
    if (!isConfigured) return "Sign-in is not configured yet. Try the demo instead.";
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/#app`,
      },
    });
    return error?.message ?? null;
  };

  const signOut = async () => {
    if (!isConfigured) return;
    await supabase.auth.signOut();
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        session,
        loading,
        signInWithEmail,
        signOut,
        configured: isConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
