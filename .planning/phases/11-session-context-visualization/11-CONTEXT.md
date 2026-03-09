# Phase 11: Session Context Visualization - Context

**Gathered:** 2026-02-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Build a new interactive component that shows how context flows and accumulates across agent sessions. The visualization communicates context inheritance — each session produces context, which gets summarized/pruned at session boundaries, and the next session inherits the distilled result. This is a standalone component (viz-first pattern) that will later be embedded in the revised "Decades to Days" post.

</domain>

<decisions>
## Implementation Decisions

### Visual form
- Sankey-style flow diagram showing context as flowing bands between sessions
- Start with horizontal layout (consistent with existing visualizations), but if 3 sessions don't fit the narrow content column, switch to vertical
- Must fit within the blog's narrow content column — no horizontal scrolling
- Mobile-friendly: no pinch/scroll required, works on all devices
- Explore both "distinct session blocks connected by flows" and "continuous river with narrows" during implementation — pick whichever communicates the summarize/prune cycle more clearly to a first-time reader

### Interaction model
- Passive animation: auto-plays on viewport entry using IntersectionObserver, then settles into a static final state
- Purely visual — no hover states, no tooltips, no click interactions
- Minimal interaction required from the reader; the shape and animation do the storytelling

### Data story
- Simplified illustrative example — not tied to GSD workflow specifically
- 3 sessions showing the pattern: Session 1 produces context → summarized → Session 2 inherits + produces more → summarized → Session 3 inherits accumulated context
- Growing accumulation: the inherited context band visibly grows across sessions to show the compound effect
- Context bands grow within each session (start thin, widen as work produces more context)

### Context representation
- Sankey bands narrow at "pinch points" between sessions — a physical constriction shape showing compression
- Some bands disappear entirely at pinch points (pruned/discarded), while others continue through narrower (summarized) — visually distinguishes what gets kept vs. dropped
- Existing blog color palette (blue/green/purple tones from WorkflowOrchestration and RolloutTimeline) — consistent visual language across the post

### Claude's Discretion
- Whether the final form is distinct-blocks or continuous-river (pick based on clarity for first-time readers)
- Animation replay behavior (replay on re-entry vs. play once and stay static)
- Animation timing/pace (tuned to feel natural with 3 sessions)
- Specific band semantics (what each flowing band represents — abstract categories or narrative labels)
- Exact color assignments for different band types
- Typography and spacing within the visualization

</decisions>

<specifics>
## Specific Ideas

- "I want the summarize and the prune to be super clear" — the pinch point between sessions is the hero visual beat
- Existing visualizations (WorkspaceLayout, WorkflowOrchestration) are horizontal — this should feel like part of the same family
- The blog intentionally uses a narrow column width to keep readers focused — the visualization must respect this constraint
- Follow established component patterns: client-side, JSON string props, CSS-prefixed styles, IntersectionObserver

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 11-session-context-visualization*
*Context gathered: 2026-02-22*
