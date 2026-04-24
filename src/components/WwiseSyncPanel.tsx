interface WwiseSyncPanelProps {
  onClose: () => void;
}

export function WwiseSyncPanel({ onClose }: WwiseSyncPanelProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#0d0d1a] border border-canvas-highlight/40 rounded-xl shadow-2xl w-[620px] max-w-[92vw] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header with Coming Soon badge */}
        <div className="px-6 py-4 border-b border-canvas-accent/50 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-canvas-highlight/20 border border-canvas-highlight/40 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" className="text-canvas-highlight">
              <path d="M2 8h12M8 2l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-bold text-canvas-text">Wwise Live Sync</h2>
            <div className="text-[10px] font-mono text-canvas-muted uppercase tracking-wider">Two-way bridge to your session</div>
          </div>
          <div className="px-3 py-1 rounded-full bg-canvas-highlight/20 border border-canvas-highlight/40">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-canvas-highlight">Coming Q3</span>
          </div>
          <button onClick={onClose} className="text-canvas-muted hover:text-canvas-text text-lg px-2">&times;</button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <p className="text-sm text-canvas-muted leading-relaxed">
            Design the graph in Score Canvas. Audition it in-browser. Then push music states, transitions, RTPCs, and stingers straight into your live Wwise session — no template shuffling, no re-import dance.
          </p>

          {/* Mock console preview */}
          <div className="bg-[#0a0a18] border border-canvas-accent/40 rounded-lg p-4 font-mono text-[11px]">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-canvas-accent/30">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-400 font-bold">● CONNECTED</span>
              <span className="text-canvas-muted ml-auto text-[9px]">bloodborne2.wproj</span>
            </div>
            <div className="space-y-1.5 text-canvas-muted">
              <div>→ <span className="text-canvas-highlight">MSC_Yarnball_Explore</span> <span className="text-green-400">synced</span></div>
              <div>→ <span className="text-canvas-highlight">TR_Explore_to_Combat</span> <span className="text-green-400">synced</span></div>
              <div>→ <span className="text-canvas-highlight">ST_Hairball_Coughed</span> <span className="text-yellow-400">pushing...</span></div>
              <div>→ <span className="text-canvas-highlight">RTPC_Comfiness</span> <span className="text-canvas-muted">queued</span></div>
              <div className="text-[10px] text-canvas-muted/60 mt-2 pt-2 border-t border-canvas-accent/20">4 objects · 2 stem banks · 1.2s latency</div>
            </div>
          </div>

          {/* Feature bullets */}
          <div className="space-y-2.5">
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-canvas-highlight/20 border border-canvas-highlight/40 flex items-center justify-center text-canvas-highlight text-[10px] font-bold flex-shrink-0 mt-0.5">1</div>
              <div>
                <div className="text-[12px] font-bold text-canvas-text">Live WAAPI connection</div>
                <div className="text-[11px] text-canvas-muted leading-relaxed">Connect Score Canvas to any Wwise project via the official Wwise Authoring API. No file import, no manual setup.</div>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-canvas-highlight/20 border border-canvas-highlight/40 flex items-center justify-center text-canvas-highlight text-[10px] font-bold flex-shrink-0 mt-0.5">2</div>
              <div>
                <div className="text-[12px] font-bold text-canvas-text">Two-way updates</div>
                <div className="text-[11px] text-canvas-muted leading-relaxed">Changes in Score Canvas push to Wwise. Changes in Wwise reflect back in the graph. One source of truth.</div>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-5 h-5 rounded-full bg-canvas-highlight/20 border border-canvas-highlight/40 flex items-center justify-center text-canvas-highlight text-[10px] font-bold flex-shrink-0 mt-0.5">3</div>
              <div>
                <div className="text-[12px] font-bold text-canvas-text">Bake stem mixes in place</div>
                <div className="text-[11px] text-canvas-muted leading-relaxed">Print your in-canvas stem adjustments directly to Wwise-ready assets. Save the middleware CPU for things that actually need to be dynamic.</div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-canvas-highlight/10 border border-canvas-highlight/30 rounded-lg p-4 text-center">
            <div className="text-[11px] text-canvas-text mb-2">
              First cohort gets Wwise Sync <span className="font-bold text-canvas-highlight">at cost</span> when it ships.
            </div>
            <a
              href="/#waitlist"
              onClick={(e) => {
                e.preventDefault();
                onClose();
                // Open landing in new tab to hit the waitlist
                window.open("/#waitlist", "_blank");
              }}
              className="inline-block px-5 py-2 text-xs font-bold rounded-lg bg-canvas-highlight text-white hover:bg-canvas-highlight/80 transition-colors shadow-lg shadow-canvas-highlight/20"
            >
              Join the Waitlist →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
