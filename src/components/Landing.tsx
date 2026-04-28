import { useState, useEffect, useRef } from "react";
import { SegueDemoGallery } from "./SegueDemoGallery";
import { projects as demoProjects } from "../data/projects";

// Short-name list for the demo-roster blurb. Strips colons and grabs the
// first ~12 chars of each title so the copy reads as a list, not a wall.
const exampleProjects = demoProjects.slice(1).map((p) => {
  const head = p.name.split(":")[0].trim();
  return head.length > 16 ? head.slice(0, 14) + "…" : head;
});
const exampleHeadline = exampleProjects.slice(0, 3).join(", ")
  + (exampleProjects.length > 3 ? ", more" : "");

// ─── Animated node graph mock — mirrors real-app node anatomy ───────────────

interface HeroNode {
  x: number;
  y: number;
  title: string;
  type: "event" | "music" | "transition" | "stinger" | "parameter";
  color: string;
  status: "TEMP" | "WIP" | "DRAFT" | "REVIEW" | "APPROVED";
  id: string;        // ID chip text (JOUR-101 style)
  intensity?: number; // 0-100, for music-state intensity bar
  paramValue?: number; // 0-100, for RTPC nodes — drawn as a knob position
}

const TYPE_META: Record<HeroNode["type"], { icon: string; label: string }> = {
  event:      { icon: "▶", label: "CINEMATIC"   },
  music:      { icon: "♪", label: "MUSIC STATE" },
  transition: { icon: "→", label: "TRANSITION"  },
  stinger:    { icon: "⚡", label: "STINGER"     },
  parameter:  { icon: "◐", label: "RTPC"        },
};

/** Workflow status pill styling — five distinct states a music designer cycles
 * a cue through. Visibly different at a glance so the graph reads as a project
 * at multiple stages of completion, not a uniform thing. */
const STATUS_META: Record<HeroNode["status"], { icon: string; fg: string; bg: string; bd: string }> = {
  TEMP:     { icon: "◔", fg: "#fbbf24", bg: "rgba(251,191,36,0.15)", bd: "rgba(251,191,36,0.4)"  }, // amber
  WIP:      { icon: "✎", fg: "#fb923c", bg: "rgba(251,146,60,0.15)", bd: "rgba(251,146,60,0.4)"  }, // orange
  DRAFT:    { icon: "✏", fg: "#94a3b8", bg: "rgba(148,163,184,0.15)", bd: "rgba(148,163,184,0.4)" }, // slate
  REVIEW:   { icon: "👁", fg: "#a78bfa", bg: "rgba(167,139,250,0.15)", bd: "rgba(167,139,250,0.4)" }, // violet
  APPROVED: { icon: "✓", fg: "#22c55e", bg: "rgba(34,197,94,0.18)",  bd: "rgba(34,197,94,0.4)"   }, // green
};

function AnimatedGraph() {
  const [activeNode, setActiveNode] = useState(0);

  const nodes: HeroNode[] = [
    { x: 100, y: 165, title: "Opening Cinematic", type: "event",      color: "#e94560", status: "TEMP",     id: "JOUR-101" },
    { x: 320, y: 155, title: "Explore Theme",     type: "music",      color: "#4ecdc4", status: "APPROVED", id: "JOUR-102", intensity: 35 },
    { x: 540, y: 215, title: "Crossfade",         type: "transition", color: "#818cf8", status: "WIP",      id: "JOUR-103" },
    { x: 760, y: 155, title: "Combat Intense",    type: "music",      color: "#4ecdc4", status: "REVIEW",   id: "JOUR-104", intensity: 80 },
    { x: 320, y: 295, title: "Death Sting",       type: "stinger",    color: "#f97316", status: "DRAFT",    id: "JOUR-105" },
    { x: 940, y: 215, title: "Victory Fanfare",   type: "music",      color: "#4ecdc4", status: "APPROVED", id: "JOUR-106", intensity: 65 },
    { x: 760, y: 50,  title: "Combat Intensity",  type: "parameter",  color: "#a855f7", status: "WIP",      id: "JOUR-107", paramValue: 72 },
  ];
  const edges: Array<[number, number, boolean]> = [
    // [from, to, conditional?]
    [0, 1, false], [1, 2, false], [2, 3, false], [3, 5, false],
    [1, 4, true], [4, 1, true],
    [6, 3, true], // RTPC drives Combat Intense — conditional/dashed
  ];

  useEffect(() => {
    const interval = setInterval(() => setActiveNode((n) => (n + 1) % nodes.length), 2200);
    return () => clearInterval(interval);
  }, [nodes.length]);

  const NW = 168;  // node width
  const NH = 84;   // node height

  return (
    <svg
      viewBox="0 0 1080 380"
      className="w-full max-w-4xl mx-auto"
      style={{ filter: "drop-shadow(0 0 60px rgba(78,205,196,0.18))" }}
    >
      {/* Edges */}
      {edges.map(([from, to, conditional], i) => {
        const a = nodes[from];
        const b = nodes[to];
        const fromActive = from === activeNode;
        const stroke = fromActive ? a.color : "#3a3a5c";
        const opacity = fromActive ? 0.9 : 0.55;
        return (
          <g key={i}>
            <line
              x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={stroke}
              strokeWidth={fromActive ? 2 : 1.5}
              strokeDasharray={conditional ? "6 5" : "none"}
              opacity={opacity}
            />
            {/* Traveling data-pulse along an edge leaving the active node */}
            {fromActive && (
              <circle r="3.5" fill={a.color}>
                <animate attributeName="cx" values={`${a.x};${b.x}`} dur="1.4s" repeatCount="indefinite" />
                <animate attributeName="cy" values={`${a.y};${b.y}`} dur="1.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0;1;1;0" dur="1.4s" repeatCount="indefinite" />
              </circle>
            )}
          </g>
        );
      })}

      {/* Nodes */}
      {nodes.map((n, i) => {
        const isActive = i === activeNode;
        const meta = TYPE_META[n.type];
        const x0 = n.x - NW / 2;
        const y0 = n.y - NH / 2;

        return (
          <g key={i}>
            {/* Active ripple */}
            {isActive && (
              <>
                <rect
                  x={x0 - 6} y={y0 - 6} width={NW + 12} height={NH + 12} rx={14}
                  fill="none" stroke={n.color} strokeWidth="1.5" opacity="0.5"
                >
                  <animate attributeName="opacity" values="0.6;0.05;0.6" dur="2.2s" repeatCount="indefinite" />
                  <animate attributeName="stroke-width" values="1.5;3;1.5" dur="2.2s" repeatCount="indefinite" />
                </rect>
                <rect
                  x={x0 - 14} y={y0 - 14} width={NW + 28} height={NH + 28} rx={18}
                  fill="none" stroke={n.color} strokeWidth="1" opacity="0.25"
                >
                  <animate attributeName="opacity" values="0.3;0;0.3" dur="2.2s" repeatCount="indefinite" />
                </rect>
              </>
            )}

            {/* Body */}
            <rect
              x={x0} y={y0} width={NW} height={NH} rx={10}
              fill={isActive ? "#13132a" : "#0d0d1a"}
              stroke={isActive ? n.color : "#3a3a5c"}
              strokeWidth={isActive ? 1.8 : 1}
            />
            {/* Left accent stripe (matches real nodes' category color) */}
            <rect x={x0} y={y0} width="3" height={NH} rx={1.5} fill={n.color} opacity={isActive ? 1 : 0.7} />

            {/* Category strip — icon + label */}
            <g opacity={isActive ? 1 : 0.85}>
              <text x={x0 + 14} y={y0 + 18} fontSize="11" fontFamily="monospace" fill={n.color}>
                {meta.icon}
              </text>
              <text x={x0 + 28} y={y0 + 18} fontSize="9" fontFamily="monospace" fill={n.color} letterSpacing="0.12em">
                {meta.label}
              </text>
            </g>

            {/* Play indicator top-right */}
            <g opacity={isActive ? 1 : 0.45}>
              <circle cx={x0 + NW - 14} cy={y0 + 14} r={7} fill="none" stroke={isActive ? n.color : "#5a5a7c"} strokeWidth="1" />
              <polygon
                points={`${x0 + NW - 16},${y0 + 11} ${x0 + NW - 16},${y0 + 17} ${x0 + NW - 11},${y0 + 14}`}
                fill={isActive ? n.color : "#5a5a7c"}
              />
            </g>

            {/* Title */}
            <text
              x={x0 + 14} y={y0 + 44}
              fontSize="13" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif"
              fill={isActive ? "#ffffff" : "#c8c8d8"}
            >
              {n.title}
            </text>

            {/* Footer: status pill + ID chip + (music-only) intensity bar */}
            <g opacity={isActive ? 1 : 0.78}>
              {(() => {
                const sm = STATUS_META[n.status];
                const pillW = n.status.length * 6 + 22;
                return (
                  <>
                    {/* Status pill */}
                    <rect
                      x={x0 + 12} y={y0 + NH - 22} width={pillW} height={14} rx={3}
                      fill={sm.bg} stroke={sm.bd} strokeWidth="0.6"
                    />
                    <text
                      x={x0 + 18} y={y0 + NH - 12}
                      fontSize="8" fontFamily="monospace" letterSpacing="0.08em" fill={sm.fg}
                    >
                      {sm.icon} {n.status}
                    </text>
                  </>
                );
              })()}
              {/* ID chip (right side) */}
              <text
                x={x0 + NW - 12} y={y0 + NH - 12}
                fontSize="8" fontFamily="monospace" textAnchor="end"
                fill="#5a5a7c"
              >
                {n.id}
              </text>
            </g>

            {/* Intensity bar for music states (only) */}
            {n.intensity !== undefined && (
              <g>
                <rect x={x0 + 14} y={y0 + 60} width={NW - 28} height={2} rx={1} fill="#1e1e3a" />
                <rect
                  x={x0 + 14} y={y0 + 60}
                  width={(NW - 28) * (n.intensity / 100)} height={2} rx={1}
                  fill={n.color} opacity={isActive ? 1 : 0.7}
                >
                  {isActive && (
                    <animate
                      attributeName="width"
                      values={`${(NW - 28) * 0.2};${(NW - 28) * (n.intensity / 100)};${(NW - 28) * 0.2}`}
                      dur="2.2s" repeatCount="indefinite"
                    />
                  )}
                </rect>
              </g>
            )}

            {/* RTPC value: knob arc + numeric readout */}
            {n.paramValue !== undefined && (() => {
              const cx = x0 + NW - 30;
              const cy = y0 + 56;
              const r = 9;
              // Sweep from -135° (bottom-left) to +135° (bottom-right) = 270° arc
              const startA = -Math.PI * 0.75;
              const endA = startA + (Math.PI * 1.5) * (n.paramValue / 100);
              const tickX = cx + r * Math.cos(endA);
              const tickY = cy + r * Math.sin(endA);
              return (
                <g opacity={isActive ? 1 : 0.7}>
                  {/* Knob ring */}
                  <circle cx={cx} cy={cy} r={r} fill="none" stroke="#3a3a5c" strokeWidth="1.5" />
                  {/* Filled arc up to current value (approximate via two short segments) */}
                  <path
                    d={`M ${cx + r * Math.cos(startA)} ${cy + r * Math.sin(startA)}
                        A ${r} ${r} 0 ${(n.paramValue / 100) > 0.5 ? 1 : 0} 1 ${tickX} ${tickY}`}
                    fill="none" stroke={n.color} strokeWidth="2" strokeLinecap="round"
                  >
                    {isActive && (
                      <animate
                        attributeName="stroke-dasharray"
                        values="0 100;100 100;0 100"
                        dur="3s" repeatCount="indefinite"
                      />
                    )}
                  </path>
                  {/* Pointer */}
                  <line x1={cx} y1={cy} x2={tickX} y2={tickY} stroke={n.color} strokeWidth="1.5" strokeLinecap="round" />
                  {/* Numeric readout to the left of the knob */}
                  <text x={cx - r - 6} y={cy + 4} fontSize="11" fontFamily="monospace" textAnchor="end" fill={n.color} fontWeight="700">
                    {n.paramValue}
                  </text>
                </g>
              );
            })()}

            {/* Active LED indicator (waveform-ish) bottom-left of category strip */}
            {isActive && (
              <g>
                {[0, 1, 2].map((bi) => (
                  <rect
                    key={bi}
                    x={x0 + NW - 38 + bi * 5} y={y0 + 12}
                    width="2.5" height="8" rx={0.8}
                    fill="#4ade80"
                  >
                    <animate
                      attributeName="height"
                      values={`${4 + bi * 2};${10 - bi};${4 + bi * 2}`}
                      dur={`${0.6 + bi * 0.15}s`}
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="y"
                      values={`${y0 + 16 - bi};${y0 + 13};${y0 + 16 - bi}`}
                      dur={`${0.6 + bi * 0.15}s`}
                      repeatCount="indefinite"
                    />
                  </rect>
                ))}
              </g>
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
          </div>
          <div className="flex items-center gap-4">
            <a href="#workflow" className="text-xs text-canvas-muted hover:text-canvas-text transition-colors">Workflow</a>
            <a href="#for-teams" className="text-xs text-canvas-muted hover:text-canvas-text transition-colors">For Teams</a>
            <a href="#features" className="text-xs text-canvas-muted hover:text-canvas-text transition-colors">Features</a>
            <a href="#hear-it" className="text-xs text-canvas-muted hover:text-canvas-text transition-colors">Hear It</a>
            <a href="#for-studios" className="text-xs text-canvas-muted hover:text-canvas-text transition-colors">For Studios</a>
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
              Forged in 18 years of AAA game music design
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-5 leading-[1.05]">
            The visual interactive<br/>
            <span className="bg-gradient-to-r from-canvas-highlight to-[#4ecdc4] bg-clip-text text-transparent">
              music engine
            </span>{" "}for games.
          </h1>

          <p className="text-xl text-canvas-muted max-w-2xl mx-auto mb-8 font-semibold tracking-wide">
            Design. Iterate. Review. Ship.
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

      {/* ═══ Four-Verb Workflow: Design / Iterate / Review / Ship ═══ */}
      <section id="workflow" className="py-24 px-6 border-t border-canvas-accent/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-canvas-highlight mb-3">The Workflow</p>
            <h2 className="text-3xl md:text-4xl font-black mb-3">Four steps. The whole loop.</h2>
            <p className="text-sm text-canvas-muted max-w-xl mx-auto">
              Music systems aren't designed once. They're iterated on for months. Score Canvas is built for that loop, not against it.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <VerbCard
              verb="Design"
              tagline="Step One"
              icon="✎"
              color="#4ecdc4"
              desc="Drag, connect, structure your music system visually. Music states, transitions, stingers, RTPCs, events — one canvas you can read at a glance."
            />
            <VerbCard
              verb="Iterate"
              tagline="Step Two"
              icon="↻"
              color="#a855f7"
              desc="Audition every node live. Generate variations with Segue. Save favorites, compare A/B, never lose a take. The good ideas stay; the rest are one undo away."
            />
            <VerbCard
              verb="Review"
              tagline="Step Three"
              icon="◐"
              color="#e94560"
              desc="Send a share link to your VP, producer, or composer. They open one URL and walk the graph — every node has director notes already attached. No audio call required."
            />
            <VerbCard
              verb="Ship"
              tagline="Step Four"
              icon="⇢"
              color="#818cf8"
              desc="Export Wwise-ready schemas, FMOD templates, or JSON. Audio programmers get production-perfect specs — not a 40-page doc and a prayer."
            />
          </div>
        </div>
      </section>

      {/* ═══ The 60-Second Pitch ═══ */}
      <section className="py-20 px-6 border-t border-canvas-accent/20 bg-gradient-to-b from-transparent via-canvas-highlight/5 to-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-canvas-highlight mb-3">The 60-Second Pitch</p>
            <h2 className="text-3xl md:text-4xl font-black mb-4 leading-tight">
              Hand it to a producer.<br/>
              <span className="bg-gradient-to-r from-canvas-highlight to-[#4ecdc4] bg-clip-text text-transparent">In 60 seconds, they get it.</span>
            </h2>
            <p className="text-sm text-canvas-muted max-w-2xl mx-auto leading-relaxed">
              Adaptive music is normally invisible to everyone except the audio team. With Score Canvas, the whole system is one graph — auditionable, annotated, and readable by anyone on the dev team.
              A checked-out VP can scan it. A checked-in producer can audit it. A creative director can walk it with their composer. <em>Without an audio call.</em>
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-black text-canvas-highlight mb-2">60s</div>
              <div className="text-xs font-mono uppercase tracking-wider text-canvas-muted">To grok any music system</div>
              <div className="text-[10px] text-canvas-muted/60 mt-1">Without prior audio knowledge</div>
            </div>
            <div>
              <div className="text-4xl font-black text-canvas-highlight mb-2">0 pages</div>
              <div className="text-xs font-mono uppercase tracking-wider text-canvas-muted">Of design documentation replaced</div>
              <div className="text-[10px] text-canvas-muted/60 mt-1">(one shareable graph instead)</div>
            </div>
            <div>
              <div className="text-4xl font-black text-canvas-highlight mb-2">{demoProjects.length}</div>
              <div className="text-xs font-mono uppercase tracking-wider text-canvas-muted">Full demo projects shipping now</div>
              <div className="text-[10px] text-canvas-muted/60 mt-1">Hello tutorial · {exampleHeadline}</div>
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

      {/* ═══ Hear It — playable demo, evidence before promise ═══ */}
      <section id="hear-it" className="py-24 px-6 border-t border-canvas-accent/20 bg-gradient-to-b from-purple-500/5 via-transparent to-transparent">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-purple-300 mb-3">Hear It</p>
            <h2 className="text-3xl md:text-4xl font-black mb-3">One cue in.<br/><span className="bg-gradient-to-r from-purple-300 to-cyan-300 bg-clip-text text-transparent">Variations, transitions, intros, endings out.</span></h2>
            <p className="text-sm text-canvas-muted max-w-xl mx-auto leading-relaxed">
              Press play on the source cue at the top. Then play any of the variations, level themes, stingers, intros, or transitions underneath. Each one is the kind of output Segue is being designed to generate from a single starting cue.
            </p>
          </div>
          <div className="bg-[#0d0d1a]/80 border border-purple-500/30 rounded-2xl p-5 md:p-6">
            <SegueDemoGallery />
          </div>
          <p className="text-[11px] text-canvas-muted/60 text-center mt-5 leading-relaxed">
            That's a preview of what Segue does. <a href="#roadmap" className="text-canvas-highlight hover:underline">See the full roadmap ↓</a>
          </p>
        </div>
      </section>

      {/* ═══ Roadmap: SEGUE + Wwise Sync ═══ */}
      <section id="roadmap" className="py-24 px-6 border-t border-canvas-accent/20 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-canvas-highlight mb-3">On the Roadmap</p>
            <h2 className="text-3xl md:text-4xl font-black mb-3">Two bets we're building toward.</h2>
            <p className="text-sm text-canvas-muted max-w-xl mx-auto">
              Live middleware sync. AI-generated score variations. Both shipping next.
            </p>
          </div>

          {/* ─── SEGUE — slim pitch card, hands off to the Hear It section ─── */}
          <div className="bg-[#0d0d1a]/80 border border-purple-500/50 rounded-2xl p-8 relative overflow-hidden mb-6">
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-300">Coming v2.5</span>
            </div>

            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-purple-300/80 mb-2">SEGUE · Variation &amp; Transition Machine</div>
            <h3 className="text-2xl md:text-3xl font-black mb-3 leading-tight max-w-xl">
              <span className="bg-gradient-to-r from-purple-300 to-cyan-300 bg-clip-text text-transparent">A music variation</span> and transition machine.
            </h3>
            <p className="text-sm text-canvas-muted leading-relaxed mb-4 max-w-2xl">
              Take any cue from your project. Generate variations, extend it, build a matched intro or ending, or write a real X→Y bridge to another cue. Every adaptive music system is just this question asked a hundred times — <span className="text-canvas-text font-semibold">"how do I get from X music to Y music, cleanly?"</span> SEGUE is the tool that answers it. Instrumental, always.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
              <div className="text-[11px] text-canvas-muted leading-snug flex items-start gap-2"><span className="text-purple-400 mt-0.5">✦</span> Stem variations</div>
              <div className="text-[11px] text-canvas-muted leading-snug flex items-start gap-2"><span className="text-purple-400 mt-0.5">⤴</span> Matched intros &amp; endings</div>
              <div className="text-[11px] text-canvas-muted leading-snug flex items-start gap-2"><span className="text-purple-400 mt-0.5">↔</span> Real X→Y transitions</div>
              <div className="text-[11px] text-canvas-muted leading-snug flex items-start gap-2"><span className="text-purple-400 mt-0.5">≡</span> AI stem split</div>
            </div>

            <a
              href="#hear-it"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-lg bg-purple-500/20 border border-purple-500/50 text-purple-200 hover:bg-purple-500/30 hover:border-purple-500/70 transition-colors"
            >
              ↑ Hear what this sounds like
            </a>
          </div>

          {/* ─── Wwise Live Sync — second card, equal weight ─── */}
          <div className="bg-[#0d0d1a]/80 border border-canvas-highlight/40 rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-canvas-highlight/20 border border-canvas-highlight/40">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-canvas-highlight">Coming v2.5</span>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#4ecdc4] mb-2">Live Wwise Sync</div>
                <h3 className="text-2xl font-black mb-3">Connect directly to your Wwise session.</h3>
                <p className="text-sm text-canvas-muted leading-relaxed mb-4">
                  The real handoff. Not a template file — a live connection to your session. Design in Score Canvas, audition in-browser, push to Wwise with one click.
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

          <div className="mt-8 text-center">
            <p className="text-[11px] text-canvas-muted/60">
              Both shipping next. <a href="#waitlist" className="text-canvas-highlight hover:underline">Get notified →</a>
            </p>
          </div>
        </div>
      </section>

      {/* ═══ Built for Studios — Enterprise / SSO / Bulk Import roadmap ═══ */}
      <section id="for-studios" className="py-24 px-6 border-t border-canvas-accent/20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-canvas-highlight mb-3">Built for Studios</p>
            <h2 className="text-3xl md:text-4xl font-black mb-3">Send it to anyone on the dev team.</h2>
            <p className="text-sm text-canvas-muted max-w-2xl mx-auto leading-relaxed">
              Score Canvas runs in a browser tab — no installs, no Wwise license, no special hardware. Which means it travels everywhere a build doc does, but actually plays. CorpIT-friendly by design.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {/* SSO */}
            <div className="bg-[#0d0d1a]/80 border border-canvas-accent/40 rounded-xl p-5 hover:border-canvas-highlight/40 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <div className="text-2xl">🔐</div>
                <div className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-canvas-highlight/20 text-canvas-highlight border border-canvas-highlight/30 ml-auto">Roadmap</div>
              </div>
              <h3 className="text-sm font-bold text-canvas-text mb-1.5">SSO &amp; Identity</h3>
              <p className="text-xs text-canvas-muted leading-relaxed">
                Okta, Azure AD, Google Workspace via SAML / OIDC. Studio CorpIT can roll Score Canvas into the existing identity stack — no shadow accounts, no security review nightmare.
              </p>
            </div>

            {/* Secure sharing */}
            <div className="bg-[#0d0d1a]/80 border border-canvas-accent/40 rounded-xl p-5 hover:border-canvas-highlight/40 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <div className="text-2xl">🔗</div>
                <div className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-canvas-highlight/20 text-canvas-highlight border border-canvas-highlight/30 ml-auto">Roadmap</div>
              </div>
              <h3 className="text-sm font-bold text-canvas-text mb-1.5">Secure Share Links</h3>
              <p className="text-xs text-canvas-muted leading-relaxed">
                Send a single URL to a VP, producer, or external composer. View-only or comment-only. Expiring links, watermarking, audit trail. The UX of a Figma share, scoped for studios.
              </p>
            </div>

            {/* Compliance */}
            <div className="bg-[#0d0d1a]/80 border border-canvas-accent/40 rounded-xl p-5 hover:border-canvas-highlight/40 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <div className="text-2xl">✓</div>
                <div className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-canvas-highlight/20 text-canvas-highlight border border-canvas-highlight/30 ml-auto">Roadmap</div>
              </div>
              <h3 className="text-sm font-bold text-canvas-text mb-1.5">Compliance-Ready</h3>
              <p className="text-xs text-canvas-muted leading-relaxed">
                SOC 2 Type II, GDPR, role-based access (audio lead / collaborator / viewer / external), per-project audit logs. The boring stuff CorpIT actually asks about.
              </p>
            </div>

            {/* Bulk import */}
            <div className="bg-[#0d0d1a]/80 border border-canvas-accent/40 rounded-xl p-5 hover:border-canvas-highlight/40 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <div className="text-2xl">⤓</div>
                <div className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-canvas-highlight/20 text-canvas-highlight border border-canvas-highlight/30 ml-auto">Roadmap</div>
              </div>
              <h3 className="text-sm font-bold text-canvas-text mb-1.5">Bulk Import</h3>
              <p className="text-xs text-canvas-muted leading-relaxed">
                Drag-drop a CSV, JSON, Wwise <code className="text-[10px] text-canvas-highlight">.wproj</code>, or Markdown table. Hundreds of music states, transitions, RTPCs imported in one shot. Onboard a real game in a day instead of a week.
              </p>
            </div>

            {/* Team workspaces */}
            <div className="bg-[#0d0d1a]/80 border border-canvas-accent/40 rounded-xl p-5 hover:border-canvas-highlight/40 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <div className="text-2xl">👥</div>
                <div className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-canvas-highlight/20 text-canvas-highlight border border-canvas-highlight/30 ml-auto">Roadmap</div>
              </div>
              <h3 className="text-sm font-bold text-canvas-text mb-1.5">Team Workspaces</h3>
              <p className="text-xs text-canvas-muted leading-relaxed">
                Multiple games per studio, each with its own roster. Multi-cursor co-editing on the canvas. Comment threads on nodes, like a design tool.
              </p>
            </div>

            {/* On-prem */}
            <div className="bg-[#0d0d1a]/80 border border-canvas-accent/40 rounded-xl p-5 hover:border-canvas-highlight/40 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <div className="text-2xl">🏢</div>
                <div className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-canvas-highlight/20 text-canvas-highlight border border-canvas-highlight/30 ml-auto">Roadmap</div>
              </div>
              <h3 className="text-sm font-bold text-canvas-text mb-1.5">On-Prem &amp; Air-Gapped</h3>
              <p className="text-xs text-canvas-muted leading-relaxed">
                For studios with NDA-locked unreleased music: self-hosted Docker option, no internet egress required. Same product, your network.
              </p>
            </div>
          </div>

          <div className="text-center mt-6">
            <p className="text-[11px] text-canvas-muted/60">
              Studio licensing &amp; security review packets available on request. <a href="#waitlist" className="text-canvas-highlight hover:underline">Join the waitlist →</a>
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
              desc="Mute and solo individual stems while you preview a cue. Prototype 'melody drops out when boss hits 50%' before your composer writes it."
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
              desc={`Switch between projects and levels instantly. Lock to a single game for single-game teams. ${demoProjects.length} demo projects ship now — a tutorial-grade Hello plus full game-themed examples.`}
            />
          </div>
        </div>
      </section>

      {/* ═══ CTA / Waitlist ═══ */}
      <section id="waitlist" className="py-24 px-6 border-t border-canvas-accent/20">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-canvas-highlight mb-3">Early Access</p>
          <h2 className="text-3xl md:text-4xl font-black mb-4">Get in while we're still listening.</h2>
          <p className="text-sm text-canvas-muted mb-8 leading-relaxed">
            Score Canvas is in active development. Drop your email and you'll be the first to know when new things ship — Wwise Sync, Segue, bulk import, and the rest of the roadmap.
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
            Built by <a href="https://tedkocher.com" target="_blank" rel="noopener" className="text-canvas-highlight hover:underline">Ted Kocher</a> — a Lead Music Designer with 18 years in AAA games.
            <br/>
            Eighteen years of watching brilliant people suffer through exactly this at every major studio.
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
            <span>Score Canvas</span>
          </div>
          <div className="font-mono text-[10px] text-canvas-muted/60">
            Design. Iterate. Review. Ship.
          </div>
        </div>
      </footer>
    </div>
  );
}
