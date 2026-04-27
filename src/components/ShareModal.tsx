/**
 * ShareModal — generate + copy a public read-only share URL for the
 * current saved project.
 *
 * On open it fires createShareLink immediately so the URL is ready to
 * copy without a second click. View-only for now; the share_links table
 * has a `permission` column already in place for comment-mode in v3.1+.
 */

import { useEffect, useState } from "react";
import { createShareLink } from "../lib/share";

interface ShareModalProps {
  projectId: string;
  projectName: string;
  onClose: () => void;
}

export function ShareModal({ projectId, projectName, onClose }: ShareModalProps) {
  const [state, setState] = useState<
    | { status: "loading" }
    | { status: "ready"; url: string }
    | { status: "error"; message: string }
  >({ status: "loading" });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    createShareLink(projectId)
      .then((link) => {
        if (!cancelled) setState({ status: "ready", url: link.url });
      })
      .catch((err) => {
        if (!cancelled) setState({ status: "error", message: err.message ?? "Couldn't create share link." });
      });
    return () => { cancelled = true; };
  }, [projectId]);

  const handleCopy = async () => {
    if (state.status !== "ready") return;
    try {
      await navigator.clipboard.writeText(state.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select the input
      const input = document.getElementById("share-url-input") as HTMLInputElement | null;
      input?.select();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-[#0d0d1a] border border-canvas-highlight/40 rounded-2xl shadow-2xl w-[520px] max-w-[92vw] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-canvas-accent/50 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-canvas-highlight/20 border border-canvas-highlight/40 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="text-canvas-highlight">
              <path d="M5 8h6M11 8l-3-3M11 8l-3 3M2 5v6a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2H4a2 2 0 00-2 2z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-base font-bold text-canvas-text">Share this project</h2>
            <div className="text-[10px] font-mono text-canvas-muted uppercase tracking-wider truncate">
              {projectName}
            </div>
          </div>
          <button onClick={onClose} className="text-canvas-muted hover:text-canvas-text text-lg px-2">&times;</button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-[12px] text-canvas-muted leading-relaxed">
            Anyone with this link can view the project — walk the graph, audition cues, read director notes. They <span className="text-canvas-text font-semibold">can't edit, save, or share further</span>. No account required on their end.
          </p>

          {state.status === "loading" && (
            <div className="bg-canvas-accent/20 border border-canvas-accent/40 rounded-lg p-4 flex items-center gap-3">
              <span className="inline-block w-4 h-4 rounded-full border-2 border-canvas-highlight/40 border-t-canvas-highlight animate-spin" />
              <span className="text-[12px] text-canvas-muted">Creating share link...</span>
            </div>
          )}

          {state.status === "error" && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
              <div className="text-[11px] font-bold text-red-300 mb-1">Couldn't create share link</div>
              <div className="text-[11px] text-canvas-muted">{state.message}</div>
            </div>
          )}

          {state.status === "ready" && (
            <>
              <div className="flex gap-2">
                <input
                  id="share-url-input"
                  type="text"
                  value={state.url}
                  readOnly
                  onFocus={(e) => e.target.select()}
                  className="flex-1 bg-canvas-bg border border-canvas-accent rounded-lg px-3 py-2 text-[11px] text-canvas-text font-mono focus:outline-none focus:border-canvas-highlight"
                />
                <button
                  onClick={handleCopy}
                  className={`px-4 py-2 text-[11px] font-bold rounded-lg transition-colors whitespace-nowrap ${
                    copied
                      ? "bg-green-500/20 text-green-300 border border-green-500/40"
                      : "bg-canvas-highlight text-white hover:bg-canvas-highlight/80"
                  }`}
                >
                  {copied ? "✓ Copied" : "Copy link"}
                </button>
              </div>
              <div className="text-[10px] text-canvas-muted/70 italic">
                The link doesn't expire. Anyone you send it to can open it without an account.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
