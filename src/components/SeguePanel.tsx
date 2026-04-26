/**
 * SeguePanel — roadmap teaser for the AI stem generation feature.
 *
 * The pitch: "You provide a clean theme. You get an entire score."
 * AI-generated stem variations, intros, endings, transitions — any genre,
 * instantly, for style ideation. Powered by Suno via Kie.ai (planned).
 */

import { SegueDemoGallery } from "./SegueDemoGallery";

interface SeguePanelProps {
  onClose: () => void;
}

export function SeguePanel({ onClose }: SeguePanelProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-[#0d0d1a] border border-purple-500/50 rounded-xl shadow-2xl w-[720px] max-w-[94vw] max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-canvas-accent/50 flex items-center gap-3 bg-gradient-to-r from-purple-900/30 via-transparent to-cyan-900/20">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" className="text-purple-300">
              <path d="M8 1l2 5h5l-4 3 1.5 5L8 11l-4.5 3L5 9 1 6h5z" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-base font-black text-canvas-text tracking-tight">SEGUE — Solving the X → Y Music Problem</h2>
            <div className="text-[10px] font-mono text-purple-300/80 uppercase tracking-wider">
              <span className="italic">seg-way</span> · n. a smooth transition from one piece of music to another
            </div>
          </div>
          <div className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-300">Coming v2.5</span>
          </div>
          <button onClick={onClose} className="text-canvas-muted hover:text-canvas-text text-lg px-2">&times;</button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* The X → Y framing */}
          <div className="bg-[#0a0a18] border border-purple-500/20 rounded-lg p-4">
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-purple-300/80 mb-2">The Core Problem</div>
            <div className="text-[13px] text-canvas-text leading-relaxed">
              Every adaptive music system is really one question, asked a hundred times:
              <span className="text-purple-300 font-bold"> "How do I get from X music to Y music — cleanly?"</span>
            </div>
            <div className="text-[11px] text-canvas-muted mt-2 italic">
              SEGUE is built to answer that question. Intros, endings, bridges, stem variations — all AI-generated from your source theme, purpose-built to live in a state machine.
            </div>
          </div>

          {/* The pitch */}
          <div className="bg-gradient-to-br from-purple-900/20 to-cyan-900/10 border border-purple-500/30 rounded-xl p-5">
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-purple-300/80 mb-2">The Pitch</div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="text-[11px] font-mono text-canvas-muted mb-1">You provide:</div>
                <div className="text-sm font-bold text-canvas-text">A clean theme.</div>
              </div>
              <div className="text-2xl text-purple-400">→</div>
              <div className="flex-1">
                <div className="text-[11px] font-mono text-canvas-muted mb-1">You get:</div>
                <div className="text-sm font-bold text-canvas-text">An entire score.</div>
                <div className="text-[11px] text-canvas-muted mt-0.5">Any genre. Instantly.</div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-purple-500/20 text-[12px] text-purple-200/80 leading-relaxed italic">
              The most bang-for-buck music tool that exists — purpose-built for style ideation, rapid prototyping, and killing the "we don't know what we want yet" meeting.
            </div>
          </div>

          {/* What it generates — capability grid */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-purple-300/80">What SEGUE Generates</div>
              <div className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">instrumental, always</div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-[#0a0a18] border border-canvas-accent/40 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-purple-400 text-lg">✦</span>
                  <div className="text-[12px] font-bold text-canvas-text">Stem Variations</div>
                </div>
                <div className="text-[10px] text-canvas-muted leading-relaxed">Any stem, any new direction. "Less intense. Swap strings for synths. Add tension." Instantly.</div>
              </div>
              <div className="bg-[#0a0a18] border border-canvas-accent/40 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-purple-400 text-lg">⤴</span>
                  <div className="text-[12px] font-bold text-canvas-text">Custom Intros</div>
                </div>
                <div className="text-[10px] text-canvas-muted leading-relaxed">AI-generated intros tuned to your theme — match the key, BPM, and vibe automatically.</div>
              </div>
              <div className="bg-[#0a0a18] border border-canvas-accent/40 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-purple-400 text-lg">⤵</span>
                  <div className="text-[12px] font-bold text-canvas-text">Custom Endings</div>
                </div>
                <div className="text-[10px] text-canvas-muted leading-relaxed">Clean endtags, cadential resolutions, or fade-out tails. Generated, not fudged in the DAW.</div>
              </div>
              <div className="bg-[#0a0a18] border border-canvas-accent/40 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-purple-400 text-lg">↔</span>
                  <div className="text-[12px] font-bold text-canvas-text">Custom Transitions</div>
                </div>
                <div className="text-[10px] text-canvas-muted leading-relaxed">Musical bridges: seamless bridges between any two states. Not just crossfades — actual musical writing.</div>
              </div>
              <div className="bg-[#0a0a18] border border-canvas-accent/40 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-amber-400 text-lg">≡</span>
                  <div className="text-[12px] font-bold text-canvas-text">AI Stem Split</div>
                </div>
                <div className="text-[10px] text-canvas-muted leading-relaxed">Take a mixed track. Get back isolated stems (drums, bass, melody, pads) — ready to re-layer.</div>
              </div>
              <div className="bg-[#0a0a18] border border-canvas-accent/40 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-cyan-400 text-lg">♪</span>
                  <div className="text-[12px] font-bold text-canvas-text">Analyze &amp; Tag</div>
                </div>
                <div className="text-[10px] text-canvas-muted leading-relaxed">Auto-extract key, tempo, mood, instruments, intensity. Populate your asset library in a click.</div>
              </div>
            </div>
          </div>

          {/* Real audio demo — playable, decoded waveforms */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-purple-300/80">Hear It · Sample Outputs</div>
              <div className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30">instrumental, always</div>
            </div>
            <SegueDemoGallery />
          </div>

          {/* Why it matters */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-2xl font-black text-purple-300 mb-1">60s</div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-canvas-muted">theme → full score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-purple-300 mb-1">∞</div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-canvas-muted">style variations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-purple-300 mb-1">$0</div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-canvas-muted">extra composer time</div>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 text-center">
            <div className="text-[12px] text-canvas-text mb-2">
              First cohort gets SEGUE <span className="font-bold text-purple-300">at cost</span> when it ships.
            </div>
            <a
              href="/#waitlist"
              onClick={(e) => {
                e.preventDefault();
                onClose();
                window.open("/#waitlist", "_blank");
              }}
              className="inline-block px-5 py-2 text-xs font-bold rounded-lg bg-purple-500/80 text-white hover:bg-purple-500 transition-colors shadow-lg shadow-purple-500/20"
            >
              Join the Waitlist →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
