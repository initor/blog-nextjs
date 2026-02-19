# Requirements: waynewen.com Blog

**Defined:** 2026-02-18
**Core Value:** Blog renders every page identically -- same look, same feel, same URLs.

## v1.4 Requirements

Requirements for the Agentic Workflow Post milestone. Each maps to roadmap phases.

### Content

- [ ] **POST-01**: Preview post with three-era narrative structure and "decades/days" thematic framing
- [ ] **POST-02**: Era 1-2 reflective setup covering pre-chatbot (2014) and chatbot (2023) learning paradigms
- [ ] **POST-03**: Era 3A hackathon turning point -- 10 markdown skills, zero code, failed prior attempts (Slack bot, chatbot, MCP), why agents succeeded
- [ ] **POST-04**: Era 3B personal workflow deep-dive -- directory-as-context-boundary, GSD resume across sessions, parallelized agents, custom skills (monet), projects/ vs ideas/ organization
- [ ] **POST-05**: Closing section returning to decades/days theme -- bottleneck shift from finding information to orchestrating context

### Visualization

- [x] **VIZ-01**: Interactive workspace layout component -- representative file tree showing projects/ and ideas/ directories with agent context per directory
- [x] **VIZ-02**: Interactive workflow orchestration component -- parallelized agent sessions across working directories

## Future Requirements

Deferred to future releases. Tracked but not in current roadmap.

### Testing & DX

- **TEST-06**: E2E tests with Playwright for critical user flows
- **COMP-01**: Fix Mermaid component error state handling
- **COMP-02**: Add CSS variable fallbacks in Mermaid theme configuration
- **DX-01**: Add pre-commit hooks with Husky + lint-staged
- **DX-02**: Add Web Vitals monitoring with useReportWebVitals

## Out of Scope

| Feature | Reason |
|---------|--------|
| Promoting post to /blog | Separate milestone -- preview first, promote later |
| New visualization components for eras 1-2 | Eras 1-2 are brief reflective prose, no interactive elements needed |
| Code syntax highlighting changes | Existing Catppuccin Frappe theme works fine |
| Tests for new visualization components | v1.2/v1.3 components were shipped without component tests; follow same pattern |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| VIZ-01 | Phase 9 | Complete |
| VIZ-02 | Phase 9 | Complete |
| POST-01 | Phase 10 | Pending |
| POST-02 | Phase 10 | Pending |
| POST-03 | Phase 10 | Pending |
| POST-04 | Phase 10 | Pending |
| POST-05 | Phase 10 | Pending |

**Coverage:**
- v1.4 requirements: 7 total
- Mapped to phases: 7
- Unmapped: 0

---
*Requirements defined: 2026-02-18*
*Last updated: 2026-02-18 after roadmap creation (traceability complete)*
