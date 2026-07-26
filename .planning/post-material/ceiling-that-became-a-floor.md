# Post material: the CRD bound that inverted

Captured 2026-07-25 from a debugging session in a different repo. Everything below was verified
in that session; the "Verified how" column says by what means. This file is source material for a
post, not a draft. Write the post from it, do not paste it.

## Working titles

See `WRITING-DNA.md` in this directory for the full formula. Titles run three to five words, Title
Case, no colon, and come in four shapes. Shape-matched candidates:

**Shape 1, first-person admission** (the newest post's mode, `I Deduped the Wrong Race`):
- **I Capped the Wrong Integer** (recommended)
- I Set a Maximum and Got a Minimum

**Shape 2, two-quantity apposition** (`Two Leaders, One Second`):
- Two Architectures, One Bound
- One Marker, Two Answers

**Shape 4, component plus symptom** (`CloneSet Pod Thrashing`):
- CRD Maximum Inversion

Recommended pairing, following the house habit of a slug that keeps the numeric hook while the
title carries the confession (slug `one-second-29-days` under title `I Deduped the Wrong Race`):

- title: `I Capped the Wrong Integer`
- slug: `ceiling-that-became-a-floor`

Draft frontmatter `description`, in the house two-sentence shape (setup, then reversal on "until"):

> A CRD field was marked with the largest integer a bound can hold. It validated correctly on ARM
> and rejected every write on x86, until the generated schema turned out to disagree with itself.


## The one-sentence version

A Kubernetes CRD field marked with the largest possible integer ceiling was rejected on x86 and
accepted on ARM, because the ceiling stopped being a ceiling somewhere between the Go source and
the apiserver.

## Why it is worth a post

Three things make this more than a war story:

1. The failure is **architecture-dependent**, which almost nothing in a Go/Kubernetes stack is.
2. Local tests on Apple Silicon pass 100% of the time. The bug is **structurally invisible** on the
   machine where the code is written.
3. Go has a **compile-time guardrail for exactly this mistake**, and it cannot fire, because the
   value arrives through a YAML file at runtime. The language tried to help and was routed around.
4. Trying to reproduce the x86 behavior on an Apple Silicon machine by cross-compiling an x86
   binary **also fails to show it**: Rosetta 2 returns the ARM answer. The bug hides on ARM, and it
   keeps hiding when you emulate x86 on ARM to hunt for it.

Point 3 is the strongest beat and is probably the thesis. Point 4 is the best late-post turn.

---

## Upstream state and citations

Researched 2026-07-25 with sources checked. Treat the negative findings as findings.

### There is a guard, and it checks the wrong property

This is the sharpest fact in the whole investigation and it upgrades the thesis.

`controller-tools` does not blindly accept the marker. In `pkg/crd/markers/validation.go` the
`Maximum` and `Minimum` markers are declared as `type Maximum float64` / `type Minimum float64`, and
`ApplyToSchema` carries a guard along the lines of `if schema.Type == Integer && !isIntegral(value)`,
which rejects a non-integral bound on an integer field.

**That guard cannot catch this.** 2^63 as a float64 *is* integral. The check asks "is this a whole
number?" when the question that mattered was "does this value survive the round trip?" So MaxInt64
passes review and sails straight through.

So the story is not "nobody checked." It is **"someone checked, and checked the wrong invariant."**
Pair that with the Go compiler beat and the post has two guardrails: one that asks the wrong
question, and one that asks the right question but cannot reach the value.

Note also that the float64 is **structural, not a controller-gen mistake**. The destination field is
`Maximum *float64` in the upstream Kubernetes API type (`apiextensions/v1/types_jsonschema.go`).
controller-gen has nowhere else to put the number. Do not write this as a controller-gen bug.

### Nobody has filed this upstream

Searched `kubernetes-sigs/controller-tools`, `kubernetes/kubernetes`,
`kubernetes/apiextensions-apiserver`, `kube-openapi`, and `go-openapi/validate` for precision,
rounding, int64, float64, and the literal `9223372036854775807`. **No issue exists on any of them.**

The nearest historical relative is k/k #30213 (closed, 2017), where a large number in a
ThirdPartyResource came back as `1.000000009e+09`. Same float64 root cause but about **instance
data**, not **schema bounds**. Do not cite it as the same bug.

This is an opportunity worth naming in the post: the defect is undocumented upstream, so the post
can be accompanied by filing the first issue.

### The same artifact is live in the wild right now

This is the empirical answer to "does this exist in other people's specs today." Yes, and the
number is character-for-character identical.

| Project | Issue | State | What it says |
|---|---|---|---|
| openai/openai-openapi | #360, #464, #549 | all open | `minimum: -9223372036854776000 / maximum: 9223372036854776000` on the `seed` field. #464 diagnoses it exactly: something in the YAML generation pipeline treats a large integer as floating point |
| weaviate | #11735 | open | "int64 boundary value 9223372036854775807 silently truncated to 9223372036854776000" |

Caveat to respect: the same 2^63 bounds also appear inside CRD-derived JSON schemas in
`akuity/kargo` and `datreeio/CRDs-catalog`, but the source CRD in kargo has no `maximum` at all.
Those bounds are injected by a downstream CRD-to-JSON-Schema converter, not by controller-gen. Same
defect class, different producer. Do not present them as controller-gen output.

### The canonical Kubernetes warning exists, in an unexpected place

The Kubernetes API Conventions document, "Primitive types" section, states that all numbers are
converted to float64 by JavaScript, that **`int64` fields must be bounds-checked to be within
`-(2^53) < x < (2^53)`**, and that values exceeding that should be serialized as strings.

Cite this carefully. That rule governs **Go API field design and serialization**. It says nothing
literally about OpenAPI `maximum`/`minimum` keywords or about kubebuilder markers. Using it for
schema-bound precision is an extrapolation, a well-supported one, but the post should say so rather
than imply the docs already cover this case.

Negative findings worth a sentence: the CRD documentation's validation sections, the api-concepts
page, and the kubebuilder markers reference contain **no** precision warning at all. The kubebuilder
book does not even document that `Minimum`/`Maximum` take a float64; the argument-type cell renders
empty for them while neighbours like `MinItems` render `int`.

### Specification text

- **RFC 8259 section 6 (JSON)** is the strongest citation: integers in
  `[-(2^53)+1, (2^53)-1]` are "interoperable in the sense that implementations will agree exactly
  on their numeric values," and implementations should expect no more precision or range than IEEE
  754 binary64.
- **JSON Schema 2020-12 section 6.2.2** says the value of `maximum` MUST be a number, not an
  integer, and section 4.2 explicitly declines to bound precision.
- **OpenAPI 3.0.3** defines `int64` as "signed 64 bits (a.k.a long)" and says **nothing** about
  precision limits or IEEE 754. That silence is a real gap in the spec and is worth naming.

### The JavaScript parallel, verified

**Twitter: verified, safe to cite.** `id_str` existed alongside `id`, and Twitter's own API docs
give the 53-bit rationale across multiple doc eras, including the current developer docs ("In
JavaScript, integers are limited to 53 bits") and the 2012 snowflake-era page ("some programming
languages such as Javascript cannot support numbers with >53bits", "always use the field id_str
instead of id").

**Correction to a common retelling:** the 2010 "Announcing Snowflake" engineering post does **not**
mention JavaScript, 53 bits, or `id_str`. Its stated drivers were uncoordinated ID generation and
sortability. Attribute the precision rationale to the API docs, never to the snowflake announcement.

**Discord: use their wording, not the assumed reason.** Discord does serialize snowflakes as strings
in the HTTP API and states that it transforms bigints into strings when serializing to JSON, but the
reason it gives is "to prevent integer overflows in some languages." It never names JavaScript,
IEEE 754, or 53 bits, and integer overflow is arguably a different failure mode from mantissa
precision loss. Also, "always strings" is scoped to HTTP/JSON; the Gateway ETF docs say snowflakes
are transmitted as 64-bit integers or strings. If Discord appears in the post, quote their reason
and mark the parallel as the author's observation.

---

## The thesis

Arrived at by talking it through out loud, and it is sharper than the earlier framings above.
Prefer this one.

> Every step of this bug was carried out by a component behaving correctly. It crossed three
> processes, two CPU architectures, and one git commit. The place it was found and the place it was
> caused are separated by a persistence boundary. The hard part was not the distance. It was that
> **nothing along the path was broken**. The defect lives in the seam where two type systems fail to
> line up, and nobody put a check on that seam.

Supporting beats, each of which can carry a section:

**Nobody has a bug.** controller-gen faithfully printed the float64 it held. The YAML parser
faithfully read it back. The apiserver faithfully did what the Go specification permits. The marker
was semantically reasonable. Walk the chain looking for wrong code and every link passes review.
That is why you cannot bisect to it: there is no bad commit.

**The marker was never seen by a compiler.** It is a comment. The compiler discards it during
lexing. `controller-gen` is not a compilation phase; it is a separate tool that re-parses the source
specifically to recover the comments the compiler threw away. So this is not "the compiler checked
everything except this one thing." That text was never looked at by any compiler at all. What looks
like a declaration is a string.

**The bug crossed a persistence boundary.** It was born on a laptop and then frozen into a YAML file
that was committed to git. By the time it detonated, that execution had happened weeks earlier, on a
different machine, in a different process. You cannot attach a debugger to it, because half the
"execution" is sitting in version control.

**The evidence at the scene actively misleads.** The error message contains no number that appears
anywhere in the source. And the platform split (same commit, ARM green, x86 red) reads as flaky
infrastructure, which is where the investigation actually went first. The evidence is not merely
thin, it points the wrong way.

## Reader traps, worth using as targets

These are not hypothetical. They came up while explaining the bug out loud, in this order, from
someone who already understood the system. Each one is a natural, intelligent wrong turn, and every
one of them pulls attention toward **text and parsing** when the real problem is a **type**. Naming
and killing them in sequence is a ready-made spine.

| Trap | What it assumes | The correction |
|---|---|---|
| 1. "CI is flaky" | Same commit passing and failing means infrastructure | One platform was failing for a real reason; another job's cancellation made the wrong story more convincing |
| 2. "YAML is text, so it lost precision" | Serialized text is lossy | Text is the only lossless part. 19 characters hold the value perfectly |
| 3. "Two parsers read the same string differently" | codegen and apiserver disagree on one input | They never read the same string. codegen read `...807`, apiserver read `...000`. Both parses are deterministic and both are correct |
| 4. "The precision was lost when serializing" | The writer rounded it | It was already gone the moment the value entered a float64. The serializer printed its float64 exactly, and `9223372036854776000` is the shortest decimal that round-trips 2^63 |
| 5. "This is an x86 problem" | The architecture caused it | The architecture only decides visibility. The value was already wrong on every machine |

Trap 3 and trap 4 are the most valuable, because correcting them is what forces the reader to
look at the data model instead of the file format.

---

## How this maps to the house style

Read `WRITING-DNA.md` first. This section maps the material onto the established shape so the
structural work is already done.

**Warning about this file.** These notes are written with bullets, tables, and headings for
scannability. The post allows none of that: zero bullet lists, `##` only, and tables are rare. Do
not mirror this file's format. Mine it for content and rebuild in prose.

**Proposed spine**, five sections, sentence case, readable as a story:

1. `A bound that looked harmless` (the marker, and the sensible lint rule that produced it)
2. `The first suspect` (the false-suspect beat: flaky infrastructure)
3. `The number on disk` (Stage 1, rounding, identical on every machine)
4. `Where the architectures disagree` (Stage 2, narrowing, the Go spec quote)
5. `The fix` (drop the ceiling, the 2^53 rule, repro link, epigram)

**Cold open draft**, action then consequence, thesis inside the first 100 words:

> We put a ceiling on a CRD field so it could not hold nonsense. On ARM it worked. On x86 the
> apiserver began rejecting every write, on the grounds that the value was larger than negative
> nine quintillion.

**The false-suspect beat is already in the material.** Same-commit-different-platform reads as
flaky infrastructure, and one of the three CI jobs genuinely was an unrelated cancellation, which
made the wrong theory more convincing. That is the "It hadn't." moment. The buried assumption to
name afterwards: *a number written in Go source is the number the apiserver enforces.*

**The `<Callout>` writes itself.** The house pattern is a verbatim quote of an authority followed
by a flat read of it. Here the authority is the Go specification:

> `<Callout>In all non-constant conversions involving floating-point or complex values, if the
> result type cannot represent the value the conversion succeeds but the result value is
> implementation-dependent.</Callout>`

Then the read, in the manner of "It does exactly what it promises, which is less than it looks
like." Something along the lines of: the spec is not describing an edge case, it is declining to
have an opinion, and two CPUs took that as permission to disagree.

**Footnote targets**, one per constant, each linking to a real upstream file:
the Go specification section on conversions; the JSON Schema or OpenAPI definition of `maximum` as
a JSON number; IEEE 754 double precision and the 53-bit significand; the ARM `FCVTZS` and x86
`CVTTSD2SI` reference pages for their differing out-of-range behavior.

**Diagram.** A `mermaid` sequenceDiagram fits: Go marker to codegen to YAML to apiserver, then the
path forking by architecture at the narrowing step. Follow it with a `<FigCaption>` that states the
conclusion rather than describing the picture, for example: the value is already wrong before it
leaves the developer's machine; the architecture only decides whether the wrongness is visible.

**Repro link.** GitHub tree URL, not the site path, in the paragraph before the closing epigram:
`https://github.com/initor/blog-nextjs/tree/master/public/repro/ceiling-that-became-a-floor`

**Closing epigram candidates**, sharpest line last:

> The compiler knew. It just never got to see the number.

> Go refuses to make this mistake at compile time. We handed it the number at runtime instead.

---

## The narrative arc

The shape of the investigation, in the order it actually happened. This is the honest sequence,
including the wrong turn, which is worth keeping because the wrong turn is the reader's wrong turn
too.

1. **The symptom.** A new CRD field ships. Locally, `bazel test ./...` passes 22/22, every run.
   CI fails. Not intermittently: 15 of 15 runs on x86, while 3 of 3 on ARM pass.
2. **The wrong turn.** Same-commit runs disagreeing by platform reads as flaky infrastructure. One
   of the three CI jobs genuinely *was* an unrelated cancellation, which made the "infra flake"
   story more convincing. It took reading the actual failing job (not the rollup) to see that one
   platform was failing for a real reason and the others were noise.
3. **The error message**, which is absurd on its face and is the hook for the post:

   ```
   Invalid value: 1: <field> in body should be less than or equal to -9223372036854775808
   ```

   A field whose declared maximum was the *largest* int64 is rejecting the value `1` for being
   too large, against a bound that is the *smallest* int64. The ceiling became a floor.
4. **The reveal.** Two separate precision events, only one of which is architecture-dependent.

---

## The mechanism, in two stages

This two-stage framing is the core explanatory device. Keep it.

| | Stage 1: Rounding | Stage 2: Narrowing |
|---|---|---|
| Where | codegen, on the dev machine | validation, inside the apiserver |
| What | `MaxInt64` into a float64 | that float64 back into an int64 |
| Architecture-dependent? | **No.** Identical everywhere | **Yes.** Undefined by the Go spec |
| Result | YAML on disk says `9223372036854776000` | x86 gives `MinInt64`; ARM gives `MaxInt64` |

**Stage 1 is the bug. Stage 2 only decides whether anyone finds out.**

### Stage 1: the value is already wrong on disk

The Go marker is ordinary and looks harmless:

```go
// +kubebuilder:validation:Minimum=1
// +kubebuilder:validation:Maximum=9223372036854775807
SomeGeneration int64 `json:"someGeneration"`
```

In JSON Schema and OpenAPI, `maximum` is a JSON *number*, and the Go structs modelling the schema
hold it as a **float64**. float64 has a 53-bit mantissa; `MaxInt64` needs 63. So the value is
rounded **at generation time, in Go, before any YAML is written**.

The generated CRD, committed to the repo, literally contained:

```yaml
someGeneration:
  format: int64                     # the field is an integer
  maximum: 9223372036854776000      # the bound is a rounded float
```

`9223372036854776000` is exactly 2^63, which is `MaxInt64 + 1`. **The bound escaped the very range
it was meant to cap.**

> Correct a natural assumption here, because it is the one most readers will make: the loss is
> **not** because YAML is text. Text is the only lossless part of this pipeline. `9223372036854775807`
> is nineteen characters and YAML holds it perfectly. The loss is in the *data model* behind the
> text. The artifact was already wrong before it was serialized. Nothing "got corrupted during
> parsing"; the parser faithfully reproduced a bad number.

### Stage 2: where the architectures part ways

Validation must compare an `int64` field against that float64 bound, so something narrows 2^63 back
to an int64. 2^63 does not fit. The Go specification declines to define what happens:

> In all non-constant conversions involving floating-point or complex values, if the result type
> cannot represent the value the conversion succeeds but the result value is
> **implementation-dependent**.

Two architectures, two answers:

- **ARM64** (`FCVTZS`) **saturates** to `MaxInt64`. Which is, by pure accident, exactly the bound
  that was originally intended. Validation behaves correctly.
- **x86-64** (`CVTTSD2SI`) returns the "integer indefinite" value, `MinInt64`. The bound becomes
  `<= -9223372036854775808`, so every write with a value of 1 or more is rejected.

The irony worth landing: **ARM was not passing despite a bug. It was passing because a second
undefined behavior happened to undo the first.**

### The guardrail that cannot fire

The strongest single fact. Go's compiler *does* catch this, but only for constants:

```go
const c = float64(9223372036854775807)
_ = int64(c)
```

```
cannot convert c (constant 9223372036854775808 of type float64) to type int64
```

The compiler evaluates it, sees the overflow, and refuses. Note it even reports the already-rounded
value, 2^63, in its own error message.

Move the identical value through a variable, which is exactly what parsing it from a YAML file
does, and the conversion compiles clean and returns garbage at runtime. The safety net is real and
is bypassed the moment the number crosses a file boundary.

---

## The transferable rule

Do not write the takeaway as "avoid MaxInt64 in kubebuilder markers." The general form:

> **Any integer bound above 2^53 is silently approximated the moment it enters an OpenAPI schema.**
> The value the apiserver enforces is not the value you wrote.

`9007199254740991` (2^53 - 1) round-trips exactly. `MaxInt64` cannot. This is a property of JSON
Schema, not of Go or Kubernetes, so it applies to any language generating OpenAPI, and to
request/response validation as much as to CRDs.

There is a nice secondary tension: the internal coding standard that produced this said *"numeric
fields need both Minimum and Maximum, because unbounded ints reach MaxInt32 and surface as nonsense
at runtime."* That rule is good and the reasoning is sound. Applied to an int64 mirror field it
produces this. The honest resolution was to drop the ceiling and document why, not to pick a
slightly smaller wrong number. Worth a short section: **a well-intentioned lint rule can be the
proximate cause.**

---

## Runnable reproduction

House pattern is `public/repro/<slug>/` with `go.mod`, `main.go`, `README.md`, and a candid
"honest caveat" section. This repro has an unusual property: **Stage 1 reproduces on any machine in
under a second with zero dependencies.** No cluster, no CRDs, no kubebuilder.

### Part 1: the rounding (deterministic, any machine)

```go
package main

import (
	"encoding/json"
	"fmt"
	"math"
)

func main() {
	const maxInt64 = int64(math.MaxInt64)
	f := float64(maxInt64) // what an OpenAPI schema stores: a JSON number, i.e. a float64

	fmt.Printf("as written in the marker : %d\n", maxInt64)
	b, _ := json.Marshal(f)
	fmt.Printf("after the float64 trip   : %s\n", b)
	fmt.Printf("the float is exactly 2^63: %v\n", f == math.Pow(2, 63))

	got := int64(f) // non-constant conversion: implementation-dependent
	fmt.Printf("int64(2^63) here         : %d\n", got)
	fmt.Printf("  saturated to MaxInt64? : %v\n", got == math.MaxInt64)
	fmt.Printf("  indefinite MinInt64?   : %v\n", got == math.MinInt64)
}
```

Measured output on Apple Silicon (darwin/arm64), verbatim:

```
as written in the marker : 9223372036854775807
after the float64 trip   : 9223372036854776000
the float is exactly 2^63: true
int64(2^63) here         : 9223372036854775807
  saturated to MaxInt64? : true
  indefinite MinInt64?   : false
```

The first two lines are the bug and they print the same on every machine. The last three are the
architecture-dependent part.

### Part 2: the compile-time guardrail

```go
const c = float64(9223372036854775807)
_ = int64(c) // compile error, verified
```

### Part 3: what Go actually emits on amd64

Worth showing in the post, because it closes the mechanism with no hand-waving. Go's amd64 code
generation for a `float64` to `int64` conversion is a single instruction with **no range check**.
The whole function is six bytes:

```
GOOS=linux GOARCH=amd64 go build -gcflags=-S
```

```
main.conv STEXT nosplit size=6
	CVTTSD2SQ	X0, AX
	RET
	f2 48 0f 2c c0 c3
```

There is nowhere for a check to live. Intel documents `CVTTSD2SI` and its 64-bit form as returning
the "integer indefinite" value when the source does not fit, which for 64 bits is
`0x8000000000000000`, exactly `MinInt64`. That is the number in the production error message.

### The honest caveat (write this section, do not skip it)

This section got much more interesting after an attempt to shortcut it. Keep the whole story.

**The rounding half reproduces anywhere.** Part 1's first three lines print identically on every
machine, and that is the actual defect.

**The divergence needs real x86 silicon, and emulation will lie to you.** The obvious shortcut on
an Apple Silicon machine is to cross-compile and run the x86 binary locally:

```
GOOS=darwin GOARCH=amd64 go build -o maxint_amd64 maxint.go
./maxint_amd64
```

The binary really is x86-64 (`file` confirms `Mach-O 64-bit executable x86_64`), it runs under
Rosetta 2, and it prints **the ARM answer**: saturated to `MaxInt64`, not the indefinite
`MinInt64`. Verified in-session. Since Go provably emits a bare `CVTTSD2SQ` for this conversion
(Part 3), the translation layer is not reproducing the instruction's documented out-of-range
behavior.

`docker run --platform linux/amd64` was **not** tested (Docker was not running). Depending on
configuration it may use Rosetta or QEMU, so treat it as unverified until it is checked. The safe
instruction to readers is: run it on real x86 hardware, or verify your emulator reproduces it
before trusting a negative result.

This is a genuinely good beat rather than a weakness. The bug is invisible on ARM, and it stays
invisible when you emulate x86 on ARM to go looking for it. Two layers of accidental concealment.

**The x86 evidence is observational, not locally reproduced.** The `-9223372036854775808` error
string came from real CI logs on two independent x86 images, while ARM passed on the same commit,
and all three went green after the marker was removed. Strong, but it is production evidence.

**The end-to-end path was never reproduced in one script.** Marker to apiserver rejection needs a
real apiserver with the generated CRD applied. Decide whether a `kind` cluster plus a two-field toy
CRD earns its setup cost, or whether the honest framing is "here is the mechanism, here is the
production evidence."

---

## Evidence table

| Claim | Verified how |
|---|---|
| Marker `Maximum=9223372036854775807` generates `maximum: 9223372036854776000` | Read the committed generated CRD YAML in git history |
| That literal equals 2^63, i.e. `MaxInt64 + 1` | Go program, output above |
| `MaxInt64` is not exactly representable as float64 | Go program, output above |
| ARM64 narrows 2^63 to `MaxInt64` | Ran it on darwin/arm64, output above |
| Go emits a bare `CVTTSD2SQ` with no range check on amd64 | `go build -gcflags=-S`, six-byte function, quoted above |
| x86-64 narrows 2^63 to `MinInt64` | CI logs on two x86 images: error names `-9223372036854775808` |
| An x86-64 binary under Rosetta 2 gives the ARM answer, not the x86 one | Cross-compiled `GOARCH=amd64`, confirmed x86-64 via `file`, ran it, got `MaxInt64` |
| Docker `--platform linux/amd64` behavior | **Not tested.** Docker was not running |
| ARM passes, x86 fails, same commit | CI run history: ARM green, x86 red, then green on both after removing the marker |
| Constant conversion is a compile error | `go vet` and `go build`, message quoted above |
| Removing the two `maximum:` lines fixes it | The fix commit turned CI green on all three platforms |

---

## Scope and disclosure

The material above is deliberately generic and is safe to publish. It is a property of JSON Schema,
OpenAPI, Go, and CPU instruction semantics. None of it is proprietary.

**Keep out of the post.** The originating work is internal. Do not name or allude to: the employer's
internal CRD kinds or field names, the controller or feature the field belonged to, internal PR
numbers, internal ticket IDs, internal CI job or image names, internal repository paths, or the
internal coding-standards document. Where context is unavoidable, say "a Kubernetes controller I
work on" and use a neutral invented field such as `someGeneration` on a `Widget` CRD, as this file
already does.

The one internal detail worth generalizing rather than deleting is the coding rule about pairing
Minimum with Maximum. Describe it as a common, sensible lint rule, not as a specific document.

---

## Companion post, captured so it is not lost

The same session found a second bug with the same theme, **nondeterminism your local tests cannot
see**. It is a separate post, and the two would pair well as a set.

A controller built a slice by ranging over a Go map, so the emitted element order varied between
reconciles. The Kubernetes object write path skips the write when the new object deep-equals the
old one, but that comparison is **positional for slices**. So an unchanged desired state still
produced a write, and the apiserver bumped `metadata.generation`. A feature that anchored a timer
on that generation had its timer reset by unrelated traffic, so the timeout could be deferred
indefinitely.

Measured flip rate on a two-key map: **17450 / 2550 across 20000 iterations**, about 13% per
reconcile. Enough that in a busy cluster the timer effectively never accumulated.

The transferable lesson: **`DeepEqual` on a slice is an ordering assertion.** Building the slice
from a map makes every no-op reconcile a coin flip. Go randomizes map iteration deliberately, to
stop exactly this kind of accidental dependency, and the randomization here turned into a write
amplifier.

Fix was three lines of sort. Verified by disabling the sort and confirming both regression tests
fail.
