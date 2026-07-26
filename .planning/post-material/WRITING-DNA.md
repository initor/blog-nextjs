# Writing DNA

Extracted 2026-07-25 from the published engineering posts. Reusable across future posts, not
specific to any one. Derived from `one-second-29-days.mdx`, `cloneset-pod-thrashing.mdx`,
`the-weekend-it-stopped-starting-over.mdx`, the `two-leaders-one-second` preview and repro, and
the zod schema in `src/lib/mdx/schemas.ts`.

## Frontmatter

Enforced by zod in `src/lib/mdx/schemas.ts`. `readingTime` is computed at parse time, never
authored. `ogImage` exists in the schema and is used by zero content files.

| Field | Type | Required | Convention |
|---|---|---|---|
| `title` | string | yes | single quotes, Title Case, no colon |
| `date` | string | yes | `'YYYY-MM-DD'` |
| `tags` | string[] | no | exactly 3, lowercase, hyphenated |
| `category` | string | no | `'engineering'` for technical posts |
| `description` | string | no | present on bug posts, absent on essays and drafts |
| `location` | string | no | `'Palo Alto, CA'` |

Follow the newest post's field order:

```
---
title: 'I Deduped the Wrong Race'
date: '2026-05-28'
description: 'An in-memory guard kept a controller from making duplicate children. It only ever held within one process, until a faster-failover setting briefly ran two.'
tags: ['kubernetes', 'distributed-systems', 'controller-runtime']
category: 'engineering'
location: 'Palo Alto, CA'
---
```

The `description` is a two-sentence miniature of the post: setup, then a reversal hinged on
"until" or a short fix clause.

**Slug is not the title.** `one-second-29-days.mdx` carries the title `I Deduped the Wrong Race`.
The slug keeps the numeric hook; the title carries the confession.

**Drafts** live at `src/content/preview/<slug>.mdx`; promotion to `src/content/blog/` is a file move.

## Structure

**Cold open.** One to three short paragraphs before the first `##`. No heading, no preamble, no
roadmap. Thesis inside the first 100 words. The strongest example, in full:

> We turned on one setting to make failover faster. It worked. It also surfaced a duplicate the
> design had been quietly allowing since the day I wrote it.

Sentence lengths: 8 words, 2 words, 22 words. The entire post is in that block.

**Spine.** Four to six `##` sections, sentence case in the newest post, two to five words each,
readable as a story when listed alone. The forensic shape, with the reveal about 60% in:

1. the design and its known gap
2. the first suspect, killed fast
3. the actual mechanism, with code and a quoted authority
4. the fix, what it cost, repro link, closing epigram

**The false-suspect beat.** Signature move. State the wrong hypothesis, dismiss it in two words,
then name the real buried assumption:

> My first guess was a regression: some change had broken the expectation, or let a create slip
> past it. It hadn't. The expectation was intact, doing exactly what I built it for. In one
> process, it is airtight. In two, it is nothing.
>
> That was the assumption I never wrote down: one process. It lived in the shape of the map.

**Section endings are epigrams**, not transitions: "It worked. For two years, not one duplicate." /
"It does exactly what it promises, which is less than it looks like." / "Not a coincidence."

**Endings.** No Conclusion, no summary, no call to action. The last line is the sharpest line:

> The bug was one second wide. It just took a month to find something standing on it.

## Voice

**Person.** `We` for team action and naming. `I` for judgment, error, and pride. `You` only in
essay register.

**Tense.** Past for the incident, present for how the system permanently works. Held strictly
within a paragraph, then snapped back to past when the incident resumes.

**Rhythm.** Mostly 8 to 25 words, punctuated by 2 to 5 word sentences carrying the beat. Never two
long sentences in a row without a short one near.

**Mode.** Narrative-forensic, never tutorial. No numbered steps in a post body; step-by-step lives
in the repro README.

**Reader model.** Assumes Kubernetes fluency and Go literacy. Does not assume the specific
mechanism, which gets glossed inline as a comma appositive the first time it matters, never a
parenthetical and never a background paragraph:

> we create it with GenerateName, a fixed prefix and a random suffix the API server assigns

**Flat assertion.** No "I think", "arguably", "perhaps". Hedges attach to numbers, never to
mechanisms.

## Evidence habits

**Code blocks are excerpts.** Three to fourteen lines, always language-tagged, elision explicit
(`// ...`), with a comment marking the one line that matters. Sometimes a caret underline:

```go
if !canInPlaceUpdate && util.IsIntPlusAndMinus(updateOldDiff, updateNewDiff) {
// ^^^^^^^^^^^^^^^^^    one boolean gate
```

Always introduced by a sentence ending in a colon.

**No console output in post bodies.** Real command output lives in the repro README, shown as an
untagged fence under an explicit prose expectation with the surprising quantity in bold.

**Claims trace to an artifact.** Timing constants and library behavior get footnotes linking to
upstream source files. The strongest claim in a post is not argued, it is quoted from the library's
own documentation inside a `<Callout>`, then read:

> `<Callout>this implementation does not guarantee that only one client is acting as a leader
> (a.k.a. fencing).</Callout>`
>
> It does exactly what it promises, which is less than it looks like.

**Numbers come with their mechanism.** Never a bare metric: "For a CloneSet with `maxSurge` set to
5%, exactly 5% of replicas are created and destroyed on every in-place update. Not a coincidence."

**Uncertainty.** Hedge timing and scale ("about 15 seconds", "~150-line", "99% of the time"), never
mechanism. Own errors flatly. A demo's limits get a dedicated `## The honest caveat` heading
stating what was skipped, why, and why the demo still proves the claim.

**Tables are rare.** One across all three posts, two columns, backticked identifiers.

**Zero bullet lists in post bodies.** Enumerations are written as sentences.

**Diagrams.** A `mermaid` fence renders as a diagram. The one in use is a `sequenceDiagram` with
`autonumber` and `Note over` lines carrying the argument, followed by a `<FigCaption>` that states
the conclusion rather than describing the picture. Self-labeling React visualizers get no caption.

**Inline typography.** Backticks for every real identifier. **Bold** only to coin a term on first
use. *Italic* for a single contrastive word.

## Titles

Actual: `I Deduped the Wrong Race` / `Two Leaders, One Second` / `CloneSet Pod Thrashing` /
`The Weekend It Stopped Starting Over`.

Three to five words, Title Case, no colon, no subtitle, no "How to", no gerund, no question mark.
Four shapes:

1. **First-person past-tense admission.** `I Deduped the Wrong Race`. Concedes the mistake before
   the post does.
2. **Two-quantity apposition.** `Two Leaders, One Second`. The impossible pair is the title.
3. **`The <Time Unit> It <Verb Phrase>`.** Definite article, bounded period, reversal clause.
4. **`<Component> <Symptom>`** for a plain upstream bug report.

Section headings use the same compression, sentence case per the newest post.

## Hard rules

1. **No em dashes in any form**: `--`, ` -- `, `—`, ` — `. Substitute the comma appositive or the
   semicolon. This was enforced by an automated gate.
2. **`##` only.** No `#` in the body, no `###` anywhere.
3. **Every code fence is language-tagged.** A `mermaid` fence renders as a diagram, never as code.
4. **Footnote definitions at the very bottom**, `[^n]:` format, each linking to a real upstream file.
5. **Inline markdown links only.** External links get `target="_blank"` automatically; never
   hand-write anchor tags.
6. **`<Callout>` holds one short block of plain text.** It renders as a single `<p>`, so no
   multi-paragraph content, no lists, no headings inside.
7. **No images in engineering posts.** The `img` override is a fixed cover-cropped block suited to
   photo posts. Diagrams are mermaid or React components.
8. **No bullet lists in post bodies.**
9. **No Conclusion, Summary, TL;DR, or References sections.** Citations are footnotes; the takeaway
   is the last sentence.
10. **Frontmatter values in single quotes**, tags lowercase and hyphenated.

## Repro integration

Layout is `public/repro/<slug>/` with `main.go`, `go.mod`, `README.md`.

**Link to the GitHub tree URL, not the site path.** One sentence, near the end of the closing
section:

> A runnable version is [here](https://github.com/initor/blog-nextjs/tree/master/public/repro/two-leaders-one-second).

The superseded pattern linked the raw file on the site, which browsers download directly instead of
rendering. Point at the repo directory so readers see the README and source on GitHub.

**Never inline the whole program.** Inline only the load-bearing block, framed by a sentence that
sets minimal setup and then narrows: "Reproducing this needs nothing exotic: `ConfigMap` as parent,
`Secret` as child, no CRDs. The important part is only this:"

**README template**, in order: `# Reproducing "<Post Title>"`, one-paragraph scope stating size and
what is not needed, `## Prerequisites`, `## Setup`, `## Reproduce the bug` with bolded terminal
labels, expected output in prose with the surprising quantity bolded then an untagged fence,
`## What <flag> does`, `## See the normal behavior`, `## The honest caveat`, `## Clean up`. The
README carries a callback to the post's own hook.

## Checklist

- Cold open, 2 to 3 sentences, action then consequence, thesis within 100 words
- 4 to 6 `##` sections, sentence case, readable as a spine
- A discarded hypothesis, killed in a two-word sentence
- Each new mechanism glossed as a comma appositive on first use
- One code excerpt per claim, elided, with a comment on the load-bearing line
- One diagram plus a `<FigCaption>` stating the conclusion
- One `<Callout>` holding a quoted authority or the pivot aphorism
- Footnote every constant to upstream source
- Hedge numbers, never mechanisms
- Close on an epigram; link the repro in the paragraph before it
- Zero em dashes, bullets, `###`, images, or Conclusion sections
