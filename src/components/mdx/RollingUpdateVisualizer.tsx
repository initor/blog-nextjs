'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';

type PodStatus = 'old' | 'old-term' | 'new-pend' | 'new' | 'empty';

interface StepState {
  pods: PodStatus[];
  oldRunning: number;
  oldTerminating: number;
  newRunning: number;
  newPending: number;
  total: number;
  label: string;
  note: string;
}

/** Seeded PRNG (mulberry32) for deterministic randomness. */
function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Simulates a CloneSet rolling update with per-pod position tracking.
 *
 * Each pod occupies a fixed grid position and transitions through states
 * in place: old → old-term → empty → new-pend → new. Pods drain and
 * start at varying speeds (1-3 cycles to drain, 1-2 cycles to start)
 * so faster pods resolve before slower neighbors.
 *
 * A seeded PRNG keeps the simulation deterministic per set of props.
 */
function simulate(
  replicas: number,
  maxSurge: number,
  maxUnavail: number,
): StepState[] {
  const rand = mulberry32(replicas * 1000 + maxSurge * 100 + maxUnavail);
  const steps: StepState[] = [];
  const totalSlots = replicas + maxSurge;

  interface PodSlot {
    status: PodStatus;
    cycles: number;
  }

  const pods: PodSlot[] = [];
  for (let i = 0; i < replicas; i++) pods.push({ status: 'old', cycles: 0 });
  for (let i = 0; i < maxSurge; i++) pods.push({ status: 'empty', cycles: 0 });

  function countStatus(s: PodStatus): number {
    let n = 0;
    for (const p of pods) if (p.status === s) n++;
    return n;
  }

  function snap(label: string, note: string): StepState {
    const oldRunning = countStatus('old');
    const oldTerminating = countStatus('old-term');
    const newRunning = countStatus('new');
    const newPending = countStatus('new-pend');
    return {
      pods: pods.map((p) => p.status),
      oldRunning,
      oldTerminating,
      newRunning,
      newPending,
      total: oldRunning + oldTerminating + newRunning + newPending,
      label,
      note,
    };
  }

  steps.push(
    snap('Steady state', `All ${replicas} pods running current revision.`),
  );

  const minAvailable = replicas - maxUnavail;

  for (let cycle = 0; cycle < 500; cycle++) {
    // 1. Tick timers: resolve finished pods
    for (const p of pods) {
      if (p.status === 'old-term') {
        p.cycles--;
        if (p.cycles <= 0) p.status = 'empty';
      } else if (p.status === 'new-pend') {
        p.cycles--;
        if (p.cycles <= 0) p.status = 'new';
      }
    }

    // 2. Count current state
    const oldRunning = countStatus('old');
    const oldTerminating = countStatus('old-term');
    const newRunning = countStatus('new');
    const newPending = countStatus('new-pend');
    const totalPods = oldRunning + oldTerminating + newRunning + newPending;

    // 3. Done?
    if (oldRunning === 0 && oldTerminating === 0 && newPending === 0) {
      const last = steps[steps.length - 1];
      if (last.oldTerminating > 0 || last.newPending > 0) {
        steps.push(
          snap(
            'Complete',
            `All ${replicas} pods running new revision. Zero downtime.`,
          ),
        );
      }
      break;
    }

    // 4. Controller decisions
    const available = oldRunning + newRunning;
    const deleteReadyLimit = Math.max(0, available - minAvailable);
    const scaleDown = Math.min(deleteReadyLimit, oldRunning);

    const headroom = Math.max(0, replicas + maxSurge - totalPods);
    const needed = Math.max(0, replicas - newRunning - newPending);
    const scaleUp = Math.min(headroom, needed, maxSurge);

    // 5. Pick random old pods to drain
    if (scaleDown > 0) {
      const oldIdx: number[] = [];
      for (let i = 0; i < totalSlots; i++) {
        if (pods[i].status === 'old') oldIdx.push(i);
      }
      for (let i = oldIdx.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [oldIdx[i], oldIdx[j]] = [oldIdx[j], oldIdx[i]];
      }
      for (let i = 0; i < scaleDown; i++) {
        pods[oldIdx[i]].status = 'old-term';
        pods[oldIdx[i]].cycles = 1 + Math.floor(rand() * 3); // 1-3 cycles
      }
    }

    // 6. Place new pods in empty slots (prefer lower indices)
    if (scaleUp > 0) {
      const emptyIdx: number[] = [];
      for (let i = 0; i < totalSlots; i++) {
        if (pods[i].status === 'empty') emptyIdx.push(i);
      }
      for (let i = 0; i < scaleUp && i < emptyIdx.length; i++) {
        pods[emptyIdx[i]].status = 'new-pend';
        pods[emptyIdx[i]].cycles = 1 + Math.floor(rand() * 2); // 1-2 cycles
      }
    }

    // 7. Snapshot with label
    const curNew = countStatus('new');
    const curPend = countStatus('new-pend');
    const pctDone = Math.round(((curNew + curPend) / replicas) * 100);

    let label: string;
    let note: string;
    const curOld = countStatus('old');
    const curTerm = countStatus('old-term');

    if (steps.length === 1) {
      label = 'Surge + drain';
      note =
        `${scaleUp} new pods created (maxSurge). ` +
        `${scaleDown} old pods draining. ` +
        `${scaleUp + scaleDown} in flight. Total peaks at ${curOld + curTerm + curNew + curPend}.`;
    } else if (curOld === 0 && scaleDown === 0 && scaleUp === 0) {
      label = 'Draining';
      note = `${curTerm} pods still draining. ${curNew} v2 running, ${curPend} starting.`;
    } else if (needed <= scaleUp && curOld === 0) {
      label = 'Final drain';
      note = `Last ${curTerm} old pods draining. ${curNew} v2 already running.`;
    } else {
      label = `Rolling — ${pctDone}%`;
      note = `${scaleDown} draining · ${scaleUp} starting · ${curTerm + curPend} in flight · ${curNew} v2 ready`;
    }

    steps.push(snap(label, note));
  }

  // Consolidate: move surge-position pods into empty base slots
  let needsConsolidation = false;
  for (let i = 0; i < replicas; i++) {
    if (pods[i].status === 'empty') {
      for (let j = replicas; j < totalSlots; j++) {
        if (pods[j].status === 'new') {
          pods[i].status = 'new';
          pods[j].status = 'empty';
          needsConsolidation = true;
          break;
        }
      }
    }
  }
  if (needsConsolidation) {
    steps.push(
      snap('Settled', `Surge pods consolidated. ${replicas} pods in final positions.`),
    );
  }

  return steps;
}

interface Props {
  replicas?: number;
  maxSurge?: number;
  maxUnavailable?: number;
  title?: string;
}

export default function RollingUpdateVisualizer({
  replicas = 100,
  maxSurge = 5,
  maxUnavailable = 10,
  title = 'Rolling Update',
}: Props) {
  const steps = useMemo(
    () => simulate(replicas, maxSurge, maxUnavailable),
    [replicas, maxSurge, maxUnavailable],
  );

  const [currentStep, setCurrentStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const step = steps[currentStep];

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= steps.length - 1) {
            setPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 400);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, steps.length]);

  const handlePrev = useCallback(() => {
    setPlaying(false);
    setCurrentStep((s) => Math.max(0, s - 1));
  }, []);

  const handleNext = useCallback(() => {
    setPlaying(false);
    setCurrentStep((s) => Math.min(steps.length - 1, s + 1));
  }, [steps.length]);

  const togglePlay = useCallback(() => {
    if (currentStep >= steps.length - 1) {
      setCurrentStep(0);
      setPlaying(true);
    } else {
      setPlaying((p) => !p);
    }
  }, [currentStep, steps.length]);

  const handleSlider = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPlaying(false);
      setCurrentStep(Number(e.target.value));
    },
    [],
  );

  // Render up to the last non-empty position to avoid trailing gaps
  const lastActive = step.pods.reduce(
    (last, s, i) => (s !== 'empty' ? i : last),
    -1,
  );
  const visiblePods = step.pods.slice(0, lastActive + 1);

  const surgePercent = Math.round((maxSurge / replicas) * 100);
  const unavailPercent = Math.round((maxUnavailable / replicas) * 100);

  return (
    <figure className="rv not-prose" role="figure" aria-label={title}>
      <div className="rv-header">
        <span className="rv-title">{title}</span>
        <span className="rv-subtitle">
          {replicas} replicas · maxSurge: {maxSurge} ({surgePercent}%) ·
          maxUnavailable: {maxUnavailable} ({unavailPercent}%)
        </span>
      </div>

      <div className="rv-body">
        <div className="rv-grid" aria-label={`${step.total} pods`}>
          {visiblePods.map((status, i) => (
            <div
              key={i}
              className={`rv-dot${status !== 'empty' ? ` rv-dot-${status}` : ''}`}
              style={status === 'empty' ? { visibility: 'hidden' } : undefined}
            />
          ))}
        </div>

        <div className="rv-info">
          <div className="rv-step-label">{step.label}</div>
          <div className="rv-step-note">{step.note}</div>
          <div className="rv-counters">
            {step.oldRunning > 0 && (
              <span className="rv-counter">
                <span className="rv-dot rv-dot-old" /> v1: {step.oldRunning}
              </span>
            )}
            {step.oldTerminating > 0 && (
              <span className="rv-counter">
                <span className="rv-dot rv-dot-old-term" /> draining:{' '}
                {step.oldTerminating}
              </span>
            )}
            {step.newRunning > 0 && (
              <span className="rv-counter">
                <span className="rv-dot rv-dot-new" /> v2: {step.newRunning}
              </span>
            )}
            {step.newPending > 0 && (
              <span className="rv-counter">
                <span className="rv-dot rv-dot-new-pend" /> surge:{' '}
                {step.newPending}
              </span>
            )}
            <span className="rv-counter rv-counter-total">
              total: {step.total}
            </span>
          </div>
        </div>
      </div>

      <div className="rv-controls">
        <div className="rv-buttons">
          <button
            className="rv-btn"
            onClick={handlePrev}
            disabled={currentStep === 0}
            aria-label="Previous step"
          >
            ‹
          </button>
          <button
            className="rv-btn rv-btn-play"
            onClick={togglePlay}
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? '⏸' : '▶'}
          </button>
          <button
            className="rv-btn"
            onClick={handleNext}
            disabled={currentStep === steps.length - 1}
            aria-label="Next step"
          >
            ›
          </button>
        </div>
        <div className="rv-progress">
          <input
            type="range"
            min={0}
            max={steps.length - 1}
            value={currentStep}
            onChange={handleSlider}
            className="rv-slider"
            aria-label="Step scrubber"
          />
          <span className="rv-step-num">
            {currentStep + 1} / {steps.length}
          </span>
        </div>
      </div>
    </figure>
  );
}
