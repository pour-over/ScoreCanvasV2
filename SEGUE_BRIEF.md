# SEGUE — Project Brief

*For handing off to a fresh Claude Code session building the Segue service.*

## What is SEGUE?

SEGUE (*seg-way*, n. a smooth transition from one piece of music to another) is an AI-powered music generation service that solves the **"X→Y music problem"** — the core challenge of adaptive music: *how do I get cleanly from music X to music Y?*

It's the AI backend to a node-based game audio design tool called **Score Canvas** (already live at scorecanvas.io). Score Canvas handles the system design and auditioning. SEGUE handles the generation.

**The pitch:** You provide a clean theme. You get an entire score. Any genre. Any direction. Instantly.

## Who built it + why

Ted Kocher, 18-year AAA game music designer, spent close to 20 years solving X→Y music transitions in editorial. SEGUE is the productized version of that expertise — the first AI music tool designed around *state machines*, not just "make music."

## What SEGUE must do

Six capabilities, all operating on **stems** (separated instrument layers), not mixed tracks:

1. **Stem variations** — "Less intense. Swap strings for synths. Add tension." Generate new versions of an existing stem, staying in the same key/BPM.
2. **Custom intros** — AI-generated intros that match a target theme's key, BPM, and vibe.
3. **Custom endings / endtags** — cadential resolutions, fade-out tails.
4. **Custom transitions** — seamless bridges between any two music states. Not crossfades — actual musical writing with appropriate voice leading.
5. **AI stem split** — take a mixed track, return isolated stems (drums, bass, melody, pads).
6. **Analyze & tag** — auto-extract key, tempo, mood, instruments, intensity.

## Tech direction

- **Generation backend**: Suno API via **Kie.ai** (https://kie.ai — Suno proxy with dev-friendly pricing)
- **Stem split**: Likely Demucs / Spleeter / Moises API
- **Analysis**: Essentia.js or similar audio-feature extractors
- Target latency: ~4 seconds per variant

## Integration with Score Canvas

Score Canvas already has a UI and waitlist flow that promises SEGUE. Key integration surfaces:

- **Score Canvas UI** dispatches a `window.dispatchEvent(new Event("open-segue"))` event when users click any AI button (Generate Variation / Intro / Endtag / Transition / Split Stems / Analyze & Tag) → opens the roadmap teaser panel.
- **Waitlist form**: Netlify Forms on scorecanvas.io, form name `waitlist`, fields: `email`, `source`. SEGUE signup should flow through the same form with `source=segue-signup`.
- **Key file that specifies SEGUE's UX/promises**: `src/components/SeguePanel.tsx` in the ScoreCanvasV2 repo — this is the spec-as-code for what SEGUE must deliver in v1.

## Score Canvas repos (for deeper context)

- **Public repo**: `pour-over/ScoreCanvasV2` on GitHub
- **Local path**: `/Users/tedkocher/Desktop/ClaudeCode/ScoreCanvasV2`
- **Live site**: https://scorecanvas.io
- **Staging**: https://score-canvas-v2.netlify.app

## Suggested architecture

```
segue/
├── api/                    # Node/Python service
│   ├── routes/
│   │   ├── generate.ts     # POST /generate (variation|intro|endtag|transition)
│   │   ├── split.ts        # POST /split (stem separation)
│   │   └── analyze.ts      # POST /analyze (key/tempo/mood tagging)
│   ├── kie/                # Kie.ai Suno wrapper
│   ├── storage/            # S3/R2 for input + generated audio
│   └── queue/              # Job queue for async generation
├── sdk/                    # TypeScript SDK for Score Canvas to consume
│   ├── client.ts           # SegueClient class
│   └── types.ts
├── web/                    # Optional: standalone SEGUE playground
└── README.md
```

**First endpoint to build**: `POST /generate` with body `{ sourceUrl, kind: "variation", prompt, targetKey, targetBpm }` → returns `{ jobId }`, then `GET /job/:id` returns `{ status, outputs[] }`.

## Suggested first tasks

1. Scaffold the API (Fastify / Hono) with a Kie.ai client wrapper — stub out `/generate` to hit Suno and return a job ID.
2. Build the stem-variation endpoint first (highest leverage — hits the core X→Y use case).
3. Define the TypeScript SDK interface that Score Canvas will consume, so the Score Canvas integration can be stubbed in parallel.
4. Get one end-to-end variation working (upload WAV → Suno gen → downloadable output).
5. Iterate from there: intros → endtags → transitions → stem split → analyze.

## Constraints & design principles

- **Stem-aware from day 1**: everything operates on isolated stems, not mixed tracks. The "X→Y" framing only works when you can target specific layers.
- **Key/BPM preserved by default**: generated output must match the source theme musically. No accidental modulations.
- **Async, with preview**: users should see a generating state + hear a 10-second preview ASAP, full output later.
- **Editorially opinionated**: SEGUE is not a general-purpose music AI. It's a transition engine. The prompt scaffolding should enforce that ("generate a 4-bar bridge from [key,bpm,mood] A to [key,bpm,mood] B").
- **The name matters**: segues are what editors do. The product experience should feel like hiring a very fast, very musical editor — not a slot machine.

## Not in scope for v1

- Mixing / mastering (stay at stem level)
- MIDI export (Ted's call — focus on audio-first)
- Real-time / streaming generation (async is fine)
- Multi-user collaboration (that's Score Canvas's job)

## Open questions to resolve with Ted

- Pricing model (per-generation? subscription? cost+ for first cohort?)
- Where does rendered output live (S3, R2, hosted by SEGUE, or pushed back to user storage)?
- How does SEGUE know the musical "intent" of a transition — does Score Canvas pass context from its graph (source/target music state, director notes, RTPCs), or does SEGUE infer?

## Tone

Ted's brand voice: knowledgeable but dry-humored, industry-insider, never overselling. Avoid "revolutionary AI" marketing language. Talk like a veteran who's done this 1000 times and finally has the right tool.

---

**Start here:**
1. `mkdir ~/Desktop/ClaudeCode/Segue && cd ~/Desktop/ClaudeCode/Segue`
2. Create a new GitHub repo `pour-over/Segue` (private until API is stable)
3. Pick your stack (Node+TypeScript recommended for SDK parity with Score Canvas) and scaffold `api/` + `sdk/`
4. Read `SeguePanel.tsx` in the ScoreCanvasV2 repo — it's the visual spec.
5. Sign up for kie.ai, grab an API key, and get one stem variation working end-to-end.
