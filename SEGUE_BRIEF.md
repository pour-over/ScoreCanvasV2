# SEGUE — Project Brief

*For handing off to a fresh Claude Code session building the Segue service.*

## What is SEGUE?

SEGUE (*seg-way*, n. a smooth transition from one piece of music to another) is an AI-powered music generation service that solves the **"X→Y music problem"** — the core challenge of adaptive music: *how do I get cleanly from music X to music Y?*

It's the AI backend to a node-based game audio design tool called **Score Canvas** (already live at scorecanvas.io). Score Canvas handles the system design and auditioning. SEGUE handles the generation.

**The pitch:** A music variation and transition machine. Bring one cue from your project — Segue generates variations, extensions, custom intros, custom endings, and real X→Y transitions to other cues. Same key, same tempo, same vibe by default; any direction you ask for. Instrumental, always. Designed to augment composers, not replace them.

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

- **Generation backend**: **Suno V5** via Kie.ai (https://kie.ai). V5 is Suno's
  current public flagship — best low-end stability, best instrument separation,
  best progression coherence for transitions specifically. Kie.ai also exposes
  `V3.5`, `V4`, `V4_5`, `V4_5PLUS` as cheaper fallback tiers for bulk operations
  where quality is less critical.
- **Stem split**: Kie.ai's `Separate Vocals` endpoint only splits vocal vs.
  instrumental. For the four-way stem separation in the brief (drums / bass /
  melody / pads), use **Demucs** (htdemucs_ft model) or **Moises API** alongside.
  Run both in parallel — Demucs gives clean stems, Suno's separator is faster
  for the vocal/instrumental split when that's all you need.
- **Analysis**: Kie.ai's `Generate MIDI From Audio` endpoint gives free key /
  tempo / structure analysis as a side effect — cheaper than running Essentia.js
  for that subset of metadata. Use Essentia.js only for things MIDI extraction
  doesn't capture (mood, intensity, instrument tags).
- **Target latency**: ~4 seconds per variant on V5.

### kie.ai endpoint mapping

Each Segue capability maps to a specific kie.ai/Suno endpoint. Build the SDK
around this mapping — every `SegueClient` method should be a thin wrapper.

| Segue capability | kie.ai endpoint | Notes |
|------------------|-----------------|-------|
| Stem variation | `Generate` (custom mode, `instrumental: true`, `model: V5`) | Pass source style tags + a transformation prompt ("less intense", "swap strings for synths"). Loop until acceptable. |
| Stem variation in different genre | `Cover Generate` or `Boost Music Style` | Cover preserves structure, swaps timbre. Boost is stylistic re-prompting. |
| Custom intro | `Extend` (back-extend from theme start) | Suno V5's extend handles musical lead-ins natively. |
| Custom ending / endtag | `Extend` (forward-extend from theme end) | Same primitive, opposite direction. |
| **Custom transition (X → Y)** | `Replace Section` (5 credits) | The closest Suno primitive to a true musical bridge. Provide both source themes as concatenated input, set `infillStartS` / `infillEndS` to the bridge window, prompt the modulation. **This is the killer endpoint for Segue's whole pitch.** |
| AI stem split (vocal vs instrumental only) | `Separate Vocals` | Free / fast. Use as a pre-step before Demucs. |
| AI stem split (4-way: drums/bass/melody/pads) | Demucs `htdemucs_ft` (NOT Suno) | Suno's stem operation costs ~50 credits and is slower than Demucs while producing worse 4-way splits. Run Demucs in a worker (htdemucs_ft model, ~5–15s per track), cache results in object storage. Free per call after setup. |
| Analyze & tag (key, BPM, structure) | `Generate MIDI From Audio` | Free side effect; parse the MIDI for tempo / key / structure. |
| Analyze & tag (mood / instrument / intensity) | Essentia.js client-side | Suno doesn't expose these; do it locally. |
| Mashup / theme blending | `Mashup` | Future capability, not v1. |

### The instrumental constraint (non-negotiable)

**All Segue generations are instrumental by default. No lyrics. Ever. In
transitions, intros, endings, and stem variations.** Game music is overwhelmingly
instrumental, and a generated transition that suddenly contains lyrics destroys
the source material's narrative continuity.

Implementation rules:
- Every Suno API call must include `instrumental: true` (it's a top-level flag
  in the kie.ai `Generate` schema — never omit it).
- For "wordless vocal" textures (Halo's choral *aaahs*, *ImaginedLanguage* Latin
  chants, FromSoft monastic vocalise, Journey-style sustained *oohs*), prompt
  them as instrumental layers using descriptive style tags:
  - `wordless choir`
  - `vocalise pad`
  - `sustained ahhs no lyrics`
  - `invented-language chant, ceremonial, no English`
  - `humming choir, no words`
  Combined with `instrumental: true`, this reliably produces voice-as-texture
  without Suno hallucinating lyrics.
- If the user explicitly opts in to vocal generation (a future advanced feature,
  not v1), the SDK should require an explicit `allowLyrics: true` argument that
  defaults to `false` and is hard-disabled for transition / intro / ending kinds.
- **Test gate**: every Segue endpoint should have an automated test that asserts
  no generated output transcript contains identifiable English words. Use a
  fast speech-to-text on the output, fail the test if any word with > 90%
  confidence is detected. This protects against Suno regressions where the
  instrumental flag might be ignored.

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

1. Scaffold the API (Fastify / Hono) with a Kie.ai client wrapper — stub out
   `/generate` to hit Suno V5 (`model: "V5"`, `instrumental: true` always) and
   return a job ID.
2. Add the **instrumental test gate** before shipping any endpoint: automated
   test that runs generated output through speech-to-text and fails if
   recognizable lyrics appear. This is non-negotiable — Suno regressions on
   the `instrumental` flag are a real risk.
3. Build the **stem-variation** endpoint first (highest leverage — hits the
   core X→Y use case), using `Generate` with custom-mode + style transformation
   prompts.
4. Define the TypeScript SDK interface that Score Canvas will consume, so the
   Score Canvas integration can be stubbed in parallel.
5. Get one end-to-end variation working (upload WAV → Suno V5 gen → downloadable
   instrumental output).
6. Build the **transition** endpoint next using `Replace Section` — this is the
   killer feature, the namesake, the differentiator. Two source clips concatenated
   with an `infill` window in the middle, prompted to bridge them.
7. Iterate from there: intros (`Extend` back) → endtags (`Extend` forward) →
   stem split (`Separate Vocals` + Demucs) → analyze (`Generate MIDI From Audio`
   + Essentia.js).

## Constraints & design principles

- **Instrumental, always.** No lyrics in any Segue output. Ever. Wordless vocals
  (vocalise, choir *aaahs*, invented-language chants) are allowed and treated
  as instrumental textures with explicit style tags. See "The instrumental
  constraint" above for full implementation rules.
- **Never lose a generation.** Every output is persisted to object storage as
  soon as it renders. Never expires. Never garbage-collected. The cost is
  bytes; the value is the user's trust in the iteration loop. The moment a
  composer feels they've "lost" a take they liked, the iterate-cheaply story
  dies. See "Generation library + favorites" below.
- **Stem-aware from day 1**: everything operates on isolated stems, not mixed tracks. The "X→Y" framing only works when you can target specific layers.
- **Key/BPM preserved by default**: generated output must match the source theme musically. No accidental modulations.
- **Async, with preview**: users should see a generating state + hear a 10-second preview ASAP, full output later.
- **Editorially opinionated**: SEGUE is not a general-purpose music AI. It's a transition engine. The prompt scaffolding should enforce that ("generate a 4-bar bridge from [key,bpm,mood] A to [key,bpm,mood] B").
- **The name matters**: segues are what editors do. The product experience should feel like hiring a very fast, very musical editor — not a slot machine.

## Generation library + favorites (the iteration loop)

Score Canvas's product narrative is **Design · Iterate · Review · Ship**. Iterate
is the longest leg of that loop, and Segue is the engine that makes it cheap.
The data contract Segue owes Score Canvas:

- **Every generation is permanent.** Output URL stays valid forever. No
  expiring presigned URLs that break "reopen this project six months later."
- **Every generation is attributed to a node.** When Segue finishes a request,
  the resulting asset record includes the originating Score Canvas `nodeId`
  and `projectId`. Score Canvas can then list "every variant ever generated
  for this Combat-Hi music state" inline in the node's detail panel.
- **Favorites are first-class.** The asset record has a `starred: boolean`
  field. The Score Canvas UI surfaces a "favorites only" filter. The composer
  picks winners by ear, not by tracking down filenames in Slack.
- **Generations are listable, filterable, retrievable.** SDK methods:
  `listGenerations({ nodeId, kind, starred })`, `getGeneration(id)`,
  `starGeneration(id, starred)`, `addNote(id, text)`. All cheap, all idempotent.
- **A/B compare is supported by the SDK.** `compareGenerations([idA, idB])`
  returns synchronized stream URLs + waveform peak data so the Score Canvas UI
  can render the two-track comparison view without doing extra audio decode work.

The "trash" semantic also matters: when a user "deletes" a generation, the SDK
should soft-delete it (`deletedAt` timestamp) with 30-day retention before
hard-deleting. Restore = clear the timestamp. Cost is negligible; user trust
is enormous.

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
5. Sign up for kie.ai, grab an API key.
6. Get one **instrumental** stem variation working end-to-end on Suno V5
   (`model: "V5"`, `instrumental: true`). Do NOT skip the instrumental flag —
   even on the smoke-test request.
7. Add the speech-to-text instrumental test gate before adding the second
   endpoint. Every endpoint built afterward must pass it.
