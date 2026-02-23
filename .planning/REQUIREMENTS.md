# Requirements: waynewen.com Blog

**Defined:** 2026-02-22
**Core Value:** Blog renders every page identically -- same look, same feel, same URLs.

## v1.5 Requirements

Requirements for the Agentic Workflow Post Revision milestone. Each maps to roadmap phases.

### Hackathon Rewrite

- [ ] **HACK-01**: Hackathon section grounded in real motivation -- workload platform operational toil (not Kubernetes-specific, framed as inherent to platform ownership at scale)
- [ ] **HACK-02**: Prior failed attempts described -- Slackbot, chatbot wrapper, MCP server -- and why they fell short (limited tool chains, poor exploration, inadequate answer quality)
- [ ] **HACK-03**: ChatGPT-designed multi-session workflow described -- using one AI to design the stop/resume protocol for another (ChatGPT named explicitly)
- [ ] **HACK-04**: ~10 Claude Code skills as hackathon outcome, built using the ChatGPT-generated markdown scaffold

### Context Management

- [ ] **CTX-01**: Session architecture section -- stop/resume protocol, how context is preserved across sessions
- [ ] **CTX-02**: State externalization -- planning docs, summaries, decisions as files that any session can load
- [ ] **CTX-03**: Context inheritance across phases -- how each phase carries forward summarized context from previous sessions
- [ ] **CTX-04**: Generalization to non-coding work -- doc review, doc authoring, prototyping all using working-directory-as-context-boundary pattern
- [ ] **CTX-05**: GSD automation -- how the manual stop/resume/summarize cycle matured into tooling

### Structure

- [ ] **STRC-01**: Closing section revised to reflect context-management thesis (not generic "orchestrating context")
- [ ] **STRC-02**: Study and Chat era sections reviewed for tone -- minor touch-ups only, repositioned as reflective closing
- [ ] **STRC-03**: Restructure post to lead with Agentic development journey; Study/Chat era reflections moved to closing section

### Visualization

- [x] **VIZ-01**: New interactive visualization component showing context flow across sessions (session timeline merged with context funnel concept)
- [x] **VIZ-02**: Evaluate existing WorkspaceLayout and WorkflowOrchestration -- keep if they earn their place in restructured post, remove if redundant

### Quality

- [ ] **QUAL-01**: Paul Graham essay voice maintained throughout all revised and new sections
- [ ] **QUAL-02**: Post remains in preview (src/content/preview/decades-to-days.mdx), not promoted to blog

## Future Requirements

### Deferred (from previous milestones)

- **TEST-06**: E2E tests with Playwright for critical user flows
- **COMP-01**: Fix Mermaid component error state handling
- **COMP-02**: Add CSS variable fallbacks in Mermaid theme configuration
- **DX-01**: Add pre-commit hooks with Husky + lint-staged
- **DX-02**: Add Web Vitals monitoring with useReportWebVitals

## Out of Scope

| Feature | Reason |
|---------|--------|
| Promoting post to blog | Author decides when post is ready -- stays in preview for now |
| New blog posts | This milestone revises the existing Decades to Days post only |
| Visual/styling changes to site | Look and feel must remain identical |
| Tests for visualization components | Follow existing pattern -- v1.2-v1.4 viz components have no tests |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| HACK-01 | Phase 13 | Pending |
| HACK-02 | Phase 13 | Pending |
| HACK-03 | Phase 13 | Pending |
| HACK-04 | Phase 13 | Pending |
| CTX-01 | Phase 14 | Pending |
| CTX-02 | Phase 14 | Pending |
| CTX-03 | Phase 14 | Pending |
| CTX-04 | Phase 14 | Pending |
| CTX-05 | Phase 14 | Pending |
| STRC-01 | Phase 15 | Pending |
| STRC-02 | Phase 15 | Pending |
| STRC-03 | Phase 12 | Pending |
| VIZ-01 | Phase 11 | Complete |
| VIZ-02 | Phase 12 | Complete |
| QUAL-01 | Phase 15 | Pending |
| QUAL-02 | Phase 15 | Pending |

**Coverage:**
- v1.5 requirements: 16 total
- Mapped to phases: 16
- Unmapped: 0

---
*Requirements defined: 2026-02-22*
*Last updated: 2026-02-22 after roadmap creation — traceability complete*
