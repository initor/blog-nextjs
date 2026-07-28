# Reproducing "The Maximum Became the Minimum"

Two Go programs cover the bug at different layers. `main.go` is a dependency-free arithmetic demonstration. `validator/main.go` uses the pinned kube-openapi revision from the post and reproduces the validator result end to end. No cluster or CRD installation is required.

## Prerequisites

- Go 1.22 or later for `main.go`
- Go 1.26 or later to cross-build an amd64 binary without the older host-side constant fold

## Setup

```bash
cd public/repro/the-maximum-became-the-minimum
```

## Reproduce the arithmetic

**Run the dependency-free program:**

```bash
go run main.go
```

Part 1 shows the deterministic defect: MaxInt64 becomes the float64 value **2^63**, which Go's JSON encoder writes as `9223372036854776000`.

```text
== part 1: rounding (deterministic on every machine) ==
as written in the marker : 9223372036854775807
after the float64 trip   : 9223372036854776000
the float is exactly 2^63: true
```

Part 2 performs the out-of-range conversion directly. On Apple Silicon it prints the saturated ARM answer:

```text
== part 2: narrowing (architecture-dependent) ==
int64(2^63) here         : 9223372036854775807
  saturated to MaxInt64? : true
  indefinite MinInt64?   : false
```

Part 3 samples the boundary. Exactly the highest 512 int64 values round to 2^63 and leave the int64 range:

```text
== part 3: where the escape window begins ==
marker value                  rounds to   exact?   escapes?
2^53 - 1               9007199254740991     true      false
5e18                5000000000000000000     true      false
2^62                4611686018427387904     true      false
MaxInt64 - 512      9223372036854774784    false      false
MaxInt64 - 511      9223372036854775808    false       true
MaxInt64            9223372036854775808    false       true
```

## Reproduce the validator

`validator/main.go` builds the schema controller-gen emits and runs the pinned kube-openapi validator. It is a nested Go module, leaving the arithmetic demo dependency-free.

**Run on arm64:**

```bash
go -C validator run .
```

All four values are accepted.

**Cross-build for amd64 with Go 1.26 or later:**

```bash
GOOS=darwin GOARCH=amd64 \
  go -C validator build -o ../validator_amd64 .
file validator_amd64
./validator_amd64
```

The amd64 run accepts only MinInt64. The other values produce the production error string:

```text
GOARCH=amd64, schema maximum=9223372036854775808

1                     in body should be less than or equal to -9223372036854775808
0                     in body should be less than or equal to -9223372036854775808
-9223372036854775808  accepted
9223372036854775807   in body should be less than or equal to -9223372036854775808
```

This proves the narrowing occurs inside the real validator path. It is not inferred from the direct conversion in `main.go`.

## See the compile-time guardrail

Save this **outside the reproduction directory** as `constcheck.go`, then build it:

```go
package main

func main() {
    const c = float64(9223372036854775807)
    _ = int64(c)
}
```

```bash
go build constcheck.go
```

Go rejects it:

```text
# command-line-arguments
./constcheck.go:5:12: cannot convert c (constant 9223372036854775808 of type float64) to type int64
```

## Inspect the amd64 instruction

Save this as `conv.go` in the reproduction directory:

```go
package main

func conv(f float64) int64 {
    return int64(f)
}
```

Then inspect the amd64 output:

```bash
GOOS=linux GOARCH=amd64 go tool compile -S conv.go
```

The relevant lines are below. Metadata is elided, and the byte line proves the function body is six bytes:

```text
main.conv STEXT nosplit size=6 args=0x8 locals=0x0 funcid=0x0 align=0x0
    ...
    CVTTSD2SQ  X0, AX
    RET
    f2 48 0f 2c c0 c3
```

## The honest caveat

The arithmetic demo isolates the two conversions. The validator demo closes the causal chain with the exact kube-openapi revision, but it still does not start an apiserver or install a CRD. That setup would add machinery without changing the validator under test.

Cross-building exposed another version of the same defect. Through Go 1.25, the compiler constant-folded this out-of-range conversion while cross-compiling. The compiler itself ran on the arm64 host, so it baked `MaxInt64` into the amd64 binary and emitted no conversion instruction. Running that binary under Rosetta printed the ARM answer because there was no x86 conversion left to execute.

Go 1.26 added a range guard to the fold. With Go 1.26.5, a real `CVTTSD2SQ` remains in the amd64 binary, and Rosetta prints `MinInt64`, the documented x86 answer. The relevant distinction is not whether emulation is trustworthy. It is whether the target binary still contains the conversion.

Docker with a `linux/amd64` platform was not tested.

## Clean up

```bash
rm -f validator_amd64 conv.go conv.o
```

The programs create no other files or processes.
