# Roadmap: waynewen.com Blog

## Milestones

- ✅ **v1.0 Craftsmanship Refactor** — Phases 1-4 (shipped 2026-02-09)
- ✅ **v1.1 SEO & Discoverability** — Phases 5-8 (shipped 2026-02-16)
- ✅ **v1.2 Content: The Phantom Pods** — ad-hoc, PRs #31-#32 (shipped 2026-02-17)
- ✅ **v1.3 Interactive Visualizations** — ad-hoc, PRs #33-#36 (shipped 2026-02-18)
- ✅ **v1.4 Agentic Workflow Post** — Phases 9-10 (shipped 2026-02-19)
- ✅ **v1.5 Agentic Workflow Post Revision** — Phases 11-15 (shipped 2026-03-08)
- **v1.6 Editorial Sharpening** — Phases 16-20 (in progress)

## Phases

<details>
<summary>✅ v1.0 Craftsmanship Refactor (Phases 1-4) — SHIPPED 2026-02-09</summary>

- [x] Phase 1: DRY Refactoring (1/1 plans) — completed 2026-02-08
- [x] Phase 2: Type-Safe Validation (2/2 plans) — completed 2026-02-08
- [x] Phase 3: Testing Infrastructure (2/2 plans) — completed 2026-02-08
- [x] Phase 4: Security Hardening (2/2 plans) — completed 2026-02-09

See: `.planning/milestones/v1.0-ROADMAP.md` for full details.

</details>

<details>
<summary>✅ v1.1 SEO & Discoverability (Phases 5-8) — SHIPPED 2026-02-16</summary>

- [x] Phase 5: Crawler Foundation (1/1 plans) — completed 2026-02-15
- [x] Phase 6: Layout Metadata (1/1 plans) — completed 2026-02-16
- [x] Phase 7: Structured Data (1/1 plans) — completed 2026-02-16
- [x] Phase 8: Atom Feed (1/1 plans) — completed 2026-02-16

See: `.planning/milestones/v1.1-ROADMAP.md` for full details.

</details>

<details>
<summary>✅ v1.2 Content: The Phantom Pods (ad-hoc) — SHIPPED 2026-02-17</summary>

- [x] PR #31: Add "The Phantom Pods" post with interactive visualizations
- [x] PR #32: Tighten phantom-pods prose and simplify diagrams

</details>

<details>
<summary>✅ v1.3 Interactive Visualizations (ad-hoc) — SHIPPED 2026-02-18</summary>

- [x] PR #33: Promote CloneSet pod-thrashing post to blog, rename phantom to thrash
- [x] PR #34: Fix maxSurge consistency and simulation cap bug
- [x] PR #35: Per-pod position tracking with staggered drain times
- [x] PR #36: Post-rollout consolidation step

See: `.planning/milestones/v1.3-ROADMAP.md` for full details.

</details>

<details>
<summary>✅ v1.4 Agentic Workflow Post (Phases 9-10) — SHIPPED 2026-02-19</summary>

- [x] Phase 9: Visualization Components (2/2 plans) — completed 2026-02-19
- [x] Phase 10: Agentic Workflow Post (2/2 plans) — completed 2026-02-19

See: `.planning/milestones/v1.4-ROADMAP.md` for full details.

</details>

<details>
<summary>✅ v1.5 Agentic Workflow Post Revision (Phases 11-15) — SHIPPED 2026-03-08</summary>

- [x] Phase 11: Session Context Visualization (2/2 plans) — completed 2026-02-23
- [x] Phase 12: Post Restructure (2/2 plans) — completed 2026-02-23
- [x] Phase 13: Hackathon Rewrite (1/1 plans) — completed 2026-02-24
- [x] Phase 14: Context Management Section (1/1 plans) — completed 2026-02-25
- [x] Phase 15: Closing and Polish (1/1 plans) — completed 2026-03-08

See: `.planning/milestones/v1.5-ROADMAP.md` for full details.

</details>

### v1.6 Editorial Sharpening (In Progress)

**Milestone Goal:** Sharpen the "Decades to Days" essay so the session-architecture thesis is unmistakable by paragraph 2, compress list-heavy prose, replace the second visual with a session-handoff concept, add sections on workflow changes and failure modes, and polish for punchlines and readability.

- [x] **Phase 16: Outline and Cut Map** - Review current structure, identify center of gravity, produce revised outline and cut/compress/move directives (completed 2026-03-08)
- [ ] **Phase 17: Thesis and Prose Rewrite** - Rewrite intro through middle so thesis lands by paragraph 2 and The Session Problem becomes the spine, with compressed prose throughout
- [ ] **Phase 18: Visual Overhaul** - Replace WorkspaceLayout with session-handoff concept visual and improve AgentSessionFlow for hierarchy and clarity
- [ ] **Phase 19: Closing and New Sections** - Rewrite ending grounded in judgment, add workflow-changes section and failure-modes paragraph
- [ ] **Phase 20: Final Polish** - Punchlines, transitions, readability, tone consistency, and quality verification

## Phase Details

### Phase 16: Outline and Cut Map
**Goal**: A concrete editorial plan exists: revised outline showing where the thesis lands, and a cut/compress/move map identifying every section that changes
**Depends on**: Nothing (planning phase)
**Requirements**: (none directly; this phase produces the editorial blueprint consumed by phases 17-20)
**Success Criteria** (what must be TRUE):
  1. A revised outline shows the post's section order with the thesis visible before 25% of the article
  2. A cut/compress/move map identifies every paragraph or section to cut, compress, move, or rewrite
  3. The outline marks where NEW-01 (workflow changes) and NEW-02 (failure modes) will land
  4. The center of gravity is identified: which single idea the post orbits
**Plans**: 1 plan
Plans:
- [ ] 16-01-PLAN.md — Revised outline with thesis placement and paragraph-level cut/compress/move map

### Phase 17: Thesis and Prose Rewrite
**Goal**: Readers encounter the session-architecture thesis by paragraph 2, The Session Problem is the spine connecting every section, and list-heavy prose is compressed throughout
**Depends on**: Phase 16
**Requirements**: THES-01, THES-02, THES-03, THES-04, COMP-01, COMP-02, COMP-03
**Success Criteria** (what must be TRUE):
  1. The core thesis (agents cannot sustain execution without externalized state) is stated or strongly implied before 25% of the article
  2. "An agent with no memory is not a collaborator" appears with structural emphasis (pull quote, section opener, or standalone paragraph)
  3. "The context boundary was not the conversation window. It was the working directory." appears with structural emphasis
  4. The Session Problem functions as the spine: every section either sets it up, develops it, or resolves it
  5. Hackathon details, planning-file explanations, and domain/file-name lists are noticeably shorter than before, with COMP-02 rendered as a compact scannable artifact
**Plans**: TBD

### Phase 18: Visual Overhaul
**Goal**: The post contains exactly two visuals, both deepening the session-architecture thesis, with the second visual replaced and the first improved
**Depends on**: Phase 17 (needs final prose context to position visuals correctly)
**Requirements**: VIS-01, VIS-02, VIS-03
**Success Criteria** (what must be TRUE):
  1. WorkspaceLayout is replaced with a new concept visual centered on session handoff, persistent state, or distilled memory
  2. AgentSessionFlow has improved hierarchy (one dominant visual idea), better contrast, and clearer labels or flow
  3. The post contains at most 2 visuals total, and both earn their place by directly reinforcing the thesis
**Plans**: TBD

### Phase 19: Closing and New Sections
**Goal**: The essay ends on human judgment rather than hype, and two new content additions (workflow changes, failure modes) land in the right places
**Depends on**: Phase 17 (needs rewritten prose to position new content), Phase 18 (visuals should be settled before final section work)
**Requirements**: NEW-01, NEW-02, CLOS-01, CLOS-02
**Success Criteria** (what must be TRUE):
  1. A short "What changed in my workflow" section exists, grounded in concrete before/after examples
  2. A paragraph on failure modes or limits of the planning-file approach exists, with specific failure scenarios
  3. The ending is grounded in human judgment, constraints, and future direction rather than hype or generic optimism
  4. The post feels differentiated from generic "AI changed my workflow" essays through specificity and restraint
**Plans**: TBD

### Phase 20: Final Polish
**Goal**: The complete essay reads as a polished, publication-ready piece with consistent voice, tight transitions, and no rough edges
**Depends on**: Phase 19 (all content must be in place before polish pass)
**Requirements**: COMP-04, QUAL-01, QUAL-02, QUAL-03
**Success Criteria** (what must be TRUE):
  1. Transitions between sections feel inevitable, not bolted-on
  2. Punchlines land at section endings (no trailing filler after the strong line)
  3. First-person, technically grounded, reflective, restrained tone is consistent throughout (no hype, no generic AI-blog language)
  4. The post remains at src/content/preview/decades-to-days.mdx and renders correctly at /preview/decades-to-days
**Plans**: TBD

## Progress

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
| 9. Visualization Components | v1.4 | 2/2 | Complete | 2026-02-19 |
| 10. Agentic Workflow Post | v1.4 | 2/2 | Complete | 2026-02-19 |
| 11. Session Context Visualization | v1.5 | 2/2 | Complete | 2026-02-23 |
| 12. Post Restructure | v1.5 | 2/2 | Complete | 2026-02-23 |
| 13. Hackathon Rewrite | v1.5 | 1/1 | Complete | 2026-02-24 |
| 14. Context Management Section | v1.5 | 1/1 | Complete | 2026-02-25 |
| 15. Closing and Polish | v1.5 | 1/1 | Complete | 2026-03-08 |
| 16. Outline and Cut Map | 1/1 | Complete   | 2026-03-08 | - |
| 17. Thesis and Prose Rewrite | v1.6 | 0/? | Not started | - |
| 18. Visual Overhaul | v1.6 | 0/? | Not started | - |
| 19. Closing and New Sections | v1.6 | 0/? | Not started | - |
| 20. Final Polish | v1.6 | 0/? | Not started | - |

---
*Roadmap created: 2026-02-08*
*Last updated: 2026-03-08 -- Phase 16 planned (1 plan)*
