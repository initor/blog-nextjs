// Minimal reproduction of the operator bug described in the post
// "Two Leaders, One Second."
//
// In production, two operator pods briefly contend for the same leader lease
// during a rolling restart. A worker still inside Reconcile when the lease
// handoff fires can land a client.Create at the apiserver next to the new
// leader's own Create. With GenerateName, the apiserver allocates two
// different suffixes. The singleton invariant breaks.
//
// This demo isolates the load-bearing fact (the apiserver does not validate
// that the writer is the lease-holder) by bypassing leader election. Both
// processes reconcile the same parent concurrently. Both call client.Create
// with the same GenerateName base. The apiserver accepts both. Two children
// are persisted, just like in production.
//
// Run (with kind + kubectl on PATH, Go 1.21+):
//
//	kind create cluster --name leader-race
//	go mod tidy
//
//	# Terminal A:
//	WRITER_ID=A go run . --force-race
//
//	# Terminal B:
//	WRITER_ID=B go run . --force-race
//
//	# Terminal C:
//	kubectl create configmap demo-parent
//	kubectl label cm demo-parent demo=parent
//
//	# After ~12 seconds:
//	kubectl get secrets -l demo-child=demo-parent
//	# Expected: TWO secrets with different GenerateName suffixes.
//
//	# Clean up:
//	kind delete cluster --name leader-race
//
// What --force-race does:
//
//  1. Disables leader election so both writers reconcile concurrently.
//     In production, leader election usually prevents this. But during the
//     brief dual-leader window (a graceful shutdown abandoning a worker
//     mid-reconcile, see the post for the mechanism), the same race
//     manifests for a few hundred milliseconds.
//
//  2. Adds a 10s sleep before client.Create, so both writers enter the
//     create at the same time. This makes the race deterministic.
//
// Faithfully reproducing the production timing (in-flight Create surviving
// the drain) requires apiserver-side slowness, typically a validating
// webhook. That setup is omitted here for brevity. The structural demo is
// sufficient because the observable outcome is identical: two children for
// one parent.
package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	utilruntime "k8s.io/apimachinery/pkg/util/runtime"
	clientgoscheme "k8s.io/client-go/kubernetes/scheme"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/builder"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/manager"
	"sigs.k8s.io/controller-runtime/pkg/predicate"
	"sigs.k8s.io/controller-runtime/pkg/reconcile"
)

var scheme = runtime.NewScheme()

func init() {
	utilruntime.Must(clientgoscheme.AddToScheme(scheme))
}

type reconciler struct {
	client.Client
	writerID  string
	forceRace bool
}

func (r *reconciler) Reconcile(ctx context.Context, req reconcile.Request) (reconcile.Result, error) {
	tag := "[" + r.writerID + "] "
	log.Printf("%sReconcile START parent=%s", tag, req.NamespacedName)

	// List existing children for this parent.
	var children corev1.SecretList
	if err := r.List(ctx, &children,
		client.InNamespace(req.Namespace),
		client.MatchingLabels{"demo-child": req.Name}); err != nil {
		return reconcile.Result{}, err
	}
	if len(children.Items) >= 1 {
		log.Printf("%sfound %d existing children, skipping create", tag, len(children.Items))
		if len(children.Items) > 1 {
			log.Printf("%s!! singleton invariant violated: %d children for one parent !!",
				tag, len(children.Items))
		}
		return reconcile.Result{}, nil
	}

	// Fetch the parent so we can owner-ref the child.
	var parent corev1.ConfigMap
	if err := r.Get(ctx, req.NamespacedName, &parent); err != nil {
		return reconcile.Result{}, client.IgnoreNotFound(err)
	}

	// Optional slow work, modeling a downstream call that ignores ctx cancellation
	// (a Kafka publish, an S3 upload, a slow gRPC). With force-race, both writers
	// enter this at the same time and exit at the same time, so both Creates land
	// next to each other.
	if r.forceRace {
		log.Printf("%sslow downstream call starting (10s)...", tag)
		time.Sleep(10 * time.Second)
		log.Printf("%sslow downstream call done", tag)
	}

	// Create the child with GenerateName. The apiserver allocates a random
	// suffix per Create call, so two concurrent Creates produce two children.
	child := &corev1.Secret{
		ObjectMeta: metav1.ObjectMeta{
			GenerateName: req.Name + "-child-",
			Namespace:    req.Namespace,
			Labels: map[string]string{
				"demo-child": req.Name,
				"created-by": r.writerID,
			},
			OwnerReferences: []metav1.OwnerReference{{
				APIVersion: "v1",
				Kind:       "ConfigMap",
				Name:       parent.Name,
				UID:        parent.UID,
				Controller: ptr(true),
			}},
		},
	}
	if err := r.Create(ctx, child); err != nil {
		log.Printf("%sCreate FAILED: %v", tag, err)
		return reconcile.Result{}, err
	}
	log.Printf("%sCreate SUCCESS child=%s", tag, child.Name)
	return reconcile.Result{}, nil
}

func ptr[T any](v T) *T { return &v }

func main() {
	writerID := os.Getenv("WRITER_ID")
	if writerID == "" {
		writerID = fmt.Sprintf("writer-%d", os.Getpid())
	}
	var forceRace bool
	flag.BoolVar(&forceRace, "force-race", false,
		"disable leader election and slow the Create so both writers race")
	flag.Parse()

	cfg, err := ctrl.GetConfig()
	if err != nil {
		log.Fatalf("get kubeconfig: %v", err)
	}

	mgr, err := ctrl.NewManager(cfg, manager.Options{
		Scheme:                        scheme,
		LeaderElection:                !forceRace,
		LeaderElectionID:              "leader-race-demo",
		LeaderElectionNamespace:       "default",
		LeaderElectionReleaseOnCancel: true,
	})
	if err != nil {
		log.Fatalf("new manager: %v", err)
	}

	// Reconcile only ConfigMaps labeled demo=parent.
	pred := predicate.NewPredicateFuncs(func(obj client.Object) bool {
		return obj.GetLabels()["demo"] == "parent"
	})

	if err := builder.ControllerManagedBy(mgr).
		Named("demo").
		For(&corev1.ConfigMap{}, builder.WithPredicates(pred)).
		Owns(&corev1.Secret{}).
		Complete(&reconciler{
			Client:    mgr.GetClient(),
			writerID:  writerID,
			forceRace: forceRace,
		}); err != nil {
		log.Fatalf("build controller: %v", err)
	}

	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()

	log.Printf("[%s] starting manager (leader-election=%v force-race=%v)",
		writerID, !forceRace, forceRace)
	if err := mgr.Start(ctx); err != nil {
		log.Fatalf("manager.Start: %v", err)
	}
	log.Printf("[%s] manager exited", writerID)
}
