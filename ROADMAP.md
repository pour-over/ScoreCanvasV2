# Score Canvas — Roadmap & Vision

*Last updated: April 2026*

## The thesis

**Score Canvas isn't a faster tool. It's a different *kind* of tool.**

Every other game music tool assumes:
- A built game
- A working middleware license (Wwise, FMOD)
- A DAW
- A fast local machine with the right plugins authorized
- A network to the company Perforce
- Company-issued hardware with company-issued accounts

Score Canvas assumes a browser tab.

That's not a feature. It's a category shift. It's what makes music system design **portable, teachable, and disposable** — three things it has never been before.

A student with a Chromebook, a composer on a plane, a director on set, a candidate in a job interview, a kid in their bedroom — same tool, same fidelity. Nobody else can say that.

That thesis unlocks three verticals from the same codebase.

---

## The three verticals

### 1. Core — The game audio team tool

The current product. Score Canvas as a visual, auditionable design surface for adaptive music systems that ship to real games via Wwise / FMOD / custom middleware.

**Status**: Live at [scorecanvas.io](https://scorecanvas.io). V2 positioning shipped.
**Repo**: `pour-over/ScoreCanvasV2`
**Audience**: Audio leads, composers, technical sound designers, audio programmers, creative directors.

### 2. EDU — The teaching platform ("Score Canvas for Education")

Sub-branded teaching edition. Same tool, plus curriculum modules, canonical preset library, assignment workflows, rubric-first grading, and Canvas LTI 1.3 integration. Built directly around **MUSC 6633: Adaptive Music Implementation**, Ted's existing 7-week master's-level course.

**Positioning anchor**: *"Visually teach the CREATIVE part of adaptive music, then implement."* Score Canvas sits **before** Wwise in the learning flow — students make creative system-design decisions in the browser, then carry that design into Wwise to implement. It's the missing bridge between music theory and middleware.

**Status**: Concept. Full executable brief at `SCORE_CANVAS_EDU_BRIEF.md`.
**Target repo**: `pour-over/ScoreCanvasEDU` (not yet created)
**Pilot partners**: Southern Utah University (suu.edu) + Northwestern Michigan College (nmc.edu) — both have direct teaching relationships with Ted.
**Post-pilot targets**: Berklee, USC, NYU Tisch, DigiPen, Full Sail.

**Explicit scoping**: EDU v1 is *teaching, not creating*. Segue is deliberately out of scope — students study and design canonical preset systems, not generate new music. That keeps the product focused on pedagogy and avoids coupling to Segue's timeline.

**Why this matters**: Every university game audio program wants to teach adaptive music systems. Most stitch together Wwise tutorials, YouTube videos, and "go listen to games." There is no dedicated teaching platform for this discipline. Score Canvas for Education + Ted's existing curriculum = the first real one.

### 3. Film — Remote score auditioning (future)

Same tool, adapted for linear score review. Film score adaptive music isn't a graph of states — it's a timeline of cues — but the "audition in a browser, no specialized setup" thesis applies equally.

**Status**: Deferred. No brief yet — needs more scoping with film composers / music editors.
**Target repo**: `pour-over/ScoreCanvasFILM` (not yet created)
**Audience**: Temp music editors, composers, directors, producers doing remote score reviews.

**Key design challenge**: Score Canvas today is state-machine-first. Film is timeline-first. The underlying "nodes + audition + multi-user" primitives are reusable, but the UI will need to be rethought.

---

## The AI engine: Segue

**Segue** (*seg-way*, n. a smooth transition from one piece of music to another) is the AI backend that powers all three verticals.

**Status**: In active development (separate repo/workstream).
**Target repo**: `pour-over/Segue` (not yet created)
**Brief**: `SEGUE_BRIEF.md` in this repo for context.
**Tech**: Suno API via Kie.ai, stem-aware from day 1.
**Role**: Generates stem variations, custom intros, custom endings, custom transitions. Splits stems. Analyzes and tags.

Segue is the **X→Y music solver** — the productized version of Ted's 20 years of editorial expertise. It makes "clean theme in, entire score out" real.

Segue is cross-cutting:
- **Core** uses it for asset generation inside the design tool.
- **EDU** uses it to give students instant material to experiment with ("here's a theme — now transform it into 5 moods").
- **Film** uses it for score ideation and revision turnaround.

---

## Roadmap by vertical

### Core (near-term, v2.5)

- Live Wwise Sync via WAAPI (two-way session connection)
- Segue integration for in-tool AI buttons (currently roadmap teasers)
- Annotation edges with compound conditions (e.g., "Whale retreats + Scarf < 40")
- Real-time stem preview mixing in the Stem Editor
- Actual Wwise/FMOD project file export (not just templates)
- Navigation dropdown for all states/transitions/stingers

### Core (further out)

- Multi-user collaboration (Yjs is already a dependency — comment threads, cursors, simultaneous edits)
- FMOD Studio live sync (parallel to Wwise)
- Unreal / Unity engine integration
- Mobile-friendly view mode (tablet support for on-the-go review)
- Figma plugin for embedding music system graphs in design docs

### EDU (ready for execution — see SCORE_CANVAS_EDU_BRIEF.md)

High-level:
- Seven modules mapping 1:1 to MUSC 6633 weeks 1–7
- Canonical preset library: Title Screen Cue, 4-Layer Tension, Explore↔Combat, Boss Fight Phases, Cinematic Integration, Capstone Reference
- Rubric-first grading (Ted's preferred grading method for technical assignments)
- Assignment workflow: fork preset → student submits graph + Wwise project → instructor reviews both against rubric → grade posts to Canvas
- Canvas LTI 1.3 as the only LMS integration in v1 (Moodle / Blackboard in v2)
- Deployment: full-stack (unlike Core's static deploy) — API + Postgres + R2 + Clerk/Supabase auth
- Pilot timeline: SUU first, then NMC
- Segue is explicitly NOT included in EDU v1

### Film (once scoped)

- Timeline-first UI (cues, hit points, reels)
- Video sync (bring in the picture, scrub with it)
- Temp-track workflow (tag a cue as "temp", get Segue alternatives)
- Director-share mode (URL with view-only + comment-only access)

---

## Strategic insights (decisions log)

1. **"Works anywhere" is the defining differentiator.** Not visual node graphs, not AI. Every roadmap decision should ask: "does this preserve the browser-native, zero-setup property?" If it requires local software, it's the wrong path for Score Canvas and should live elsewhere.

2. **Segue is a separate codebase intentionally.** It needs to serve Core / EDU / Film and potentially third-party clients. Coupling it to the Score Canvas codebase would limit its reach.

3. **Parody project names are a feature, not filler.** They make the demo memorable, they avoid IP risk, and they signal "this is a design tool, not a clone of your game."

4. **Simple Mode is the default for a reason.** First-time users need beauty over density. Detailed Mode is for power users who've earned the chrome.

5. **"Lead Music Designer with 18 years in AAA games" is the credibility anchor.** Not "at PlayStation Studios" — keep the line legally-safe so the brand can travel wherever Ted goes.

6. **Ted's 20-year editorial background is the single biggest defensibility signal.** No competitor has it. Every product story should reinforce it when appropriate — especially around Segue and EDU.

7. **EDU teaches creative thinking, not generation.** Segue is not in EDU v1. Conflating the two weakens both products. Students learn to design systems by studying canonical presets, not by prompting AI. When Segue matures, it becomes an optional advanced module — never the core value proposition.

8. **Wwise is the implementation partner, not the competitor.** Score Canvas for Education sits *before* Wwise in the learning flow. The relationship with Audiokinetic should be cooperative, not adversarial — this tool makes Wwise training more effective, not less necessary.

---

## Intentionally not in scope

- **Being a DAW replacement.** Score Canvas doesn't mix, doesn't master, doesn't compose. It designs systems.
- **Linear score authoring.** That's the Film vertical when we get there — different paradigm.
- **Asset storage / audio file hosting at scale.** Use S3/R2; let the user bring their own audio.
- **A marketplace.** Tempting but dilutes the product story. Maybe later.
- **Replacing composers.** Ever. The tool is for composers and teams that work with them. Marketing should never imply otherwise.

---

## What "done" looks like (long-term)

Score Canvas becomes the default sketch surface for game music systems — the place every audio lead opens first when a new project kicks off, before a single note is written. EDU becomes the first legitimate curriculum tool for the discipline. Segue becomes the editorial assistant that composers didn't know they could have. Film picks up once the first two are stable.

At no point does it require installing anything. Everything ships in a browser.
