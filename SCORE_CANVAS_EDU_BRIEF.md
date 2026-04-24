# Score Canvas EDU — Project Brief

*For handing off to a fresh Claude Code session building the educational vertical.*

## What is Score Canvas EDU?

Score Canvas EDU is a **teaching platform for game music design** — a curriculum-integrated repackaging of Score Canvas targeted at universities and other institutions teaching adaptive music for games.

It uses the same underlying tool (visual node-based music system design, in-browser auditioning) but adds:

- Structured curriculum modules aligned to course weeks / lectures
- Annotated canonical example projects (bad → good progressions, common mistakes)
- Student assignment workflows (submit, review, grade, iterate)
- Instructor dashboards (class progress, cohort patterns)
- Classroom-friendly permissions (student / TA / instructor roles)
- LMS integration (Canvas, Moodle, Blackboard via LTI 1.3)

## Who built it + why

Ted Kocher has been teaching game audio at the master's level for 5 years. He has built the curriculum — the actual coursework, the progressions, the assessments, the canonical examples — that this platform operationalizes.

**This is the moat.** Any engineer can build a teaching platform. Almost nobody can build it around 5 years of master's-level game music design curriculum from an 18-year AAA practitioner. The software is the distribution; the curriculum is the product.

## Why it needs to exist

Every university game program wants to teach adaptive music systems. Most use:
- Audiokinetic's own Wwise certification tutorials (good for tool mechanics, terrible for system design)
- Scattered YouTube videos
- "Go listen to games and figure it out"
- Whatever the instructor pieced together

There is **no dedicated teaching platform for adaptive music system design**. No textbook-equivalent. No sandbox environment. No graded exercise set.

Score Canvas already solves 80% of the "sandbox environment" problem — it's browser-native, auditionable, zero-setup. EDU adds the other 20% that makes it classroom-ready.

## Target institutions

*[TODO — Ted to sharpen with specific schools he has contacts / teaching relationships with]*

Initial targets (hypothesis):
- **Berklee College of Music** — has a Game Audio degree track
- **USC** — Interactive Media & Games Division
- **NYU Tisch** — Game Design program
- **DigiPen** — Computer Science + Game Design
- **Full Sail** — Audio Production for games
- **CalArts / Guildhall / others Ted actively teaches at** (list to fill in)

**Primary early adopter channel**: Ted's existing teaching relationships. This is not cold outreach — it's "here's the platform I've been wanting, want to pilot it?"

## Who it's for

### Instructors
- Want to teach system design, not just tool mechanics
- Want to grade work, not just hear it
- Want students to experiment without needing a Wwise lab license
- Want something professional-looking they can show department chairs

### Graduate students (primary user)
- Master's in game audio / interactive music / sound design for games
- Already have music theory and production chops
- Need to learn systems thinking: states, transitions, parameters, events
- Will use this in a thesis / capstone / portfolio piece

### Undergraduate students (secondary)
- Music / game design majors with an audio concentration
- Lighter curriculum version: fundamentals, guided exercises, less theory

### Professionals auditing / retraining
- Linear composers moving into games
- Sound designers picking up music system design
- Existing game composers leveling up on state machines

## What Score Canvas EDU must do

### 1. Curriculum module system
- Organize content into **modules** (e.g., "Week 3: State Machines 101")
- Each module has: reading material, demo projects, exercises, assessment
- Modules can be ordered (prerequisites enforced) or free-browse
- Instructors can customize a module order per course

### 2. Annotated example projects
- A **library of canonical projects** — each demonstrating a specific concept
- "The Bad Version" → "The Good Version" comparisons (with director notes explaining why)
- Famous adaptive music patterns (Halo-style smooth crossfades, FromSoft-style sting-based combat, Hitman-style mission-phase stacks) implemented as teachable references
- Every example has playback + annotations + guided walkthroughs

### 3. Assignment workflow
- **Instructor** creates an assignment: title, prompt, starter project (optional), rubric, due date
- **Student** forks the starter into their workspace, builds their solution, submits
- **TA / Instructor** reviews the student's graph + listens + leaves inline comments (on specific nodes / edges / stems)
- **Grade** assigned with rubric breakdown
- **Student** iterates and resubmits if allowed

### 4. Classroom management
- Courses contain sections; sections have students + TAs + instructors
- Student progress dashboards (which modules completed, which assignments due)
- Cohort-level patterns ("70% of students got this transition wrong — re-teach?")
- Export grades to LMS

### 5. Integration with the Core tool
- EDU is a superset — anything in Core works here
- Role-based permissions: students see fewer advanced options by default
- "Instructor Mode" reveals everything + adds annotation tools

### 6. Integration with Segue
- Students get limited Segue credits per course (prevents runaway costs)
- Instructors get larger allowances
- Assignments can require Segue ("generate 3 variations, describe what changed, which fits best?")

## Differentiation

| | Wwise Certification | YouTube tutorials | Coursera/Udemy | **Score Canvas EDU** |
|---|---|---|---|---|
| Tool mechanics | ✓ | ✓ | Partial | ✓ |
| **System design thinking** | ✗ | ✗ | ✗ | ✓ |
| In-browser sandbox | ✗ | ✗ | ✗ | ✓ |
| Graded assignments | ✗ | ✗ | Partial | ✓ |
| Instructor-authored curriculum | ✗ | N/A | Some | ✓ |
| 18-year AAA practitioner author | ✗ | Variable | ✗ | ✓ |
| 5-year master's-level curriculum | ✗ | ✗ | ✗ | ✓ |
| LMS integration | ✗ | ✗ | Partial | ✓ |
| Zero setup required | ✗ | ✓ | ✓ | ✓ |

## Tech direction

Most of the tool already exists. EDU is primarily additive:

**Reuse from ScoreCanvasV2:**
- Entire React/Vite/TypeScript app
- Canvas, node types, audio engine, transport, project data structure
- Parody project framework (extend with pedagogical examples)

**New in EDU:**
- Auth (user accounts — Auth0, Clerk, or similar)
- Database (user progress, submissions, grades — Postgres/Supabase)
- File storage for student submissions (S3/R2)
- LMS/LTI 1.3 integration layer (can use `@ltijs/ltijs`)
- Markdown-based curriculum authoring (MDX for interactive content)
- Role-based permissions layer

**Deployment**: Probably can't stay fully static like Core. Needs a backend (Node + Postgres) for auth/submissions/LTI. Consider Cloudflare Pages + Workers or Netlify + Supabase to keep deploy simple.

## Suggested architecture

```
score-canvas-edu/
├── web/                    # Frontend (fork of ScoreCanvasV2)
│   ├── src/
│   │   ├── components/     # Reuse ScoreCanvas components
│   │   ├── edu/            # EDU-specific: Dashboard, Assignment, Rubric, etc.
│   │   ├── auth/           # Session management
│   │   └── lti/            # LTI launch handling
├── api/                    # Node/TypeScript backend
│   ├── routes/
│   │   ├── auth.ts
│   │   ├── courses.ts
│   │   ├── assignments.ts
│   │   ├── submissions.ts
│   │   └── lti.ts
│   ├── db/                 # Prisma/Drizzle schema
│   └── storage/            # S3/R2 adapter
├── curriculum/             # Markdown (MDX) course content authored by Ted
│   ├── modules/
│   │   ├── 01-fundamentals/
│   │   ├── 02-state-machines/
│   │   └── ...
│   └── examples/           # Canonical project files with annotations
└── README.md
```

## Open questions for Ted

**These are the things only you can fill in — once you answer them the brief becomes truly executable.**

1. **Universities**: Which 2–3 schools do you have the strongest teaching relationships with right now? Those become pilot partners.
2. **Curriculum structure**: How is your master's-level course organized? Weeks? Modules? Project-based? How many hours per week? Semester or quarter?
3. **Canonical coursework**: Can you list 5–10 of the key exercises / projects you already assign students? These become the first set of canonical examples.
4. **Assessment philosophy**: How do you grade adaptive music design? Rubric? Demo review? Peer review? Something else?
5. **Pricing model**: Per-seat subscription? Per-student-credit? Site license? Free to instructors with paid Segue usage?
6. **LMS requirements**: Which LMSes do your target schools use? (LTI 1.3 works with all the big ones, but prioritization matters.)
7. **Brand relationship to Core**: "Score Canvas for Education" sub-brand, or separate name (e.g., "Adaptive Music Academy")? Keep Score Canvas branding prominent or differentiate?

## Suggested first tasks

1. **Answer the open questions above** with Ted — the brief becomes specific enough to build from once those are in.
2. **Pick 1 pilot university + 1 instructor** (Ted himself counts) and design the EDU scope around that single course for semester one. Don't build for a generic market — build for Ted's actual syllabus.
3. **Fork the Score Canvas repo**: create `pour-over/ScoreCanvasEDU`, copy the web app, strip the landing page.
4. **Build the minimum viable grading loop**: student forks a starter, submits, instructor comments on nodes, grade posted. Skip everything else (LMS integration, fancy dashboards) until this core loop works.
5. **Author curriculum module #1** in MDX (Ted writes, AI agent formats): get one complete module + exercise + canonical example shippable end-to-end.
6. **Run the pilot**: semester-long trial at one school with real students. Everything else is a premature optimization.

## Not in scope for v1

- Multi-institution rollout (pilot at one school first)
- Automated grading (human-reviewed is fine for v1)
- Student social features / discussion forums
- Mobile apps
- Languages other than English
- Non-game-audio verticals (film scoring, orchestral composition) — that's Score Canvas Film later

## Pricing & business model sketch

*[TODO — Ted to finalize, but initial thinking:]*

- **Instructor seats**: free (Ted wants this — lowers adoption barrier, builds the curriculum library)
- **Student seats**: $10-20/student/course or bundled into course fees
- **Segue usage**: metered (included credit per student, overages billed)
- **Institutional license**: $X/year for unlimited seats at a school
- **Curriculum licensing**: other instructors can license Ted's curriculum modules as-is or remix them — revenue share

## Tone

Same as Core: industry-insider, dry, never overselling. But here also: **respectful of the teaching craft**. This isn't "replacing instructors." It's giving instructors a tool they've needed for a decade. The marketing should acknowledge that teaching this discipline is hard and that the people doing it today are heroes.

---

**Start here:**
1. Ted answers the open questions above (takes ~30 minutes of sharpened thinking)
2. Pick a pilot school + pilot course
3. Create the repo: `pour-over/ScoreCanvasEDU`
4. Copy the web app from ScoreCanvasV2 as the starting point
5. Build the minimum viable grading loop before anything else
