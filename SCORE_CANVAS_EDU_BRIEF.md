# Score Canvas for Education — Project Brief

*For handing off to a fresh Claude Code session building the education vertical.*

---

## What is Score Canvas for Education?

**Score Canvas for Education** is a sub-branded teaching edition of Score Canvas, targeted at universities and colleges running adaptive music for games curricula. It uses the same underlying tool — visual node-based music system design, in-browser auditioning — and adds the layer that classrooms need:

- A curated **library of canonical adaptive music systems** students study and dissect
- Structured **curriculum modules** that mirror real course weeks
- **Assignment workflows** (assign → submit → review → grade → iterate)
- **Rubric-first grading tools** for technical assignments
- **Instructor dashboards** (class progress, submission tracking, cohort patterns)
- **Canvas LMS integration** via LTI 1.3

It is explicitly *not* a generative AI product. That's Segue's job, in Core. EDU is about **teaching the craft of adaptive music system design using existing, curated examples as study material.**

---

## The Creative → Implementation Bridge (positioning anchor)

> *"Visually teach the CREATIVE part of adaptive music, then implement."* — Ted

The current state of teaching adaptive music in masters-level programs (including Ted's own MUSC 6633) jumps students directly into Wwise. They learn the tool mechanics — Music Segments, Tracks, Playlists, State Groups, RTPCs — before they've internalized the creative thinking behind what they're building.

This is backwards. You wouldn't teach a composer Sibelius before teaching them counterpoint.

Score Canvas for Education is the missing step. It sits **between** music theory and middleware. Students use it to:

1. Explore canonical adaptive music systems visually (see the whole graph, hear it, understand why it's designed that way)
2. Design their own systems in the browser — make creative decisions about states, transitions, vertical layering, parameter curves
3. Audition those decisions immediately, without building anything
4. Carry the finished creative design into Wwise for implementation, already knowing what they're trying to build

**The product thesis:** Wwise teaches you *how* to implement. Score Canvas teaches you *what* to build, and *why*. Both are needed. Neither alone is enough.

---

## Who built it + why

Ted Kocher, 18-year AAA game music designer, has been teaching adaptive music at the graduate level for five years. He authored **MUSC 6633: Adaptive Music Implementation**, a seven-week master's-level course taught at multiple institutions. The course, its weekly deliverables, and the pedagogical structure *are* the product. Score Canvas for Education is the software embodiment of that curriculum.

**This is the moat.** Any engineering team can build a teaching LMS. Almost nobody can build one around five years of master's-level game music curriculum from a practicing AAA music designer. The software is distribution; the curriculum is the product.

---

## Why it needs to exist

Every university game program wants to teach adaptive music systems. Today they use:

- Audiokinetic's own Wwise Certification tutorials (great for tool mechanics, terrible for system design thinking)
- Scattered YouTube videos
- "Go listen to games and figure it out"
- Whatever the instructor patched together themselves

There is **no dedicated teaching platform for adaptive music system design.** No textbook-equivalent. No sandbox environment. No graded exercise set. No canonical example library.

Score Canvas already solves the "in-browser sandbox" part. EDU adds the curriculum, the presets, the grading, and the LMS integration that makes it classroom-ready.

---

## Pilot partners (v1)

Two pilot institutions, both with direct teaching relationships:

### 1. Southern Utah University (suu.edu)
Ted's primary teaching home for master's-level game music. Target pilot: the fall semester's MUSC 6633 cohort.

### 2. Northwestern Michigan College (nmc.edu)
Ted's secondary teaching program. Target pilot: a parallel or sequential run after SUU.

### Post-pilot expansion targets
Once the pilot proves the product works for Ted's own courses, these become warm targets:
- Berklee College of Music (Game Audio track)
- USC (Interactive Media & Games Division)
- NYU Tisch (Game Design)
- DigiPen, Full Sail, CalArts, Guildhall
- Any department using Wwise certification in their curriculum

---

## Course structure (based on MUSC 6633)

**7 modules · 7 weeks · half-semester format · ~6 hours/week practical time**

This exactly matches Ted's existing MUSC 6633 syllabus. Score Canvas for Education's module system is built around these seven weeks. The brief ships with these modules pre-authored as the canonical v1 curriculum.

---

## MUSC 6633 → Score Canvas for Education mapping

For each week, the instructor (Ted) assigns a canonical preset in Score Canvas that students study, a sandbox exercise they complete in the browser, and the Wwise implementation they build afterward. Score Canvas sits *before* the Wwise project — it's the creative-design phase.

| Wk | Course Focus (from MUSC 6633) | Canonical Score Canvas Preset | In-Browser Exercise | Wwise Implementation (MUSC 6633 Project) |
|----|-------------------------------|--------------------------------|---------------------|-------------------------------------------|
| 1 | Music Asset Production & Loudness | *(no Score Canvas role this week — pure DAW/loudness work)* | — | Project 0: Asset Preparation |
| 2 | Wwise Music Hierarchy (Intro/Loop/End) | **"Title Screen Cue"** — 3-segment Intro → Loop → Exit graph | Students fork the preset, swap in their own stems, configure Exit Cue sync | Project 1: Basic Adaptive Music System |
| 3 | Vertical Adaptation (RTPCs) | **"4-Layer Tension System"** — stem-per-track with a Tension RTPC driving volume + LPF | Students design a custom RTPC curve across four layers, audition the fade behavior at different Tension values | Project 2: Vertical Adaptive System |
| 4 | Horizontal Adaptation (States/Switches) | **"Explore ↔ Combat State Pair"** — two music states with configurable transition rules | Students author a transition rule (crossfade at next-bar, sting-based exit) and audition it in both directions | Project 3: Horizontal Adaptive System |
| 5 | Advanced Transitions & Alternatives | **"Boss Fight Phases"** — 3-phase fight with 75%/25% randomized alternatives in Phase 2 | Students add a 4th phase with their own randomization and synchronize a return-to-Phase-1 rule | Project 4: Alternative Music System |
| 6 | Interactive Mixing & Cinematics | **"Cinematic Integration"** — linear cutscene segment plus dialogue-ducking mix state | Students configure the ducking State, the linear→interactive transition, and audition the seam | Project 5: Cinematic Integration |
| 7 | Capstone Portfolio | *(students use their own final-project graph — no new preset)* | Students submit their complete Score Canvas design alongside their Wwise project and documentation | Final Project |

---

## The canonical preset library

Six pre-authored Score Canvas projects, each annotated by Ted, shipped with the product:

1. **Title Screen Cue** (simple Intro/Loop/Exit — teaches basic segment flow)
2. **4-Layer Tension System** (vertical adaptivity, RTPC curve design)
3. **Explore ↔ Combat State Pair** (horizontal adaptivity, transition rule design)
4. **Boss Fight Phases** (multi-phase structure + randomized alternatives)
5. **Cinematic Integration** (linear-interactive boundary, mix-state ducking)
6. **Capstone Reference Project** (a complete combined system for students to compare their work against)

Each preset is:
- A complete, auditionable Score Canvas graph (music states, transitions, stingers, RTPCs, events)
- Annotated with director notes that explain *why* each design choice was made (not just what it does)
- Forkable — students clone it into their own workspace to modify
- Paired with a rubric for evaluating student-authored variations

These are not "demos." They are the teaching material. Getting them right is 80% of the product's value.

---

## What Score Canvas for Education must do

### 1. Curriculum module system
- Organize content into modules that map to course weeks
- Each module: reading prep, a canonical preset to study, an in-browser exercise, a Wwise project brief, assessment criteria
- Instructors can reorder, hide, or customize modules per their course
- Student progression is tracked (module complete / in-progress / not started)

### 2. Canonical preset library
- Six pre-authored Score Canvas projects (see above), annotated by Ted
- Instructor-only "solution view" with full director notes; student view can be configured to hide or show annotations
- Instructors can author additional presets and mark them as course-specific

### 3. Assignment workflow
- **Instructor** creates an assignment: title, prompt, starter preset (optional), rubric, due date
- **Student** forks the starter into their workspace, builds their solution, submits
- **Instructor / TA** reviews the student graph visually, listens to the audition playback, leaves inline comments on specific nodes / edges
- **Grade** posted via rubric
- **Student** iterates and resubmits if allowed

### 4. Rubric-first grading (primary grading interface)
Since Ted's preferred grading method is rubrics for technical assignments, rubrics are first-class:
- Rubric builder: criteria + levels + point values + optional descriptions per level
- Per-submission rubric review UI: grader clicks the achieved level for each criterion, leaves a comment per criterion, total auto-calculated
- Bulk rubric application (copy rubric from previous assignment)
- Rubric-level class statistics (which criterion do students struggle with most?)
- Secondary support for free-form demo review alongside rubrics

### 5. Classroom management
- Courses contain sections; sections have students, TAs, instructors
- Roster import from Canvas via LTI
- Student progress dashboards
- Assignment calendar view
- Export grades back to Canvas gradebook

### 6. Canvas LMS integration (priority #1)
- LTI 1.3 launch: instructor launches from Canvas course, is authenticated into Score Canvas for Education with the right role
- Roster sync via Names and Roles Provisioning Service (NRPS)
- Grade passback via Assignment and Grade Service (AGS)
- Deep links from Canvas assignments into specific Score Canvas EDU assignments
- Moodle and Blackboard support is v2, not v1

### 7. Creative → Implementation pairing
- Every assignment can reference a paired Wwise project deliverable
- Students attach their Wwise project + documentation to their Score Canvas submission
- Instructor sees both side-by-side in the review UI

---

## Differentiation

| | Wwise Certification | YouTube Tutorials | Coursera / Udemy | **Score Canvas for Education** |
|---|---|---|---|---|
| Tool mechanics | ✓ | ✓ | Partial | ✓ |
| **Creative system design thinking** | ✗ | ✗ | ✗ | ✓ |
| In-browser sandbox | ✗ | ✗ | ✗ | ✓ |
| Graded assignments with rubrics | ✗ | ✗ | Limited | ✓ |
| Instructor-authored curriculum | ✗ | N/A | Some | ✓ |
| 18-year AAA practitioner author | ✗ | Variable | ✗ | ✓ |
| 5-year master's-level curriculum | ✗ | ✗ | ✗ | ✓ |
| Canvas LTI 1.3 integration | ✗ | ✗ | Partial | ✓ |
| Zero setup required | ✗ | ✓ | ✓ | ✓ |
| Canonical preset library | ✗ | ✗ | ✗ | ✓ |
| Creative → Implementation pairing | ✗ | ✗ | ✗ | ✓ |

---

## Tech direction

Most of the software already exists. EDU is primarily additive on top of the ScoreCanvasV2 codebase.

### Reuse from ScoreCanvasV2
- The entire React/Vite/TypeScript app
- Canvas, node types, audio engine, transport bar, Project Assets, Node Detail Panel, Stem Editor
- Project data structure (just swap parody games for canonical presets)
- Simple / Detailed view modes
- Tutorial framework

### New in EDU
- **Auth** — user accounts, session management (Clerk, Auth0, or Supabase Auth)
- **Database** — users, courses, sections, rosters, assignments, submissions, rubrics, grades (Postgres via Supabase or Neon)
- **LTI 1.3** layer — Canvas integration via `@ltijs/ltijs` or similar
- **File storage** — student-submitted audio + graph files (S3 / Cloudflare R2)
- **Role-based permissions** — instructor / TA / student
- **Curriculum authoring** — MDX for interactive module content
- **Rubric engine** — data model, builder UI, review UI, statistics

### Deployment
EDU needs a backend (auth, submissions, LTI, database). Unlike Core's fully static deploy, EDU is a full-stack app. Recommended:
- **Web**: Cloudflare Pages or Netlify (same as Core)
- **API**: Cloudflare Workers + Hyperdrive to Neon/Supabase, OR a Node/Hono service on Fly.io
- **Storage**: Cloudflare R2 (cheapest egress)
- **Auth**: Clerk (fastest to ship) or Supabase Auth (bundled with DB)

---

## Suggested architecture

```
score-canvas-edu/
├── web/                          # Frontend — forked from ScoreCanvasV2
│   ├── src/
│   │   ├── components/           # Reused Score Canvas components
│   │   ├── edu/                  # EDU-specific components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── CourseView.tsx
│   │   │   ├── ModulePage.tsx
│   │   │   ├── AssignmentView.tsx
│   │   │   ├── RubricBuilder.tsx
│   │   │   ├── RubricReview.tsx
│   │   │   ├── SubmissionReview.tsx
│   │   │   └── InstructorDashboard.tsx
│   │   ├── auth/                 # Session management
│   │   └── lti/                  # LTI launch handling
│   └── presets/                  # Canonical preset project files (JSON)
│       ├── title-screen-cue.json
│       ├── tension-system.json
│       ├── explore-combat.json
│       ├── boss-fight-phases.json
│       ├── cinematic-integration.json
│       └── capstone-reference.json
├── api/                          # Node/TypeScript backend
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── courses.ts
│   │   ├── assignments.ts
│   │   ├── submissions.ts
│   │   ├── rubrics.ts
│   │   ├── grades.ts
│   │   └── lti.ts
│   ├── db/                       # Prisma / Drizzle schema
│   └── storage/                  # R2 adapter
├── curriculum/                   # MDX content authored by Ted
│   └── musc-6633/
│       ├── week-02-music-hierarchy.mdx
│       ├── week-03-vertical-rtpc.mdx
│       ├── week-04-horizontal-states.mdx
│       ├── week-05-advanced-transitions.mdx
│       ├── week-06-mixing-cinematics.mdx
│       └── week-07-capstone.mdx
└── README.md
```

---

## Pilot plan

### Phase 1 — SUU pilot (primary)
- **Target**: Ted's next MUSC 6633 cohort at SUU
- **Duration**: One 7-week half-semester
- **Scope**: All six canonical presets shipped, module 2 through 7 fully authored in MDX, rubric-graded assignments for Projects 1–5, Canvas LTI integration working
- **Success metrics**:
  - 100% of students complete the Score Canvas exercise before starting the corresponding Wwise project
  - Ted reports that student Wwise implementations show clearer design thinking vs. previous cohorts
  - Students complete ≥90% of module exercises
  - Fewer than 5 critical bugs in 7 weeks
  - Ted would use it again

### Phase 2 — NMC pilot
- **Target**: Ted's next NMC course
- **Duration**: One semester
- **Scope**: Same curriculum, iterate on anything SUU pilot revealed

### Phase 3 — external adopters
- Open to Berklee / USC / NYU / etc. once the Ted-run pilots are clean

---

## Pricing model sketch

Pricing is instructor-led and teaching-focused, not Segue-metered. Segue is intentionally out of scope in EDU v1.

- **Instructor seats**: free — lowers adoption barrier, builds curriculum network effect
- **Student seats**: $15–25/student/course, or bundled into the institution's existing course fees
- **Institutional site license**: negotiated per-school (example: $5k–$15k/year for unlimited seats at one institution)
- **Curriculum licensing** (future): other instructors can license Ted's MUSC 6633 MDX modules directly or remix them — revenue share with Ted

Open to adjustment; this is a starting position, not a pricing page.

---

## Open questions to resolve before build starts

Most questions from the original brief are answered. Remaining:

1. **Pilot semester window** — when does SUU's next MUSC 6633 cohort begin? That's the ship-by date.
2. **Canvas instance details** — does SUU run Canvas Free, Canvas Institution, or a local deployment? Any SSO providers in front of it (e.g., Shibboleth)?
3. **Hosting budget + provider preference** — Cloudflare vs. Fly vs. Vercel. Cloudflare recommended for cost.
4. **Who authors the MDX modules?** Ted writes the content; a future agent formats it into MDX. What's the timeline to convert MUSC 6633 prose into MDX?
5. **Audio hosting** — student submissions and canonical preset audio. Is R2 the right choice? Need to estimate per-student storage budget.
6. **FERPA and data residency** — US student data. Does either pilot institution have additional data requirements?

---

## Not in scope for v1
- Segue integration (explicitly deferred — teaching, not creating, is the EDU focus)
- Multi-institution rollout (pilot with SUU + NMC only)
- Automated grading (human-reviewed rubrics only; no AI grading)
- Student social features, discussion forums
- Mobile apps
- Non-English localization
- Non-game-audio verticals (film scoring — that's ScoreCanvasFILM later)
- Moodle / Blackboard LTI (v2)
- Non-Wwise middleware pairings (FMOD support — v2+)

---

## Tone

Same voice as Core: industry-insider, dry-humored, never overselling. Plus one additional discipline: **respectful of the teaching craft.** This product is not replacing instructors. It's giving instructors the tool they've needed for a decade. The marketing should acknowledge that teaching this discipline is hard, and the people doing it today are heroes who are underserved by what exists.

---

## Suggested first tasks

1. **Fork the ScoreCanvasV2 repo** into `pour-over/ScoreCanvasEDU`.
2. **Pick the stack**: React frontend (from V2) + Hono/Fastify API + Postgres (Supabase or Neon) + Clerk for auth. Scaffold it.
3. **Build the minimum viable grading loop**: instructor creates assignment with a rubric + starter preset → student forks + submits → instructor reviews via the rubric UI → grade posts. Skip Canvas LTI initially; use local auth for the first milestone.
4. **Author canonical preset #1** (Title Screen Cue) and ship the MUSC 6633 Week 2 module (MDX + preset + rubric). End-to-end vertical slice.
5. **Add Canvas LTI 1.3 launch + grade passback.** This is the only LMS integration in v1.
6. **Ship the other five presets and modules.**
7. **Run the SUU pilot.**

Everything else is a premature optimization.

---

**Start here:**
1. `mkdir ~/Desktop/ClaudeCode/ScoreCanvasEDU && cd ~/Desktop/ClaudeCode/ScoreCanvasEDU`
2. Create GitHub repo `pour-over/ScoreCanvasEDU` (private during the SUU pilot)
3. Fork the ScoreCanvasV2 frontend as the starting `web/` app
4. Read `src/components/SeguePanel.tsx` and `src/components/Canvas.tsx` in ScoreCanvasV2 to understand the visual spec and the node engine
5. Stand up Postgres + auth + storage, build the rubric-graded submission loop before anything else
6. Ship module 2 (Title Screen Cue) end-to-end before adding module 3
