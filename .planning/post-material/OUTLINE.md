# Drafting outline

A skeleton to write from. Word budgets are targets, not suggestions: published posts here run 553
to 1102 words, and this material will bloat past 2500 if left unchecked. Every section carries a
**must not** list, because the failure mode here is over-explaining, not under-explaining.

The three-act shape (how the investigation started, the root cause, why it was us) and the five
corrections from the storyline are the same skeleton cut two ways. The corrections distribute
across the acts as noted per section.

**Total target: about 1050 words**, plus the cold open.

---

## Cold open, no heading, about 80 words

Action, then consequence, then the absurdity. Three sentences, the third one long. Then a single
bridge sentence for readers who do not write CRDs.

Draft:

> We put a ceiling on a CRD field so it could not hold nonsense. On ARM it worked. On x86 the
> apiserver began rejecting every write, on the grounds that the value was larger than negative
> nine quintillion.

Then the bridge. Something to the effect of: if you have ever seen a 64-bit ID come back from a
JSON API with its last digits wrong, this is the same bug wearing different clothes. Cite Twitter's
`id_str` and the 53-bit rationale, which is verified. Do **not** cite Discord as having the same
reason; their stated reason is integer overflow and they never mention 53 bits.

**Must not:** explain what a CRD is. Explain the marker syntax. Say "in this post". Use a heading.

---

## The first suspect, about 180 words

Carries **correction 1**: the reader assumes flaky CI.

Four beats and nothing else. Local tests green, every run. CI red. It read as infrastructure, and
one of the three jobs genuinely was an unrelated cancellation, which made the wrong story more
convincing. Then the error message, quoted, doing all the heavy lifting because it is absurd on its
face: a field declared with the largest possible ceiling, rejecting the value 1 for being too
large.

Kill the false suspect in a two-word sentence, per house style. Then name the assumption that was
never written down: **a number written in Go source is the number the apiserver enforces.**

End the section by planting the question the third act will answer. One sentence, something like:
if a bound this ordinary can invert itself, it should be everywhere, and it is not.

**Must not:** narrate the investigation step by step. Describe CI infrastructure. List which
platforms exist. Explain bazel, test targets, or job names. This section is four beats, not a
timeline.

---

## The number on disk, about 260 words

Carries **corrections 2, 3, and 4**. This is the densest section and the one most likely to sprawl.

The marker is ordinary Go. In JSON Schema and OpenAPI, `maximum` is a JSON *number*, and the structs
modelling the schema hold it as a float64: 53 bits of mantissa against the 63 the value needs. So
the value is rounded **at generation time, before any YAML is written**, and the committed file
already reads `maximum: 9223372036854776000`, which is 2^63, one more than MaxInt64. The bound
escaped the range it was meant to cap.

Then correct the three intuitions in sequence, compactly. Text is the only lossless part of the
pipeline; 19 characters hold the value perfectly. The two actors never read the same string, and
both parses are deterministic and correct. And the loss happened when the value entered the float64,
not when it was printed: the serializer emitted its float64 exactly, and that long decimal is simply
the shortest one that round-trips 2^63.

**Must not:** include the four-operation breakdown table (parse, serialize, parse, narrow). It is
the clearest explanation in the material and it is redundant with this section. Fold its
conclusions in and delete it. Also: no bullet list of the three corrections. They are three
sentences, not three bullets.

---

## Where the architectures disagree, about 220 words

Carries **correction 5**, and holds the section's punchline.

Validation must compare an int64 field against a float64 bound, so something narrows 2^63 back to
an int64. It does not fit, and the Go specification declines to define what happens. Quote the spec
verbatim in the single `<Callout>`, then read it flat, in the manner of "it does exactly what it
promises, which is less than it looks like". The reading to aim for: the spec is not describing an
edge case, it is declining to have an opinion, and two CPUs took that as permission to disagree.

ARM saturates to MaxInt64, which is by accident exactly the intended bound. x86 returns the integer
indefinite value, MinInt64. Show the six-byte amd64 function: a bare conversion instruction and a
return, with nowhere for a check to live.

Then the punchline, which is the strongest fact in the piece. **The toolchain does guard this path.**
On an integer field it rejects a non-integral bound. That check cannot catch this, because 2^63 as a
float64 is perfectly integral. The guard asks whether the value is a whole number when the question
that mattered was whether it survives the round trip. Someone checked. They checked the wrong
invariant.

**Must not:** claim this is a codegen bug. The float64 is structural, and the destination field in
the upstream API type is a float64 pointer. Also: verify the guard's exact wording against your
pinned version before publishing.

---

## Why almost nobody hits this, about 180 words

Pays off the question planted in act one. This is the most differentiating section in the post and
the one most writers would omit.

Architecture divergence needs the rounded bound to land **outside** int64, which only happens in the
top few hundred values of the range. Between 2^53 and 2^63 a bound is silently approximated but
stays in range, so the ceiling is slightly wrong and nobody notices or cares. Two failure modes,
only one of them loud.

Which means the catastrophic case is reachable essentially only by writing MaxInt64, and **MaxInt64
is exactly what a careful person writes when a lint rule says always set a Maximum and the field has
no real ceiling.** The one value you reach for to mean "no limit" is the one value in the range that
detonates.

Then the inversion. x86 dominates control planes, so a shipped MaxInt64 bound fails loudly and gets
fixed. The population at risk is the opposite one: teams who develop and test on ARM, ship a bound
that works perfectly for them, and meet x86 later. That population is growing.

**Must not:** claim other CRDs are silently broken on ARM clusters. That version of the argument is
backwards and the material explains why.

---

## The fix, about 130 words

Drop the ceiling and document why, rather than picking a slightly smaller wrong number. State the
transferable rule once, plainly: any integer bound above 2^53 is silently approximated the moment it
enters an OpenAPI schema, so the value the apiserver enforces is not the value you wrote.

Note the asymmetry in one sentence: the same "no practical limit" idiom is `2147483647` at 32 bits
and completely safe, because MaxInt32 round-trips through float64 exactly. A correct habit stops
being correct when the width changes.

Then the upstream state, briefly: no issue exists in the toolchain, in Kubernetes, or in the
validation libraries, and the specification layer that would have warned you is silent. If you file
one before publishing, link it here.

Link the repro on the line before the close, using the GitHub tree URL.

**Close on the compiler.** It is the other bookend to the guard punchline, and it should be the last
thing the reader sees:

> The compiler knew. It just never got to see the number.

---

## Section-by-section correction map

| Section | Correction carried | Evidence landing here |
|---|---|---|
| Cold open | none | the absurd error string |
| The first suspect | 1, flaky CI | three-platform CI split |
| The number on disk | 2, 3, 4 | the committed YAML line, the float64 round trip |
| Where the architectures disagree | 5 | Go spec quote, six-byte assembly, the integral guard |
| Why almost nobody hits this | none, pays off act one | the threshold table, MaxInt32 contrast |
| The fix | none | 2^53 rule, upstream absence, compile error |

## Standing constraints while drafting

Zero em dashes. `##` only. Zero bullet lists in the body. No Conclusion or Summary section. One
`<Callout>`, holding the Go specification quote. One diagram with a `<FigCaption>` stating the
conclusion rather than describing the picture. Footnote every constant to an upstream source. Hedge
numbers, never mechanisms.

The material files use bullets, tables, and `###` headings for scannability. The post allows none of
that. Mine them and rebuild in prose.
