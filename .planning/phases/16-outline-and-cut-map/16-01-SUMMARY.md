---
phase: 16-outline-and-cut-map
plan: 01
subsystem: content
tags: [editorial, outline, prose-analysis, essay-structure]

# Dependency graph
requires:
  - phase: 15-closing-and-polish
    provides: Complete essay at src/content/preview/decades-to-days.mdx
provides:
  - Revised section outline with thesis placement before 25% and center of gravity
  - Paragraph-level cut/compress/move/rewrite directives for every section
  - NEW-01 and NEW-02 landing zones marked in both documents
  - Visual placement plan (VIS-01 improved, VIS-02 replaced)
affects:
  - 17-thesis-and-prose-rewrite
  - 18-visual-overhaul
  - 19-closing-and-new-sections
  - 20-final-polish

# Tech tracking
tech-stack:
  added: []
  patterns: []

key-files:
  created:
    - .planning/phases/16-outline-and-cut-map/OUTLINE.md
    - .planning/phases/16-outline-and-cut-map/CUT-MAP.md
  modified: []

key-decisions:
  - "Center of gravity identified: agents execute but cannot sustain execution without externalized state"
  - "Thesis currently lands at 41% (~680 words); must move to opening paragraph for THES-01"
  - "WorkspaceLayout visual marked for full replacement with session-handoff concept visual"
  - "NEW-01 (workflow changes) placed after AgentSessionFlow visual; NEW-02 (failure modes) placed before Conclusion"
  - "Session Problem paragraphs 7-9 identified as weakest spine section; COMPRESS directives issued"

patterns-established: []

requirements-completed: [BLUEPRINT-16]

# Metrics
duration: 4min
completed: 2026-03-08
---

# Phase 16 Plan 01: Outline and Cut Map Summary

**Revised essay outline placing thesis before 25%, paragraph-level cut map with 20+ directives, center of gravity identified, and NEW-01/NEW-02 landing zones marked for phases 17-20**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-08T22:38:11Z
- **Completed:** 2026-03-08T22:42:39Z
- **Tasks:** 2
- **Files created:** 2

## Accomplishments
- Identified center of gravity as a single idea: agents execute but cannot sustain execution without externalized state
- Analyzed current structure and found thesis lands at 41% (paragraph 8), which must move to before 25% per THES-01
- Created 8-section revised outline with thesis-forward opening, compressed Hackathon, spine-strengthened Session Problem, two new sections (workflow changes, failure modes), and visual placements
- Created paragraph-level cut map with directives for every paragraph: REWRITE (4), COMPRESS (7), KEEP (4), CUT (1), NEW (4)
- All 18 v1.6 requirement IDs referenced across the two documents
- Cross-cutting analysis: repeated ideas (ChatGPT protocol appears twice), tone shifts (Hackathon too formal, GSD paragraphs too product-like), and spine strength mapping

## Task Commits

Each task was committed atomically:

1. **Task 1: Produce revised outline with thesis placement and center of gravity** - `9192e5c` (feat)
2. **Task 2: Produce paragraph-level cut/compress/move map** - `021da1f` (feat)
3. **Fix: Add missing COMP-04 and QUAL-03 references** - `ea9fafb` (fix)

## Files Created/Modified
- `.planning/phases/16-outline-and-cut-map/OUTLINE.md` - Revised section outline with center of gravity, thesis placement, new section slots, and visual placement plan
- `.planning/phases/16-outline-and-cut-map/CUT-MAP.md` - Paragraph-level directives (KEEP/COMPRESS/MOVE/REWRITE/CUT/NEW) for every section, plus cross-cutting analysis

## Decisions Made
- Center of gravity is "agents execute but cannot sustain execution without externalized state" (not "agents are fast" or "hackathons work")
- Thesis must move from paragraph 8 (~41%) to the opening paragraph or a brief second paragraph (~<25%)
- WorkspaceLayout visual (directory structure) replaced entirely with session-handoff concept visual that better reinforces the thesis
- NEW-01 placed after AgentSessionFlow visual (reader understands mechanism, wants practical implications)
- NEW-02 placed before Conclusion (grounds the essay before closing, prevents uncritical advocacy)
- Hackathon section compressed from 4 paragraphs to 2-3 via domain-list and prior-attempts tightening
- THES-02 ("agent with no memory is not a collaborator") and THES-03 ("context boundary was the working directory") both flagged for structural emphasis (standalone paragraph or section-opening sentence)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added COMP-04 and QUAL-03 requirement references**
- **Found during:** Overall verification after Task 2
- **Issue:** Verification check showed COMP-04 (punchlines/transitions) and QUAL-03 (file path preservation) missing from both documents
- **Fix:** Added COMP-04 reference to Conclusion section in OUTLINE.md and cross-cutting notes in CUT-MAP.md; added QUAL-03 reference to both documents
- **Files modified:** OUTLINE.md, CUT-MAP.md
- **Committed in:** ea9fafb

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** Essential for requirement coverage completeness. No scope creep.

## Issues Encountered
- .planning directory is gitignored; required `git add -f` for all commits. Known issue from prior phases.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- OUTLINE.md and CUT-MAP.md provide complete editorial directives for phases 17-20
- Phase 17 (Thesis and Prose Rewrite) can execute directly from these artifacts without re-analyzing the full post
- Phase 18 (Visual Overhaul) has clear VIS-01 improvement and VIS-02 replacement directives
- Phase 19 (Closing and New Sections) has NEW-01 and NEW-02 content specs with exact placement
- Phase 20 (Final Polish) has COMP-04 and QUAL cross-cutting notes

---
*Phase: 16-outline-and-cut-map*
*Completed: 2026-03-08*

## Self-Check: PASSED
- OUTLINE.md: FOUND
- CUT-MAP.md: FOUND
- 16-01-SUMMARY.md: FOUND
- Commit 9192e5c: FOUND
- Commit 021da1f: FOUND
- Commit ea9fafb: FOUND
