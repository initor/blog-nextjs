# Start here: drafting this post

Read this file, then follow it.

## Task

Draft a new engineering blog post from prepared material, plus its runnable reproduction.

## Read first, in this order

0. `.planning/post-material/OUTLINE.md`
   **The drafting skeleton.** Six sections with word budgets, what each must contain, and a
   "must not" list per section to stop it bloating. Draft against this. Everything below is
   supporting evidence for it.
1. `.planning/post-material/ceiling-that-became-a-floor.md`
   Source material: thesis, the five reader traps, mechanism, evidence table, runnable
   reproduction, upstream state and citations, honest caveats, disclosure boundary.
2. `.planning/post-material/WRITING-DNA.md`
   Extracted style guide for this blog: frontmatter schema, structure, voice, hard rules.
3. `.planning/post-material/blog-storyline-ceiling-floor-2026-07-25.html`
   The storyline: five corrections, section spine, evidence placement. Open it in a browser, or
   read the HTML directly.
4. `.planning/post-material/defect-landscape-openapi-int64-2026-07-26.html`
   The case for the post: the re-derived root cause (a guard exists and checks the wrong
   property), the silence across three specification layers, the absent upstream issue, and the
   same artifact live in public specs today. This is what lifts the piece above a personal gotcha.
5. `.planning/post-material/REVIEW-fresh-eye.md`
   An outside review of the storyline written before drafting began. It names the biggest risks
   and what to cut. Read it before writing, not after.

Then read two published posts for tone: `src/content/blog/one-second-29-days.mdx` and
`src/content/blog/cloneset-pod-thrashing.mdx`.

## Then

- **Confirm title and slug with me before writing prose.** The material recommends title
  `I Capped the Wrong Integer` and slug `ceiling-that-became-a-floor`, but the review argues for a
  more arresting title. I want to decide this together.
- Draft to `src/content/preview/<slug>.mdx`.
- Build the reproduction at `public/repro/<slug>/` with `go.mod`, `main.go`, `README.md`. The
  verified program and its measured output are in the material file. Follow the README template in
  `WRITING-DNA.md`, including a `## The honest caveat` section.
- **Target about 1050 words for the post body**, allocated per section in `OUTLINE.md`. The
  material is more than twice that. Cutting is part of the job, and the outline says what to cut.

## Hard constraints, all from WRITING-DNA.md

- Zero em dashes, in any form
- `##` only. No `#` in the body, no `###`
- Zero bullet lists in the post body
- No Conclusion, Summary, or References section. The takeaway is the last sentence
- Cold open with no heading, thesis inside the first 100 words
- Structure the post by the **five corrections**, not by the bug's chronology

## Two traps to avoid

**Do not mirror the notes' format.** The material files use bullets, tables, and `###` headings for
scannability. The post allows none of that. Mine them for content and rebuild in prose.

**Do not reintroduce internal names.** The material is already genericized for public release. No
employer-internal CRD kinds or field names, no ticket IDs, no PR numbers, no internal CI job names,
no internal repo paths. The "Scope and disclosure" section in the material spells this out. Use a
neutral `someGeneration` field on a `Widget` CRD where an example is needed.

## One unverified item

Whether `docker run --platform linux/amd64` reproduces the x86 behavior. Docker was not running
when the material was prepared, and Rosetta 2 was verified **not** to reproduce it. Either verify
Docker yourself or write it as unverified in the honest caveat. Do not assert it either way.
