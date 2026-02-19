# Roadmap: waynewen.com Blog

## Milestones

- v1.0 Craftsmanship Refactor - Phases 1-4 (shipped 2026-02-09)
- v1.1 SEO & Discoverability - Phases 5-8 (shipped 2026-02-16)
- v1.2 Content: The Phantom Pods - ad-hoc, PRs #31 + #32 (shipped 2026-02-17)
- v1.3 Interactive Visualizations - ad-hoc, PRs #33-#36 (shipped 2026-02-18)
- v1.4 Agentic Workflow Post - Phases 9-10 (in progress)

## Phases

<details>
<summary>v1.0 Craftsmanship Refactor (Phases 1-4) - SHIPPED 2026-02-09</summary>

- [x] Phase 1: DRY Refactoring (1/1 plans) - completed 2026-02-08
- [x] Phase 2: Type-Safe Validation (2/2 plans) - completed 2026-02-08
- [x] Phase 3: Testing Infrastructure (2/2 plans) - completed 2026-02-08
- [x] Phase 4: Security Hardening (2/2 plans) - completed 2026-02-09

See: `.planning/milestones/v1.0-ROADMAP.md` for full details.

</details>

<details>
<summary>v1.1 SEO & Discoverability (Phases 5-8) - SHIPPED 2026-02-16</summary>

- [x] Phase 5: Crawler Foundation (1/1 plans) - completed 2026-02-15
- [x] Phase 6: Layout Metadata (1/1 plans) - completed 2026-02-16
- [x] Phase 7: Structured Data (1/1 plans) - completed 2026-02-16
- [x] Phase 8: Atom Feed (1/1 plans) - completed 2026-02-16

See: `.planning/milestones/v1.1-ROADMAP.md` for full details.

</details>

<details>
<summary>v1.2 Content: The Phantom Pods (ad-hoc) - SHIPPED 2026-02-17</summary>

- [x] PR #31: Add "The Phantom Pods" post with interactive visualizations
- [x] PR #32: Tighten phantom-pods prose and simplify diagrams

</details>

<details>
<summary>v1.3 Interactive Visualizations (ad-hoc) - SHIPPED 2026-02-18</summary>

- [x] PR #33: Promote CloneSet pod-thrashing post to blog, rename phantom to thrash
- [x] PR #34: Fix maxSurge consistency and simulation cap bug
- [x] PR #35: Per-pod position tracking with staggered drain times
- [x] PR #36: Post-rollout consolidation step

See: `.planning/milestones/v1.3-ROADMAP.md` for full details.

</details>

### v1.4 Agentic Workflow Post (In Progress)

**Milestone Goal:** Publish a reflective preview post about the three eras of developer capability (pre-chatbot, chatbot, agentic) with interactive visualizations of the agentic-era personal workflow.

**Phase Numbering:**
- Integer phases (9, 10): Planned milestone work
- Decimal phases (9.1, 9.2): Urgent insertions if needed (marked with INSERTED)

- [x] **Phase 9: Visualization Components** - Interactive workspace layout and workflow orchestration components for the agentic workflow post (completed 2026-02-19)
- [ ] **Phase 10: Agentic Workflow Post** - Complete preview post with three-era narrative, hackathon story, workflow deep-dive, and embedded visualizations

## Phase Details

### Phase 9: Visualization Components
**Goal**: Readers can interact with visual representations of an agentic developer workflow -- exploring a workspace file tree and seeing parallelized agent sessions in action
**Depends on**: Nothing (first phase of v1.4; existing MDX component infrastructure from v1.2/v1.3)
**Requirements**: VIZ-01, VIZ-02
**Success Criteria** (what must be TRUE):
  1. Reader can expand/collapse a file tree showing projects/ and ideas/ directories, with visible agent-context annotations per directory
  2. Reader can see a visualization of multiple parallelized agent sessions running across different working directories
  3. Both components render correctly when embedded in an MDX file via `<WorkspaceLayout ... />` and `<WorkflowOrchestration ... />` (or similar) JSX tags
  4. Components follow established patterns: 'use client' directive, JSON string props for MDX serialization, literal Tailwind class lookups
**Plans**: 2 plans

Plans:
- [ ] 09-01-PLAN.md -- WorkspaceLayout: interactive card-based file tree with expand/collapse and annotations
- [ ] 09-02-PLAN.md -- WorkflowOrchestration: auto-playing parallelized agent session animation

### Phase 10: Agentic Workflow Post
**Goal**: Readers can read a complete reflective essay tracing the evolution from decades-of-study to days-of-building, with the agentic workflow visualizations bringing the personal workflow section to life
**Depends on**: Phase 9 (visualization components must exist before content embeds them)
**Requirements**: POST-01, POST-02, POST-03, POST-04, POST-05
**Success Criteria** (what must be TRUE):
  1. Preview post is accessible at /preview/[slug] with correct frontmatter (title, date, tags, description)
  2. Post opens with three-era narrative framing and the "decades/days" theme is established in the introduction
  3. Eras 1-2 (pre-chatbot 2014, chatbot 2023) are covered as reflective setup -- brief, contextual, not the focus
  4. Era 3 hackathon section tells the turning point story: 10 markdown skills, zero code written, failed prior attempts (Slack bot, chatbot, MCP), and why agents succeeded where others failed
  5. Era 3 personal workflow section embeds both interactive visualizations (workspace layout + workflow orchestration) and covers directory-as-context-boundary, GSD session resume, parallelized agents, custom skills, and projects/ vs ideas/ organization
  6. Closing section returns to the decades/days theme -- the bottleneck shifted from finding information to orchestrating context
**Plans**: 1 plan

Plans:
- [ ] 10-01-PLAN.md -- Write complete "Decades to Days" preview post with three-era narrative and embedded visualizations

## Progress

**Execution Order:**
Phases execute in numeric order: 9 -> 10

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. DRY Refactoring | v1.0 | 1/1 | Complete | 2026-02-08 |
| 2. Type-Safe Validation | v1.0 | 2/2 | Complete | 2026-02-08 |
| 3. Testing Infrastructure | v1.0 | 2/2 | Complete | 2026-02-08 |
| 4. Security Hardening | v1.0 | 2/2 | Complete | 2026-02-09 |
| 5. Crawler Foundation | v1.1 | 1/1 | Complete | 2026-02-15 |
| 6. Layout Metadata | v1.1 | 1/1 | Complete | 2026-02-16 |
| 7. Structured Data | v1.1 | 1/1 | Complete | 2026-02-16 |
| 8. Atom Feed | v1.1 | 1/1 | Complete | 2026-02-16 |
| (ad-hoc) The Phantom Pods | v1.2 | 2 PRs | Complete | 2026-02-17 |
| (ad-hoc) Interactive Visualizations | v1.3 | 4 PRs | Complete | 2026-02-18 |
| 9. Visualization Components | v1.4 | Complete    | 2026-02-19 | - |
| 10. Agentic Workflow Post | v1.4 | 0/TBD | Not started | - |

---
*Roadmap created: 2026-02-08*
*Last updated: 2026-02-18 (v1.4 milestone roadmap created)*
