// Minimal reproduction of the bug described in the post
// "The Maximum Became the Minimum."
//
// A CRD field was marked with the largest int64 as its Maximum. In an OpenAPI
// schema, maximum is a JSON number, held as a float64. float64 has a 53-bit
// mantissa; MaxInt64 needs 63. So the bound is rounded the moment it enters the
// float64, before any YAML is written, and the committed schema already reads
// maximum: 9223372036854776000, the shortest decimal representation that parses
// back to the stored float64 value 2^63, one past MaxInt64. The ceiling escaped
// the range it was meant to cap.
//
// Validation later narrows that float64 back to an int64 to compare it against
// the field. 2^63 does not fit, and the Go specification leaves the result of a
// non-constant out-of-range float-to-int conversion implementation-dependent.
// ARM saturates to MaxInt64 (which, by accident, is the intended bound). x86
// returns the integer indefinite value, MinInt64. The ceiling becomes a floor.
//
// This program is dependency-free and runs in under a second. Part 1 (the
// rounding) is deterministic and prints the same on every machine: that is the
// actual defect. Part 2 (the narrowing) is architecture-dependent and prints
// whatever the execution environment does. Part 3 samples the boundary to show
// how few values are affected. Exactly the largest 512 int64 values escape.
//
// Run:
//
//	go run .
package main

import (
	"encoding/json"
	"fmt"
	"math"
)

func main() {
	part1Rounding()
	fmt.Println()
	part2Narrowing()
	fmt.Println()
	part3Threshold()
}

// part1Rounding is the bug. It is deterministic on every architecture: the value
// is already wrong on disk, before serialization, because it was rounded when it
// entered the float64 that models an OpenAPI number.
func part1Rounding() {
	const maxInt64 = int64(math.MaxInt64)
	f := float64(maxInt64) // what this Go schema model stores in its float64 Maximum field

	fmt.Println("== part 1: rounding (deterministic on every machine) ==")
	fmt.Printf("as written in the marker : %d\n", maxInt64)
	b, _ := json.Marshal(f)
	fmt.Printf("after the float64 trip   : %s\n", b)
	fmt.Printf("the float is exactly 2^63: %v\n", f == math.Pow(2, 63))
}

// part2Narrowing is architecture-dependent. The Go spec declines to define the
// result of this non-constant conversion when the value does not fit, so ARM and
// x86 disagree. Whatever this machine prints is this machine's answer.
func part2Narrowing() {
	f := float64(int64(math.MaxInt64))
	got := int64(f) // non-constant conversion: implementation-dependent

	fmt.Println("== part 2: narrowing (architecture-dependent) ==")
	fmt.Printf("int64(2^63) here         : %d\n", got)
	fmt.Printf("  saturated to MaxInt64? : %v\n", got == math.MaxInt64)
	fmt.Printf("  indefinite MinInt64?   : %v\n", got == math.MinInt64)
}

// part3Threshold shows why almost nobody hits the loud failure. Divergence needs
// the rounded bound to land outside int64, which happens only in the highest 512
// values. Every integer through 2^53 round-trips exactly; above that, float64
// represents some integers exactly and approximates the rest.
func part3Threshold() {
	type row struct {
		label string
		value int64
	}
	rows := []row{
		{"2^53 - 1", (1 << 53) - 1},
		{"5e18", 5_000_000_000_000_000_000},
		{"2^62", 1 << 62},
		{"MaxInt64 - 512", math.MaxInt64 - 512},
		{"MaxInt64 - 511", math.MaxInt64 - 511},
		{"MaxInt64", math.MaxInt64},
	}

	fmt.Println("== part 3: where the escape window begins ==")
	fmt.Printf("%-16s %22s %8s %10s\n", "marker value", "rounds to", "exact?", "escapes?")
	for _, r := range rows {
		rounded := float64(r.value)
		exact := sameString(r.value, rounded)
		// A bound "escapes" int64 when the rounded float is >= 2^63, i.e. no longer
		// representable as an int64 at all.
		escapes := rounded >= math.Pow(2, 63)
		fmt.Printf("%-16s %22.0f %8v %10v\n", r.label, rounded, exact, escapes)
	}
}

// sameString reports whether the integer and its float64 image print the same
// decimal digits, i.e. the value survived the round trip losslessly.
func sameString(v int64, f float64) bool {
	return fmt.Sprintf("%d", v) == fmt.Sprintf("%.0f", f)
}
