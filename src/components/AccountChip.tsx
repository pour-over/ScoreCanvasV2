/**
 * AccountChip — signed-in user surface in the TopBar.
 *
 * Shows an initials avatar + display name (falls back to email local-part).
 * Click to open a popover with full email, member-since, edit-profile
 * inline rename, and sign out.
 */

import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

interface AccountChipProps {
  email: string;
  name: string | null;
  createdAt: string | null;
  onSignOut: () => Promise<void> | void;
}

function initialsOf(source: string): string {
  const cleaned = source.trim();
  if (!cleaned) return "·";
  const parts = cleaned.split(/[\s._-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return cleaned.slice(0, 2).toUpperCase();
}

function memberSinceLabel(iso: string | null): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export function AccountChip({ email, name, createdAt, onSignOut }: AccountChipProps) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(name ?? "");
  const [savingName, setSavingName] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setDraftName(name ?? ""); }, [name]);

  useEffect(() => {
    if (!open) return;
    const onMouse = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setEditing(false);
      }
    };
    window.addEventListener("mousedown", onMouse);
    return () => window.removeEventListener("mousedown", onMouse);
  }, [open]);

  const display = name?.trim() || email.split("@")[0] || "You";
  const avatarSrc = name?.trim() || email;

  async function commitName() {
    const next = draftName.trim();
    if (!next || next === (name ?? "")) {
      setEditing(false);
      return;
    }
    setSavingName(true);
    try {
      await supabase.auth.updateUser({ data: { name: next } });
    } catch {
      /* swallow — Supabase will refresh user metadata via the auth-change subscription in AuthContext */
    } finally {
      setSavingName(false);
      setEditing(false);
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        data-tour="account-chip"
        onClick={() => setOpen((o) => !o)}
        title={`${display} · ${email}`}
        className="flex items-center gap-2 pl-1 pr-2 py-0.5 rounded-full border border-canvas-accent text-canvas-text hover:border-canvas-highlight/60 transition-colors"
      >
        <span
          className="w-6 h-6 rounded-full bg-canvas-highlight/25 text-canvas-highlight font-bold text-[10px] flex items-center justify-center border border-canvas-highlight/40"
          aria-hidden
        >
          {initialsOf(avatarSrc)}
        </span>
        <span className="text-[11px] font-mono text-canvas-text truncate max-w-[120px]">{display}</span>
        <svg width="8" height="5" viewBox="0 0 8 5" fill="currentColor" className={`transition-transform text-canvas-muted ${open ? "rotate-180" : ""}`}>
          <path d="M0 0l4 5 4-5z" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1 w-72 bg-canvas-surface border border-canvas-accent rounded-lg shadow-2xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-canvas-accent/50 flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-canvas-highlight/25 text-canvas-highlight font-bold text-sm flex items-center justify-center border border-canvas-highlight/40">
              {initialsOf(avatarSrc)}
            </span>
            <div className="min-w-0 flex-1">
              {editing ? (
                <input
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitName();
                    if (e.key === "Escape") { setDraftName(name ?? ""); setEditing(false); }
                  }}
                  autoFocus
                  disabled={savingName}
                  className="w-full bg-canvas-bg border border-canvas-accent rounded px-1.5 py-0.5 text-[12px] font-bold text-canvas-text outline-none focus:border-canvas-highlight"
                  placeholder="Display name"
                />
              ) : (
                <div className="text-[12px] font-bold text-canvas-text truncate">{display}</div>
              )}
              <div className="text-[10px] text-canvas-muted truncate" title={email}>{email}</div>
            </div>
          </div>

          {createdAt && (
            <div className="px-4 py-2 border-b border-canvas-accent/40">
              <div className="text-[9px] font-mono uppercase tracking-wider text-canvas-muted">Member since</div>
              <div className="text-[11px] text-canvas-text mt-0.5">{memberSinceLabel(createdAt)}</div>
            </div>
          )}

          <div className="py-1.5">
            {editing ? (
              <button
                onClick={commitName}
                disabled={savingName}
                className="w-full text-left px-4 py-1.5 text-[11px] text-canvas-highlight hover:bg-canvas-highlight/10 transition-colors disabled:opacity-50"
              >
                {savingName ? "Saving…" : "Save name"}
              </button>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="w-full text-left px-4 py-1.5 text-[11px] text-canvas-text hover:bg-canvas-accent/30 transition-colors"
              >
                Edit display name
              </button>
            )}
            <button
              onClick={() => { setOpen(false); void onSignOut(); }}
              className="w-full text-left px-4 py-1.5 text-[11px] text-canvas-muted hover:text-canvas-text hover:bg-canvas-accent/30 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
