# Phase 12: Post Restructure - Context

**Gathered:** 2026-02-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Invert the "Decades to Days" blog post so the Agentic development journey leads and Study/Chat eras move to closing. Evaluate and revise existing visualizations for the restructured narrative. No new content capabilities added.

</domain>

<decisions>
## Implementation Decisions

### Opening hook & framing
- Post opens directly with "The Hackathon" section -- no era label, no preamble
- The Agentic narrative is fully standalone; no references to Study/Chat eras, no breadcrumbs hinting at history
- "The Hackathon" and "The Workflow" subsections remain as-is (keep both)
- Drop the "Agentic Era" heading entirely -- the post just starts with the hackathon story

### Study/Chat era repositioning
- Study and Chat eras become an epilogue/coda at the end -- brief, poetic, compressed
- Heavily compress: distill each era to its essential insight in 2-3 sentences, rewriting original prose
- An explicit transition bridges from the Agentic narrative to the coda (e.g., "But it wasn't always this way")
- Whether Study and Chat remain separate sections or merge into one unified closing: Claude's discretion

### Visualization revisions
- **Down from 3 to 2 visualizations** in the restructured post
- **WorkspaceLayout**: Convert from interactive to static. Just show the directory structure -- no user interaction needed
- **SessionContextFlow + WorkflowOrchestration**: Merge into one unified visualization
  - The two currently feel duplicative -- one shows context flow across sessions, the other shows the orchestrated workflow
  - Merged viz uses the orchestrated workflow to illustrate what each session is about, then shows context flow across sessions per task
  - Primary axis (workflow phases vs. sessions): Claude's discretion based on what illustrates the concept most clearly
- **Color/layout fixes for merged viz**: Light and airy palette. The current SessionContextFlow is too dark/black (nearly unreadable). Session columns are too wide, squeezing the actual flow content too narrow
- Claude reorders visualization placement within the narrative if needed after restructuring

### 'What Changes' section
- Remove entirely -- the restructured post doesn't need explicit synthesis
- Claude evaluates whether any single insight (e.g., "bottleneck shifted from knowledge to context orchestration") is worth preserving as a sentence somewhere; discretionary
- The coda IS the ending -- no additional wrap-up after it

### Post title
- "Decades to Days" no longer fits the restructured post
- Claude proposes 3-5 title options during planning

### Claude's Discretion
- Whether Study/Chat eras stay as two brief sections or merge into one unified closing
- Primary axis of the merged SessionContextFlow/WorkflowOrchestration visualization
- Visualization ordering within the Agentic narrative
- Whether to preserve any insight from the removed 'What Changes' section
- Loading skeleton design, spacing, typography details
- New title selection (propose options for user)

</decisions>

<specifics>
## Specific Ideas

- The hackathon weekend story is the opening hook -- visceral, concrete, drops the reader into action
- Coda tone should be literary/reflective, not informational -- "remember when it was like this?" energy
- WorkspaceLayout should be dead simple -- static illustration of a directory tree
- Merged visualization should make sessions tangible by showing what tasks each session worked on, then context flow between them
- Current SessionContextFlow problems: dark/black color scheme is unreadable, session columns too wide squeezing the flow area

</specifics>

<deferred>
## Deferred Ideas

None -- discussion stayed within phase scope

</deferred>

---

*Phase: 12-post-restructure*
*Context gathered: 2026-02-22*
