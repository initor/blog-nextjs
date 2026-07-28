// Verifies the post's causal chain end to end, against the exact kube-openapi
// revision cited in footnote 9.
//
// Unlike the arithmetic reproduction, this one runs the real validator. It
// builds the schema controller-gen emits for
//
//	// +kubebuilder:validation:Maximum=9223372036854775807
//	SomeField int64 `json:"someField"`
//
// which is type: integer, format: int64, maximum: 2^63, and then validates the
// value 1 against it.
//
// On arm64 every value is accepted. On amd64 the value 1 is rejected with
//
//	someField in body should be less than or equal to -9223372036854775808
//
// which is the production error string, character for character. That message
// can only be produced by errors.ExceedsMaximumInt, which is reached only
// through MaximumInt(path, in, value, int64(max), exclusive). So the narrowing
// at int64(max) is genuinely on the path, and the architecture decides the
// outcome.
//
// This directory is a nested module because the main arithmetic demo is
// intentionally dependency-free.
//
// Run:
//
//	go -C validator run .
//	GOOS=darwin GOARCH=amd64 go -C validator build -o ../validator_amd64 .
//	./validator_amd64
//
// Requires Go 1.26 or later to observe the amd64 behavior by cross-compiling:
// through Go 1.25 the compiler constant-folds the conversion on the host and
// bakes the arm64 answer into the amd64 binary.
package main

import (
	"fmt"
	"math"
	"runtime"

	"k8s.io/kube-openapi/pkg/validation/spec"
	"k8s.io/kube-openapi/pkg/validation/strfmt"
	"k8s.io/kube-openapi/pkg/validation/validate"
)

func main() {
	max := math.Pow(2, 63) // what the schema stores for Maximum=MaxInt64

	schema := &spec.Schema{SchemaProps: spec.SchemaProps{
		Type:    spec.StringOrArray{"integer"},
		Format:  "int64",
		Maximum: &max,
	}}

	v := validate.NewSchemaValidator(schema, nil, "", strfmt.Default)

	fmt.Printf("GOARCH=%s, schema maximum=%.0f\n\n", runtime.GOARCH, max)
	for _, in := range []int64{1, 0, math.MinInt64, math.MaxInt64} {
		res := v.Validate(in)
		msg := "accepted"
		if len(res.Errors) > 0 {
			msg = res.Errors[0].Error()
		}
		fmt.Printf("%-21d %s\n", in, msg)
	}
}
