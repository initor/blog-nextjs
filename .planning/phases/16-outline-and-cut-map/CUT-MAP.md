# Cut/Compress/Move Map: "The Weekend Everything Shifted"

This document provides paragraph-level directives for every section of the current essay at `src/content/preview/decades-to-days.mdx`. Each directive is actionable without re-reading the full post.

## How to Read This Map

| Directive | Meaning |
|-----------|---------|
| **KEEP** | Paragraph stays as-is. No changes needed. |
| **COMPRESS** | Paragraph stays but must be shortened. Specific guidance on what to cut is included. |
| **MOVE** | Paragraph relocates to a different position. Target location specified. |
| **REWRITE** | Paragraph stays in position but prose must be substantially rewritten. Reason included. |
| **CUT** | Paragraph is removed entirely. Reason included. |
| **NEW** | Content that does not exist yet. Placement and purpose specified. |

---

## Opening Paragraph

**"Over three days, four of us, working half-time..."**

**Directive: REWRITE** (THES-01)

**Reason:** The opening hooks with hackathon scale ("ten production-ready agent skills"), but the thesis is entirely absent. The reader gets logistics and an open question ("what changed?") but no signal about the real discovery. By the time the thesis appears (paragraph 8, ~41% in), readers who skim may never reach it.

**Guidance for rewrite:**
- Keep the hook: the scale (three days, ten skills) is compelling. Preserve the first two sentences or compress them into one.
- Add the thesis pivot within this paragraph or as a brief second paragraph. The reader should understand by the end of the opening that the real discovery was not speed but sustainability: agents could build, but sustaining that ability across sessions required externalizing state.
- The question "what changed?" can remain, but it should be reframed from "how did we go fast?" to "what made it possible to sustain this beyond a weekend?"
- Do not bury the thesis under hackathon logistics. The opening must do two things: hook (scale) and orient (thesis).

---

## The Hackathon

### Paragraph 1: "If you run a platform serving thousands of engineers..."

**Directive: COMPRESS** (COMP-01, COMP-03)

**Reason:** This paragraph establishes operational toil at scale, which is valid setup. But the domain enumeration is too long. The sentence listing specific operational scenarios ("Someone's deploy failed... A service is being throttled... hardware is being remediated, nodes are draining, capacity is being rebalanced") runs to five examples where two would suffice.

**Guidance for compression:**
- Keep the opening setup ("If you run a platform serving thousands of engineers, you know what operational toil feels like").
- Reduce the domain list from five specific scenarios to two or three, or replace the enumeration with a single characterizing sentence (e.g., "Every failure, throttle, and capacity shift lands on a platform engineer who has to investigate and respond with judgment").
- Keep the closing insight about toil being inherent to scale. That earns its place.
- Target: reduce from ~120 words to ~80 words.

### Paragraph 2: "This is the problem that motivated the hackathon..."

**Directive: COMPRESS** (COMP-01, COMP-03)

**Reason:** The three prior attempts (Slackbot, chatbot wrapper, MCP server) are important for establishing that this was not naive first-try success. But the enumeration is verbose. Each attempt gets a one-line description plus the shared-flaw analysis, totaling ~130 words for what could be ~70.

**Guidance for compression:**
- Keep the "tried three times before" framing.
- Compress the three attempts into a single sentence listing them, then state the shared flaw once: they lacked structured context modeling, reducing every interaction to a single-round LLM call.
- Cut the per-attempt detail ("A Slackbot that queried platform APIs. A chatbot wrapper with function calling over the same APIs. An MCP server exposing tool endpoints."). Replace with something like: "A Slackbot, a chatbot wrapper, an MCP server. Different interfaces, same flaw."
- Keep the diagnosis: "Without curated base context... answers were generic."
- Target: reduce from ~130 words to ~70 words.

### Paragraph 3: "The fourth attempt changed the approach entirely..."

**Directive: COMPRESS** (COMP-01)

**Reason:** The ChatGPT workflow protocol is important context (it explains why the fourth attempt succeeded), but the explanation is longer than necessary. The sentence about "the core bottleneck was manual context management across multi-session projects" is doing thesis-adjacent work that now belongs in the opening.

**Guidance for compression:**
- Keep: "The fourth attempt changed the approach entirely" and the core idea that a complete protocol was designed before the hackathon.
- Compress the middle: the reader does not need the full enumeration of protocol steps ("how to initialize a skill, what sections each specification should include, how to test each skill, how to iterate on failures").
- The sentence about manual context management as the bottleneck can be shortened or dropped, since the rewritten opening will have already established this theme.
- Target: reduce from ~120 words to ~70 words.

### Paragraph 4: "Three days, four engineers, ten skills..."

**Directive: COMPRESS** (COMP-01, COMP-03)

**Reason:** Domain enumeration again: "workload scheduling failures, data-plane runtime failures, planned disruptions, application log retrieval, and pool capacity analysis." This is the second list of skill domains; the reader does not need both.

**Guidance for compression:**
- Keep the summary line ("Three days, four engineers, ten skills") and the inversion insight ("from writing code to writing specifications").
- Cut or heavily compress the domain list. If paragraph 1 already names a few domains, this paragraph should not re-enumerate.
- Keep the bridge sentence: "But it also created a new problem: managing context across sessions." This is critical for transitioning to The Session Problem.
- Target: reduce from ~110 words to ~60 words.

---

## The Session Problem

### Paragraph 1: "The hackathon worked. But it also surfaced a problem..."

**Directive: KEEP**

**Reason:** Clean two-sentence transition. Sets up the spine. No changes needed.

### Paragraph 2: "When you close an agent session and open a new one..."

**Directive: REWRITE** (THES-04)

**Reason:** The content is correct and important, but the phrasing is somewhat explanatory and generic. Since the opening will now carry a thesis-forward version, this paragraph should deepen rather than introduce. It should feel like the spine intensifying, not explaining something for the first time.

**Guidance for rewrite:**
- Keep the core mechanism: ephemeral context window, everything lost between sessions.
- Sharpen the language. "Everything is gone" is good; build from there.
- The "during the hackathon this was manageable" qualification can be compressed to half a sentence.
- Make the closing hit harder: the first session makes progress, the second starts from scratch. This should feel like a punch, not a summary.

### Paragraph 3: "This is not a minor inconvenience..."

**Directive: REWRITE** (THES-02, THES-04)

**Reason:** Contains the critical THES-02 line ("An agent with no memory of prior sessions is not a collaborator; it is a stranger you have to re-brief every morning"). This line currently sits mid-paragraph, embedded in a longer argument. THES-02 requires it to have structural emphasis.

**Guidance for rewrite:**
- Extract "An agent with no memory is not a collaborator" into a standalone paragraph or make it the section-opening sentence of this block. It should not be buried.
- The "context that makes collaboration productive" enumeration ("the shared understanding of what has been tried, what has been decided, what comes next") can be compressed.
- Keep the closing pivot: "The question now was whether they could sustain execution across time." This connects to the thesis.

### Paragraph 4: "The solution, when it emerged, was almost embarrassingly simple..."

**Directive: REWRITE** (COMP-02, COMP-03)

**Reason:** This is the planning-file enumeration paragraph. It lists five files by name (ROADMAP.md, STATE.md, CONTEXT.md, PLAN.md, SUMMARY.md) with inline descriptions. COMP-02 requires converting this to a compact scannable artifact.

**Guidance for rewrite:**
- Keep the framing: "If the context window is ephemeral, externalize the state into files that persist."
- Convert the five-file list into a compact artifact: a callout box, a small table, or a tight bulleted protocol. Not a run-on sentence with five items.
- Keep the closing insight: "These files are not bureaucratic overhead. They are the mechanism by which one session hands off to the next."
- The "Not documentation written for humans, but memory written for agents" line is strong; keep it.

### Paragraph 5: "What surprised me was how quickly this compounded..."

**Directive: KEEP**

**Reason:** This is one of the strongest paragraphs in the essay. "By the fifth phase, the agent already knew decisions from phases one through four" is concrete and compelling. The "not the full history, but the right history" formulation is tight. No changes needed.

### AgentSessionFlow visual + caption

**Directive: REWRITE** (VIS-01)

**Reason:** VIS-01 requires improved hierarchy, contrast, and clarity. The visual itself needs component-level changes (Phase 18 work). The caption is adequate but could be tighter.

**Guidance:**
- Caption currently runs to two sentences plus a third. Compress to two sentences maximum.
- Ensure the visual conveys one dominant idea: each session starts with compressed, curated context.
- Implementation details belong to Phase 18; this directive is for editorial awareness.

### Paragraph 6: "This pattern of distilling what matters between sessions..."

**Directive: REWRITE** (THES-03)

**Reason:** Contains the THES-03 line: "The context boundary was not the conversation window. It was the working directory." This needs structural emphasis, similar to THES-02.

**Guidance for rewrite:**
- Give the THES-03 line its own paragraph or make it a section-closing standalone sentence. It is one of the two most quotable lines in the essay and should not be embedded in a longer paragraph.
- The "starting ahead, not starting over" formulation is strong; keep it.
- Compress the rest of the paragraph to serve as setup for the standalone THES-03 line.

### Paragraph 7: "That insight unlocked something I had not planned for..."

**Directive: COMPRESS** (COMP-03)

**Reason:** The enumeration of non-coding uses ("Engineering design documents, document reviews, prototyping sessions") is valid but slightly long. The key point (the pattern extends beyond code) can be made in fewer words.

**Guidance for compression:**
- Keep the insight that the pattern generalizes beyond coding.
- Reduce the three examples to two, or fold them into a single sentence.
- Keep: "The working directory became the universal context boundary."
- Target: reduce from ~100 words to ~60 words.

### WorkspaceLayout visual + caption

**Directive: CUT** (VIS-02)

**Reason:** VIS-02 requires replacing this visual with a session-handoff concept visual. The current WorkspaceLayout shows directory structure, which is less thesis-reinforcing than a visual showing how one session's output becomes the next session's input. The current visual and its caption will be removed entirely.

**Guidance:** Phase 18 will create the replacement visual. The cut map records this as CUT; the NEW directive below specifies the replacement.

### Paragraph 8: "The manual version of this workflow was effective but tedious..."

**Directive: COMPRESS** (COMP-03)

**Reason:** Recapitulates the ChatGPT protocol design, which was already covered in The Hackathon paragraph 3. The repetition ("using ChatGPT to draft the markdown files") adds little.

**Guidance for compression:**
- Keep the key progression point: the workflow was manual and tedious, and the pattern had not yet become infrastructure.
- Cut the repeated detail about ChatGPT drafting protocols.
- This paragraph should serve primarily as a bridge to the GSD paragraph below.
- Target: reduce from ~100 words to ~40 words.

### Paragraph 9: "Then I found GSD (get-shit-done)..."

**Directive: COMPRESS** (COMP-03)

**Reason:** The evolution summary ("manual context management during the hackathon, semi-automated protocols designed with ChatGPT's help, and finally a fully automated plugin") is solid but could be tighter. The closing sentence restates the thesis, which is good, but the paragraph as a whole runs long.

**Guidance for compression:**
- Keep the GSD introduction and the evolution arc.
- Compress the "What I had been doing manually" list.
- Keep the closing: "The insight from the hackathon... had become infrastructure that any project could use from the first minute."
- Target: reduce from ~100 words to ~60 words.

---

## New Content Directives

### NEW: Thesis pivot in opening (after paragraph 1)

**Directive: NEW** (THES-01)

**Placement:** Within or immediately after the rewritten opening paragraph.
**Content:** 1-2 sentences that name the real discovery: not that agents could execute (the hackathon proved that), but that sustaining execution across sessions required externalizing state. This thesis pivot must land before the 25% mark (~415 words).

### NEW: "What Changed in My Workflow" section

**Directive: NEW** (NEW-01)

**Placement:** After the AgentSessionFlow visual, before the session-handoff concept visual. Corresponds to Section 5 in OUTLINE.md.
**Content:** 2-3 paragraphs of concrete before/after examples. Before: re-briefing every morning, losing decisions, repeating work. After: agent reads STATE.md, picks up mid-task, decisions compound. Grounded in anecdotes, not abstraction.

### NEW: Session-handoff concept visual (replaces WorkspaceLayout)

**Directive: NEW** (VIS-02, VIS-03)

**Placement:** After the "What Changed in My Workflow" section, before the failure-modes paragraph. Corresponds to Section 6 in OUTLINE.md.
**Content:** A concept visual centered on session handoff. Shows how one session's output (SUMMARY.md, STATE.md) becomes the next session's starting context. Must deepen the thesis more directly than the current directory-structure visual.

### NEW: Failure modes paragraph

**Directive: NEW** (NEW-02)

**Placement:** After the session-handoff concept visual, before the Conclusion. Corresponds to Section 7 in OUTLINE.md.
**Content:** 1-2 paragraphs acknowledging limits: state files that drift when humans make changes outside the tracked flow, overhead of initializing planning files for one-session tasks, context files that bloat, risk of over-structured plans constraining agent adaptability. Honest and specific.

---

## Conclusion

### Paragraph 1 (Study era): "It wasn't always this way..."

**Directive: KEEP**

**Reason:** Phase 15 already revised this. The Raft consensus example is specific and grounding. Voice is strong. No changes needed for CLOS-01 or CLOS-02.

### Paragraph 2 (Chat era): "Then, around 2023, chatbots collapsed the acquisition cost..."

**Directive: KEEP**

**Reason:** Phase 15 already polished the verbs. "Collapsed the acquisition cost" and "A faster reference manual, but the work was still yours to do" both land well. No changes needed.

### Paragraph 3 (Agentic era): "Now the bottleneck is neither knowledge nor execution..."

**Directive: KEEP**

**Reason:** Phase 15 rewrote this to echo the session-architecture thesis. The closing ("a weekend of building becomes a month of building without losing a step") lands the compounding metaphor. With the addition of NEW-02 (failure modes) before this paragraph, the conclusion now sits in a stronger position: it follows an honest acknowledgment of limits, which makes the closing assertion feel earned rather than uncritical. No prose changes needed; the structural improvement comes from what precedes it.

---

## Cross-Cutting Notes

### Repeated Ideas

1. **ChatGPT protocol design** appears twice: Hackathon paragraph 3 ("I used ChatGPT to design the full end-to-end workflow protocol") and Session Problem paragraph 8 ("using ChatGPT to draft the markdown files, the project goals, the milestone tracking"). The second instance is redundant. COMPRESS directive on paragraph 8 addresses this.

2. **Domain enumeration** appears twice: Hackathon paragraph 1 (five operational scenarios) and Hackathon paragraph 4 (five skill domains). Both cover similar ground. COMPRESS directives on both address this; at most one short list should survive.

3. **"The question was..."** framing appears twice: Opening ("The question worth asking is: what changed?") and Session Problem paragraph 3 ("The question now was whether they could sustain execution across time"). The second is stronger and thesis-connected. The first should be rewritten to avoid the echo.

### Tone Shifts

1. **Hackathon paragraphs 1-2** read slightly more formal and expository than the rest of the essay. The voice becomes more personal and reflective starting at The Session Problem. The compression of Hackathon paragraphs should also bring the tone into alignment: less explaining, more showing.

2. **Session Problem paragraphs 8-9** (manual workflow, GSD discovery) shift toward product description. "GSD handled automatically" reads like feature marketing. The COMPRESS directives should focus on keeping the author's reflective voice rather than describing a tool's capabilities.

3. **The first-person voice is strongest** in: Session Problem paragraphs 2-3 (epiphany about ephemeral context), the compounding paragraph (paragraph 5), and the Conclusion. These should be the emotional anchors; surrounding paragraphs should not compete.

### Spine Strength (THES-04: The Session Problem as spine)

| Section | Spine Connection | Strength |
|---------|-----------------|----------|
| Opening | Currently none. After rewrite: thesis stated. | Weak (becomes strong after REWRITE) |
| Hackathon para 1-2 | Sets up the problem space. Connection is implicit. | Medium |
| Hackathon para 3-4 | Introduces structured specs, bridges to "new problem." | Medium |
| Session Problem para 1-3 | Spine at full strength. Core thesis articulated. | Strong |
| Session Problem para 4-5 | Solution and compounding. Spine continues. | Strong |
| Session Problem para 6 | "Context boundary" insight. Spine extends. | Strong |
| Session Problem para 7-9 | Generalization and tooling. Spine loosens here. | Medium (weakest in section) |
| NEW-01 (workflow changes) | Concrete manifestation of the spine. | Strong (expected) |
| NEW-02 (failure modes) | Acknowledges spine limits. Adds credibility. | Medium-strong (expected) |
| Conclusion | Echoes spine through three-era framing. | Strong |

**Key observation:** The spine is strongest in Session Problem paragraphs 1-6 and weakest in paragraphs 7-9 (the manual/GSD evolution). Compressing those paragraphs will prevent the spine from going slack. Adding NEW-01 after the visual will restore momentum before the conclusion.

### Overall Quality Notes

- **COMP-04** (tighter overall, stronger punchlines and transitions): The COMPRESS and REWRITE directives above collectively serve COMP-04. Each section ending should be checked for trailing filler after the strong line. Phase 20 owns the final polish pass.
- **QUAL-03** (post remains at src/content/preview/decades-to-days.mdx): All edits must be made to the existing file at this path. No file moves, no renames, no new MDX files.

---
*Generated: 2026-03-08*
*Supports: Phases 17-20 execution*
