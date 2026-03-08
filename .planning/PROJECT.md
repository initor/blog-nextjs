# waynewen.com Blog

## What This Is

A personal blog built with Next.js 15, TypeScript, and MDX for publishing learnings and daily notes at waynewen.com. The codebase is clean, tested, and production-hardened with shared components, Zod-validated frontmatter, 87 unit/component tests, security headers, and full SEO infrastructure (sitemap, robots.txt, JSON-LD, Atom feed). Includes custom interactive MDX visualization components (rolling update simulator, workspace file tree, workflow orchestration animation) with per-pod position tracking and deterministic animation for technical blog posts.

## Core Value

The blog must continue to render every existing page identically -- same look, same feel, same URLs. Changes improve discoverability and internal quality without altering the reader experience.

## Requirements

### Validated

- ✓ Blog posts rendered from MDX with frontmatter (title, date, tags, description) -- existing
- ✓ Three content types: blog, preview, archive -- existing
- ✓ Syntax highlighting via rehype-highlight with Catppuccin Frappe theme -- existing
- ✓ Mermaid diagram rendering in MDX content -- existing
- ✓ Custom typography system (IBM Plex + Atkinson Hyperlegible) -- existing
- ✓ Dark/light mode via media query -- existing
- ✓ Google Analytics + Vercel Analytics -- existing
- ✓ SEO metadata (OpenGraph, Twitter cards) per post -- existing
- ✓ Static generation with `generateStaticParams` -- existing
- ✓ About page with responsive photography showcase -- existing
- ✓ Configuration-driven site metadata and navigation -- existing
- ✓ DRY shared PostPageLayout across blog/preview/archive routes -- v1.0
- ✓ Zod-based frontmatter validation with build-time checks -- v1.0
- ✓ Environment variable validation via @t3-oss/env-nextjs -- v1.0
- ✓ Config-driven Google Analytics ID (no hardcoded values) -- v1.0
- ✓ Unit tests for MDX utilities (parsing, sorting, filtering) -- v1.0
- ✓ Component tests for MDX custom components -- v1.0
- ✓ Component tests for PostPageLayout -- v1.0
- ✓ Security headers (CSP, HSTS, X-Frame-Options, etc.) on all routes -- v1.0
- ✓ Error boundaries with error.tsx for content routes -- v1.0
- ✓ Differentiated error logging (file-not-found vs parse error) -- v1.0
- ✓ About page image priority fix (LCP optimization) -- v1.0
- ✓ robots.txt with crawl directives and sitemap reference -- v1.1
- ✓ sitemap.xml with all blog, archive, and static page URLs -- v1.1
- ✓ Atom feed at /feed.xml with post entries and WebSub hub -- v1.1
- ✓ Feed auto-discovery link on all pages -- v1.1
- ✓ BlogPosting JSON-LD on blog post pages -- v1.1
- ✓ metadataBase for correct URL resolution -- v1.1
- ✓ Canonical URLs on blog post pages -- v1.1
- ✓ "The Phantom Pods" preview post with custom interactive visualizations -- v1.2
- ✓ Reusable MDX visualization components (RollingUpdateVisualizer, RolloutTimeline, TimelineCompare, ReconcilePipeline, PodGrid) -- v1.2
- ✓ CloneSet Pod Thrashing blog post promoted from preview with corrected prose -- v1.3
- ✓ Per-pod position-stable animation in RollingUpdateVisualizer -- v1.3
- ✓ Seeded PRNG (mulberry32) for deterministic rolling update animation -- v1.3
- ✓ Staggered pod drain/start times (1-3 and 1-2 cycles) for realistic visualization -- v1.3
- ✓ Post-rollout consolidation step to fill empty base slots from surge positions -- v1.3
- ✓ maxSurge consistency fix across prose, component props, and defaults -- v1.3
- ✓ "Decades to Days" preview post with three-era narrative (pre-chatbot → chatbot → agentic) -- v1.4
- ✓ Hackathon turning point story (10 markdown skills, failed prior attempts, why agents succeeded) -- v1.4
- ✓ Personal workflow deep-dive (directory-as-context-boundary, GSD, parallelized agents, custom skills) -- v1.4
- ✓ WorkspaceLayout: interactive card-based file tree with agent-context annotations -- v1.4
- ✓ WorkflowOrchestration: auto-playing parallel agent session animation -- v1.4
- ✓ Post restructured to lead with Agentic journey, Study/Chat compressed to closing coda -- v1.5
- ✓ AgentSessionFlow: merged session timeline + context funnel Sankey visualization -- v1.5
- ✓ Hackathon rewritten with platform toil motivation, prior attempts, ChatGPT workflow -- v1.5
- ✓ Context management section as main payload (session architecture, state externalization) -- v1.5
- ✓ Closing revised to land session-architecture thesis -- v1.5

### Active

**Current Milestone: v1.6 Editorial Sharpening**

**Goal:** Sharpen the "Decades to Days" essay so the session-architecture thesis is unmistakable by paragraph 2, compress list-heavy prose, replace the second visual with a session-handoff concept, and add sections on workflow changes and failure modes.

**Target features:**
- Thesis visible by 25% of the article: agents execute but cannot sustain execution without externalized state
- Two key lines promoted to structural emphasis: "An agent with no memory is not a collaborator" and "The context boundary was not the conversation window. It was the working directory."
- List-heavy and enumeration-heavy prose compressed (hackathon details, planning-file explanations)
- Planning-file explanation converted to compact scannable artifact (protocol box or callout)
- WorkspaceLayout visual replaced with session-handoff / persistent-state concept visual
- AgentSessionFlow visual improved for hierarchy, contrast, and clarity
- New short section: "What changed in my workflow"
- New paragraph on failure modes / limits of the planning-file approach
- Tighter punchlines, transitions, and ending grounded in judgment rather than hype

### Deferred (Future Milestones)

- E2E tests with Playwright for critical user flows (TEST-06)
- Fix Mermaid component error state handling (COMP-01)
- Add CSS variable fallbacks in Mermaid theme configuration (COMP-02)
- Add pre-commit hooks with Husky + lint-staged (DX-01)
- Add Web Vitals monitoring with useReportWebVitals (DX-02)

### Out of Scope

- Visual/styling changes -- look and feel must remain identical
- Search or filtering -- not needed for current post count
- Database or CMS migration -- filesystem MDX is fine
- Pagination -- current post count doesn't warrant it
- Mobile app -- web-only
- Real-time features -- static blog
- OAuth or authentication -- public blog
- RSS 2.0 feed -- Atom covers all use cases
- Full MDX content in feed -- JSX not renderable in readers
- JSON Feed format -- low adoption vs Atom

## Context

- Brownfield codebase: ~30 source files, ~6 content files, 87 tests
- Next.js 15.5.9 App Router with TypeScript 5.9.3 strict mode
- Deployed to Vercel
- Vitest 4 + React Testing Library 16 for testing
- Zod 4 for runtime validation
- 7 security headers configured via next.config.ts
- SEO: robots.txt, sitemap.xml (10 URLs), JSON-LD, Atom feed with WebSub
- 7 custom MDX visualization components (5 from v1.2/v1.3, 2 from v1.4)
- Shipped through v1.4: 5 milestones, 10 phases, 15 plans
- Codebase map available at `.planning/codebase/`

## Constraints

- **Visual parity**: Every page must render identically before and after -- no regressions
- **Tech stack**: Stay on Next.js 15, TypeScript, Tailwind CSS, MDX -- no framework changes
- **Content compatibility**: All existing MDX files must continue to work without modification
- **Zero downtime**: Changes should be deployable without breaking production

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Zod for frontmatter validation | Type-safe, composable, good Next.js ecosystem fit | ✓ Good -- catches invalid frontmatter at build time |
| Vitest for testing | Lightweight, ESM-native, fast -- better fit than Jest for Next.js 15 | ✓ Good -- 87 tests in <2s, ESM works out of box |
| Shared PostPage component for DRY routes | Three near-identical page files to one shared component | ✓ Good -- eliminated ~200 lines of duplication |
| Factory pattern for metadata generation | Cleanest fit for Next.js App Router export-based API | ✓ Good -- type-safe, zero duplication |
| @t3-oss/env-nextjs for env validation | Build-time validation with clear error messages | ✓ Good -- catches missing GA ID before deploy |
| Static CSP (no nonces) | Site uses generateStaticParams; nonces require dynamic rendering | ✓ Good -- accepted tradeoff for static generation |
| Vitest v4 with .mts config | ESM compatibility with Vite v7 | ✓ Good -- requires Node >=20.17.0 |
| unsafe-inline in CSP | Required for Mermaid dangerouslySetInnerHTML and GA inline scripts | ✓ Acceptable -- documented tradeoff |
| siteUrl: waynewen.com (no www) | Canonical domain per user decision | ✓ Good -- consistent across all metadata |
| Atom over RSS 2.0 | Superior spec with required dates and content encoding | ✓ Good -- single format covers all readers |
| No schema-dts dependency | BlogPosting is 5 fields; plain object avoids extra dep | ✓ Good -- simple and sufficient |
| Pure function for feed generation | Config as parameter for testability | ✓ Good -- 23 tests without mocking |
| Template literal XML over library | No runtime dependency for straightforward XML | ✓ Good -- zero dep, readable code |
| Preview content excluded from SEO | Preview is not public-facing | ✓ Good -- clean separation |
| WebSub via Google PubSubHubbub | Free, reliable public hub | ✓ Good -- zero infrastructure cost |
| JSON string props for MDX components | JSX object literals don't survive MDX/RSC compilation | ✓ Good -- reliable serialization across server boundary |
| Literal class name lookups over template literals | Tailwind content scanner can't detect dynamic `rt-pod-${style}` | ✓ Good -- prevents CSS purge of component styles |
| 'use client' only for interactive components | RollingUpdateVisualizer needs useState/useEffect; others stay server | ✓ Good -- minimal client JS |
| Per-pod position tracking over aggregate counters | Grouped dots hid real-world pod drain variance; per-pod shows realistic stagger | ✓ Good -- each pod transitions in place |
| Seeded PRNG (mulberry32) keyed off props | Deterministic animation avoids flicker on re-render | ✓ Good -- same props always produce same sequence |
| Post-rollout consolidation step | Surge-position pods left empty holes in final grid | ✓ Good -- clean visual end state |
| CSS grid-template-rows for expand/collapse | Avoids max-height hack and content height estimation | ✓ Good -- smooth transitions without guessing |
| wl-*/wo-* CSS prefixes per component | Namespace isolation between WorkspaceLayout and WorkflowOrchestration | ✓ Good -- no style collisions |
| IntersectionObserver single-fire auto-play | Animation plays once on viewport entry, replay button after | ✓ Good -- low-distraction, user-controlled replay |
| Tick-based animation with CSS transition fills | JS advances discrete state, CSS handles smooth interpolation | ✓ Good -- clean separation of logic and rendering |
| Viz-first then content pattern | Build visualization components before essay that embeds them | ✓ Good -- matches v1.2/v1.3; components stable before content authoring |
| Paul Graham essay voice | Conversational authority, thesis-driven, no bullet lists | ✓ Good -- distinctive, opinionated writing style |

---
*Last updated: 2026-03-08 after v1.6 milestone start*
