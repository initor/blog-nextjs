# Reproducing "Two Leaders, One Second"

A ~150-line controller that reproduces the dual-child outcome described in the blog post, using `controller-runtime`'s standard builder API. No CRDs, no kubebuilder scaffolding.

## Prerequisites

- Go 1.21 or later
- [kind](https://kind.sigs.k8s.io/) (or any local Kubernetes cluster)
- `kubectl`

## Setup

```bash
kind create cluster --name leader-race
go mod tidy
```

## Reproduce the bug

Open three terminals.

**Terminal A** (writer A):

```bash
WRITER_ID=A go run . --force-race
```

**Terminal B** (writer B):

```bash
WRITER_ID=B go run . --force-race
```

**Terminal C** (create the parent):

```bash
kubectl create configmap demo-parent
kubectl label cm demo-parent demo=parent
```

Both writers will log a `Reconcile START`, enter the 10s slow-downstream window simultaneously, and then call `client.Create` at the apiserver next to each other. After ~12 seconds:

```bash
kubectl get secrets -l demo-child=demo-parent
```

Expected output: **two** secrets, with different `GenerateName` suffixes.

```
NAME                       TYPE     DATA   AGE
demo-parent-child-9j2pk    Opaque   0      3s
demo-parent-child-pkx4f    Opaque   0      3s
```

On the next reconcile loop both writers will list the same two children, log the singleton-invariant violation, and stop. This is the same state production saw 29 days in a row.

## What `--force-race` does

1. **Disables leader election** so both writers reconcile concurrently. In production, leader election usually prevents this. But during the brief dual-leader window described in the blog post, the same race occurs naturally for a few hundred milliseconds.
2. **Adds a 10s sleep** before `client.Create`, modeling a slow downstream call that does not honor `ctx` cancellation. Both writers enter the slow window at the same time and exit at the same time, making the race deterministic.

## See the normal singleton behavior

Drop `--force-race` to run with leader election on. One writer is leader, the other waits as standby. Exactly one child gets created. This is what the operator looks like 99% of the time.

```bash
go run .       # Terminal A: becomes leader
go run .       # Terminal B: standby
```

## The honest caveat

Faithfully reproducing the production *timing* (an in-flight `Create` surviving the graceful drain) requires apiserver-side slowness, typically a validating webhook with `time.Sleep`. That setup adds TLS certs and ~100 lines and is omitted here.

The structural demo is sufficient because the observable outcome is identical to production: two children for one parent. The post explains the production mechanism (lease handoff during in-flight Create); this demo proves the apiserver does not validate that the writer is the lease-holder.

## Clean up

```bash
kind delete cluster --name leader-race
```
