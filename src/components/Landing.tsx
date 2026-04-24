import { useState, useEffect, useRef } from "react";

// ─── Animated node graph mock ───────────────────────────────────────────────

function AnimatedGraph() {
  const [activeNode, setActiveNode] = useState(0);
  const nodes = [
    { x: 80, y: 60, label: "Opening\nCinematic", type: "event", color: "#e94560" },
    { x: 240, y: 40, label: "Explore\nTheme", type: "music", color: "#4ecdc4" },
    { x: 400, y: 80, label: "Crossfade", type: "transition", color: "#818cf8" },
    { x: 560, y: 50, label: "Combat\nIntense", type: "music", color: "#4ecdc4" },
    { x: 400, y: 150, label: "Death\nSting", type: "stinger", color: "#f97316" },
    { x: 720, y: 90, label: "Victory\nFanfare", type: "music", color: "#4ecdc4" },
  ];
  const edges = [[0,1],[1,2],[2,3],[3,5],[1,4],[4,1]];

  useEffect(() => {
    const interval = setInterval(() => setActiveNode((n) => (n + 1) % nodes.length), 2000);
    return () => clearInterval(interval);
  }, [nodes.length]);

  return (
    <svg viewBox="0 0 800 200" className="w-full max-w-3xl mx-auto opacity-80" style={{ filter: "drop-shadow(0 0 40px rgba(78,205,196,0.15))" }}>
      {edges.map(([from, to], i) => (
        <line key={i}
          x1={nodes[from].x} y1={nodes[from].y}
          x2={nodes[to].x} y2={nodes[to].y}
          stroke="#3a3a5c" strokeWidth="2" strokeDasharray={i > 3 ? "4 4" : "none"}
        />
      ))}
      {nodes.map((n, i) => {
        const isActive = i === activeNode;
        return (
          <g key={i}>
            {isActive && (
              <circle cx={n.x} cy={n.y} r="32" fill="none" stroke={n.color} strokeWidth="1.5" opacity="0.4">
                <animate attributeName="r" values="28;36;28" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0.1;0.5" dur="2s" repeatCount="indefinite" />
              </circle>
            )}
            <rect x={n.x - 44} y={n.y - 22} width="88" height="44" rx="8"
              fill={isActive ? n.color + "30" : "#0d0d1a"}
              stroke={isActive ? n.color : "#3a3a5c"}
              strokeWidth={isActive ? 2 : 1}
            />
            {n.label.split("\n").map((line, li) => (
              <text key={li} x={n.x} y={n.y - 4 + li * 14} textAnchor="middle" fontSize="10" fontFamily="monospace"
                fill={isActive ? n.color : "#8a8aa3"}
              >
                {line}
              </text>
            ))}
            {isActive && (
              <circle cx={n.x - 32} cy={n.y - 10} r="3" fill="#4ade80">
                <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
              </circle>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ─── Verb card (Design / Audition / Deliver) ────────────────────────────────

function VerbCard({ verb, tagline, desc, icon, color }: { verb: string; tagline: string; desc: string; icon: string; color: string }) {
  return (
    <div className="bg-[#0d0d1a]/80 border border-canvas-accent/40 rounded-2xl p-6 hover:border-canvas-highlight/50 transition-all duration-300 group">
      <div className="text-3xl mb-3 group-hover:scale-110 transition-transform" style={{ filter: `drop-shadow(0 0 10px ${color}66)` }}>{icon}</div>
      <div className="text-[10px] font-mono uppercase tracking-[0.3em] mb-1" style={{ color }}>{tagline}</div>
      <h3 className="text-2xl font-black text-canvas-text mb-2">{verb}</h3>
      <p className="text-[13px] text-canvas-muted leading-relaxed">{desc}</p>
    </div>
  );
}

// ─── For Whom card ──────────────────────────────────────────────────────────

function AudienceCard({ role, benefit, icon }: { role: string; benefit: string; icon: string }) {
  return (
    <div className="bg-[#0d0d1a]/60 border border-canvas-accent/30 rounded-xl p-5 hover:border-canvas-highlight/40 transition-colors">
      <div className="text-xl mb-2">{icon}</div>
      <div className="text-xs font-bold text-canvas-highlight mb-1.5">{role}</div>
      <div className="text-[11px] text-canvas-muted leading-relaxed">{benefit}</div>
    </div>
  );
}

// ─── Feature card ───────────────────────────────────────────────────────────

function FeatureCard({ icon, title, desc, color }: { icon: string; title: string; desc: string; color: string }) {
  return (
    <div className="bg-[#0d0d1a]/80 border border-canvas-accent/40 rounded-xl p-5 hover:border-canvas-highlight/40 transition-all duration-300 group">
      <div className="text-2xl mb-3 group-hover:scale-110 transition-transform" style={{ filter: `drop-shadow(0 0 6px ${color}44)` }}>{icon}</div>
      <h3 className="text-sm font-bold text-canvas-text mb-1.5">{title}</h3>
      <p className="text-xs text-canvas-muted leading-relaxed">{desc}</p>
    </div>
  );
}

// ─── Landing page ───────────────────────────────────────────────────────────

export function Landing() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const formData = new FormData();
    formData.append("form-name", "waitlist");
    formData.append("email", email);

    try {
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData as unknown as Record<string, string>).toString(),
      });
      setSubmitted(true);
    } catch {
      window.location.href = `mailto:info@scorecanvas.io?subject=Score Canvas Early Access&body=Sign me up! My email: ${email}`;
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-canvas-bg text-canvas-text overflow-x-hidden">

      {/* ═══ Nav ═══ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrollY > 50 ? "bg-[#0a0a18]/95 backdrop-blur-md border-b border-canvas-accent/30" : ""}`}>
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-canvas-highlight flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-white">
                <path d="M2 4h3v6H2zM6 2h2v10H6zM9 5h3v5H9z" fill="currentColor" opacity="0.9"/>
              </svg>
            </div>
            <span className="text-base font-bold tracking-tight">Score Canvas</span>
            <span className="text-[9px] font-mono text-canvas-highlight/60 border border-canvas-highlight/30 rounded px-1.5 py-0.5 ml-1">V2 PREVIEW</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#workflow" className="text-xs text-canvas-muted hover:text-canvas-text transition-colors">Workflow</a>
            <a href="#for-teams" className="text-xs text-canvas-muted hover:text-canvas-text transition-colors">For Teams</a>
            <a href="#features" className="text-xs text-canvas-muted hover:text-canvas-text transition-colors">Features</a>
            <a href="#roadmap" className="text-xs text-canvas-muted hover:text-canvas-text transition-colors">Roadmap</a>
            <a href="#waitlist" className="text-xs text-canvas-muted hover:text-canvas-text transition-colors">Early Access</a>
            <a
              href="#app"
              className="px-4 py-1.5 text-xs font-bold rounded-lg bg-canvas-highlight text-white hover:bg-canvas-highlight/80 transition-colors shadow-lg shadow-canvas-highlight/20"
            >
              Try the Demo
            </a>
          </div>
        </div>
      </nav>

      {/* ═══ Hero ═══ */}
      <section className="relative pt-28 pb-16 px-6">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full opacity-25"
            style={{ background: "radial-gradient(ellipse, #0f3460 0%, transparent 70%)" }}
          />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Credibility pill — above the fold, hard to miss */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-canvas-highlight/40 bg-canvas-highlight/10 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-canvas-highlight animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-canvas-highlight">
              Built at PlayStation Studios · 17 years in the trenches
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-5 leading-[1.05]">
            The visual interactive<br/>
            <span className="bg-gradient-to-r from-canvas-highlight to-[#4ecdc4] bg-clip-text text-transparent">
              music engine
            </span>{" "}for games.
          </h1>

          <p className="text-xl text-canvas-muted max-w-2xl mx-auto mb-8 font-semibold tracking-wide">
            Design. Audition. Deliver.
          </p>

          <p className="text-sm text-canvas-muted/80 max-w-xl mx-auto mb-10 leading-relaxed">
            Adaptive music for games should not live in a spreadsheet.
            Score Canvas is the tool that shows you what the middleware will sound like — before you build it.
          </p>

          <div className="flex justify-center gap-3 mb-16 flex-wrap">
            <a
              href="#app"
              className="px-8 py-3.5 text-sm font-bold rounded-xl bg-canvas-highlight text-white hover:bg-canvas-highlight/80 transition-all shadow-xl shadow-canvas-highlight/25 hover:shadow-canvas-highlight/40 hover:scale-105"
            >
              Try the Live Demo →
            </a>
            <a
              href="#waitlist"
              className="px-8 py-3.5 text-sm font-semibold rounded-xl border border-canvas-accent text-canvas-text hover:border-canvas-highlight/50 hover:text-canvas-highlight transition-colors"
            >
              Get Early Access
            </a>
          </div>

          <AnimatedGraph />
        </div>
      </section>

      {/* ═══ Three-Verb Workflow ═══ */}
      <section id="workflow" className="py-24 px-6 border-t border-canvas-accent/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-canvas-highlight mb-3">The Workflow</p>
            <h2 className="text-3xl md:text-4xl font-black mb-3">Three steps. Zero spreadsheets.</h2>
            <p className="text-sm text-canvas-muted max-w-xl mx-auto">
              From first sketch to production handoff — all in one tool, all in your browser.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <VerbCard
              verb="Design"
              tagline="Step One"
              icon="✎"
              color="#4ecdc4"
              desc="Drag, connect, and structure your interactive music system visually. Music states, transitions, stingers, RTPCs, events — all on one canvas you can actually read."
            />
            <VerbCard
              verb="Audition"
              tagline="Step Two"
              icon="♪"
              color="#e94560"
              desc="Hear every transition, layer, and stinger play back live in the browser. Tweak the flow, re-audition instantly. No DAW. No middleware build. No three-sprint wait."
            />
            <VerbCard
              verb="Deliver"
              tagline="Step Three"
              icon="⇢"
              color="#818cf8"
              desc="Export Wwise-ready schemas, FMOD templates, or JSON for any pipeline. Your audio programmer gets production-perfect specs — not a 40-page doc and a prayer."
            />
          </div>
        </div>
      </section>

      {/* ═══ Metrics Strip ═══ */}
      <section className="py-16 px-6 border-t border-canvas-accent/20 bg-gradient-to-b from-transparent via-canvas-highlight/5 to-transparent">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-black text-canvas-highlight mb-2">60s</div>
              <div className="text-xs font-mono uppercase tracking-wider text-canvas-muted">From idea to audible prototype</div>
            </div>
            <div>
              <div className="text-4xl font-black text-canvas-highlight mb-2">0 pages</div>
              <div className="text-xs font-mono uppercase tracking-wider text-canvas-muted">Of design documentation replaced</div>
              <div className="text-[10px] text-canvas-muted/60 mt-1">(one shareable graph instead)</div>
            </div>
            <div>
              <div className="text-4xl font-black text-canvas-highlight mb-2">6</div>
              <div className="text-xs font-mono uppercase tracking-wider text-canvas-muted">Full demo projects shipping now</div>
              <div className="text-[10px] text-canvas-muted/60 mt-1">Wanderspire, Hoontborne, Strikecore, more</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ The Problem ═══ */}
      <section className="py-20 px-6 border-t border-canvas-accent/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-canvas-highlight mb-3">The Problem</p>
            <h2 className="text-3xl font-black mb-3">This tool should already exist.</h2>
            <p className="text-sm text-canvas-muted max-w-lg mx-auto">
              Game music is the most complex audio system in entertainment.
              And yet most teams design it with... this:
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-[#0d0d1a] border border-red-500/20 rounded-xl p-5 text-center">
              <div className="text-3xl mb-3">📋</div>
              <div className="text-xs font-bold text-red-400 mb-1">Spreadsheet State Machines</div>
              <div className="text-[11px] text-canvas-muted leading-relaxed">
                "Row 47: combat_high transitions to explore_calm... I think. Let me check the other tab."
              </div>
            </div>
            <div className="bg-[#0d0d1a] border border-red-500/20 rounded-xl p-5 text-center">
              <div className="text-3xl mb-3">🔇</div>
              <div className="text-xs font-bold text-red-400 mb-1">Can't Hear It Until Integration</div>
              <div className="text-[11px] text-canvas-muted leading-relaxed">
                "The crossfade sounds terrible. We won't know for 3 sprints. Cool cool cool."
              </div>
            </div>
            <div className="bg-[#0d0d1a] border border-red-500/20 rounded-xl p-5 text-center">
              <div className="text-3xl mb-3">🧩</div>
              <div className="text-xs font-bold text-red-400 mb-1">Lost in Translation</div>
              <div className="text-[11px] text-canvas-muted leading-relaxed">
                Creative Director: "Make it feel like Journey."<br/>Composer: "?"<br/>Implementer: "??"
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ For Whom ═══ */}
      <section id="for-teams" className="py-24 px-6 border-t border-canvas-accent/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-canvas-highlight mb-3">For Teams</p>
            <h2 className="text-3xl md:text-4xl font-black mb-3">The shared language for game music.</h2>
            <p className="text-sm text-canvas-muted max-w-2xl mx-auto leading-relaxed">
              Built first for audio leads — but designed so anyone on your team can read the graph, suggest changes, and feel the music before it ships.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <AudienceCard
              icon="🎚"
              role="Audio Leads & Composers"
              benefit="Prototype systems 10× faster. Audition transitions without a middleware build. Hand off specs that your audio programmer can actually implement without a 40-page doc."
            />
            <AudienceCard
              icon="🎬"
              role="Creative Directors"
              benefit="Finally see your music system, not just describe it. Walk the graph with your audio team. Hear the combat-to-exploration transition in the pitch meeting."
            />
            <AudienceCard
              icon="🎮"
              role="Game Designers & Producers"
              benefit="Prototype adaptive audio before a composer is even hired. Track status, flag blockers, and ship reviews of the music system like any other design artifact."
            />
          </div>
        </div>
      </section>

      {/* ═══ Roadmap / Wwise Sync Teaser ═══ */}
      <section id="roadmap" className="py-24 px-6 border-t border-canvas-accent/20 bg-gradient-to-b from-transparent via-[#4ecdc4]/5 to-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-canvas-highlight mb-3">On the Roadmap</p>
            <h2 className="text-3xl font-black mb-3">Live Wwise Sync.</h2>
            <p className="text-sm text-canvas-muted max-w-xl mx-auto">
              The real handoff. Not a template file — a live connection to your session.
            </p>
          </div>

          <div className="bg-[#0d0d1a]/80 border border-canvas-highlight/40 rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-canvas-highlight/20 border border-canvas-highlight/40">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-canvas-highlight">Coming Soon</span>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#4ecdc4] mb-2">v2.5 · Q3</div>
                <h3 className="text-2xl font-black mb-3">Connect directly to your Wwise session</h3>
                <p className="text-sm text-canvas-muted leading-relaxed mb-4">
                  Design the graph in Score Canvas. Audition in-browser. Then push music states, transitions, and RTPCs straight into your live Wwise project — no re-import, no template shuffling.
                </p>
                <ul className="space-y-1.5 text-[12px] text-canvas-muted">
                  <li className="flex items-start gap-2"><span className="text-canvas-highlight mt-0.5">→</span> Sync via WAAPI (Wwise Authoring API)</li>
                  <li className="flex items-start gap-2"><span className="text-canvas-highlight mt-0.5">→</span> Two-way updates — changes in Wwise reflect in the graph</li>
                  <li className="flex items-start gap-2"><span className="text-canvas-highlight mt-0.5">→</span> Bake stem mixes live, push to middleware</li>
                </ul>
              </div>

              <div className="bg-[#0a0a18] border border-canvas-accent/40 rounded-lg p-5 font-mono text-[11px]">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-canvas-accent/30">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-green-400">● CONNECTED</span>
                  <span className="text-canvas-muted ml-auto text-[9px]">wwise_project.wproj</span>
                </div>
                <div className="space-y-1.5 text-canvas-muted">
                  <div>→ <span className="text-canvas-highlight">MSC_Combat_Intense</span> <span className="text-green-400">synced</span></div>
                  <div>→ <span className="text-canvas-highlight">TR_Combat→Explore</span> <span className="text-green-400">synced</span></div>
                  <div>→ <span className="text-canvas-highlight">ST_Boss_Defeat</span> <span className="text-yellow-400">pushing...</span></div>
                  <div>→ <span className="text-canvas-highlight">RTPC_Tension</span> <span className="text-canvas-muted">pending</span></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-[11px] text-canvas-muted/60">
              Want early access to Wwise Sync? <a href="#waitlist" className="text-canvas-highlight hover:underline">Join the waitlist</a> — first cohort gets it at cost.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ Features grid ═══ */}
      <section id="features" className="py-24 px-6 border-t border-canvas-accent/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-canvas-highlight mb-3">Features</p>
            <h2 className="text-3xl md:text-4xl font-black mb-3">Everything the spreadsheet can't do.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <FeatureCard
              icon="◉"
              title="Visual State Machines"
              color="#4ecdc4"
              desc="Music states, transitions, stingers, RTPCs, and events — all on one node graph. Drag to connect. See the whole system at a glance."
            />
            <FeatureCard
              icon="≡"
              title="Stem-Level Control"
              color="#a855f7"
              desc="Mute, solo, fade, and trim individual stems per asset. Prototype 'melody drops out when boss hits 50%' before your composer writes it."
            />
            <FeatureCard
              icon="▶"
              title="Live Audition"
              color="#e94560"
              desc="Transport bar walks the graph, plays each state, crossfades transitions, fires stingers. Quick mode previews every transition in ~20s."
            />
            <FeatureCard
              icon="◐"
              title="Status & Handoff"
              color="#f59e0b"
              desc="Every node gets a status (placeholder, WIP, review, approved, final). Link Jira tickets. Export handoff docs in four formats."
            />
            <FeatureCard
              icon="★"
              title="Director Notes"
              color="#818cf8"
              desc="Attach intent to every node. 'This should feel like a hug if the hug was also a threat.' Composers and audio programmers read the same source of truth."
            />
            <FeatureCard
              icon="⎔"
              title="Multi-Project Canvas"
              color="#4ecdc4"
              desc="Switch between projects and levels instantly. Lock to a single game for single-game teams. 6 complete demo projects shipping now."
            />
          </div>
        </div>
      </section>

      {/* ═══ CTA / Waitlist ═══ */}
      <section id="waitlist" className="py-24 px-6 border-t border-canvas-accent/20">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-canvas-highlight mb-3">Early Access</p>
          <h2 className="text-3xl md:text-4xl font-black mb-4">Get in before it hits middleware.</h2>
          <p className="text-sm text-canvas-muted mb-8 leading-relaxed">
            Score Canvas is in active development. The first cohort gets early access, deep input on the roadmap, and Wwise Sync at cost.
          </p>

          {submitted ? (
            <div className="bg-[#0d0d1a] border border-green-500/30 rounded-xl p-6">
              <div className="text-2xl mb-2">✓</div>
              <div className="text-sm font-bold text-green-400 mb-1">You're on the list.</div>
              <div className="text-xs text-canvas-muted">We'll be in touch. Meanwhile, <a href="#app" className="text-canvas-highlight hover:underline">try the live demo →</a></div>
            </div>
          ) : (
            <form
              ref={formRef}
              name="waitlist"
              method="POST"
              data-netlify="true"
              onSubmit={handleSubmit}
              className="flex gap-2"
            >
              <input type="hidden" name="form-name" value="waitlist" />
              <input type="hidden" name="bot-field" />
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@studio.com"
                required
                className="flex-1 bg-[#0d0d1a] border border-canvas-accent rounded-xl px-4 py-3 text-sm text-canvas-text placeholder:text-canvas-muted/50 focus:outline-none focus:border-canvas-highlight"
              />
              <button
                type="submit"
                className="px-6 py-3 text-sm font-bold rounded-xl bg-canvas-highlight text-white hover:bg-canvas-highlight/80 transition-colors shadow-lg shadow-canvas-highlight/25"
              >
                Join Waitlist
              </button>
            </form>
          )}

          <p className="text-[10px] text-canvas-muted/60 mt-6 italic">
            Built by Ted Kocher, Lead Music Designer at PlayStation Studios.
            <br/>
            17 years of watching brilliant people suffer through exactly this — at every AAA game company.
          </p>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="py-10 px-6 border-t border-canvas-accent/20">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-canvas-muted">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-canvas-highlight flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 14 14" fill="none" className="text-white">
                <path d="M2 4h3v6H2zM6 2h2v10H6zM9 5h3v5H9z" fill="currentColor" opacity="0.9"/>
              </svg>
            </div>
            <span>Score Canvas · v2 preview</span>
          </div>
          <div className="font-mono text-[10px] text-canvas-muted/60">
            Design. Audition. Deliver.
          </div>
        </div>
      </footer>
    </div>
  );
}
