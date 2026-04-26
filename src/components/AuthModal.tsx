/**
 * AuthModal — magic-link email sign-in.
 *
 * Two states: "enter email" → "check your email." That's the whole flow.
 * No passwords, no OAuth, no MFA — keep the funnel as low-friction as possible
 * for early users. We can add OAuth + SSO later in the studio rollout track.
 */

import { useState } from "react";
import { useAuth } from "../auth/AuthContext";

interface AuthModalProps {
  onClose: () => void;
  /** Optional message shown above the form, e.g. "Sign in to save this project." */
  reason?: string;
}

export function AuthModal({ onClose, reason }: AuthModalProps) {
  const { signInWithEmail, configured } = useAuth();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/.+@.+\..+/.test(email)) {
      setError("Please enter a valid email.");
      return;
    }
    setSubmitting(true);
    setError(null);
    const err = await signInWithEmail(email);
    setSubmitting(false);
    if (err) setError(err);
    else setSent(true);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-[#0d0d1a] border border-canvas-highlight/40 rounded-2xl shadow-2xl w-[440px] max-w-[92vw] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-canvas-accent/50 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-canvas-highlight flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-white">
              <path d="M2 4h3v6H2zM6 2h2v10H6zM9 5h3v5H9z" fill="currentColor" opacity="0.9"/>
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-canvas-text">Sign in to Score Canvas</h2>
            <div className="text-[10px] font-mono text-canvas-muted uppercase tracking-wider">Magic link · No password</div>
          </div>
          <button onClick={onClose} className="text-canvas-muted hover:text-canvas-text text-lg px-2">&times;</button>
        </div>

        {/* Body */}
        <div className="p-6">
          {!configured ? (
            <div className="bg-amber-900/20 border border-amber-500/30 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">🛠</div>
              <div className="text-sm font-bold text-amber-300 mb-1">Backend not configured yet</div>
              <div className="text-xs text-canvas-muted leading-relaxed">
                Save / share / upload aren't wired up on this deploy yet.
                The demo gallery and tutorial still work — explore freely.
              </div>
            </div>
          ) : sent ? (
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-5 text-center">
              <div className="text-3xl mb-2">✉</div>
              <div className="text-sm font-bold text-green-300 mb-1">Check your email.</div>
              <div className="text-xs text-canvas-muted leading-relaxed">
                We sent a sign-in link to <span className="font-mono text-canvas-text">{email}</span>.
                Click it and you'll land back here, signed in.
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              {reason && (
                <div className="text-[12px] text-canvas-muted leading-relaxed bg-canvas-highlight/5 border border-canvas-highlight/20 rounded-lg p-3">
                  {reason}
                </div>
              )}
              <p className="text-[12px] text-canvas-muted leading-relaxed">
                Enter your email — we'll send you a one-click sign-in link. No password to remember.
              </p>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                placeholder="you@studio.com"
                required
                autoFocus
                disabled={submitting}
                className="w-full bg-canvas-bg border border-canvas-accent rounded-lg px-3 py-2.5 text-sm text-canvas-text placeholder:text-canvas-muted/50 focus:outline-none focus:border-canvas-highlight disabled:opacity-50"
              />
              {error && <div className="text-[11px] text-red-400 font-mono">{error}</div>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-4 py-2.5 text-xs font-bold rounded-lg bg-canvas-highlight text-white hover:bg-canvas-highlight/80 disabled:opacity-60 disabled:cursor-wait transition-colors shadow-lg shadow-canvas-highlight/25"
              >
                {submitting ? "Sending..." : "Send magic link →"}
              </button>
              <p className="text-[10px] text-canvas-muted/60 text-center mt-2">
                By signing in, you agree to be a great beta user and tell us when something breaks.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
