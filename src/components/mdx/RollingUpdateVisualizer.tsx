'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';

interface StepState {
  oldRunning: number;
  oldTerminating: number;
  newRunning: number;
  newPending: number;
  total: number;
  label: string;
  note: string;
}

/**
 * Simulates a CloneSet rolling update.
 *
 * Key formula from CloneSet's calculateDiffsWithExpectation:
 *   deleteReadyLimit = maxUnavailable + (totalPods - replicas) - totalUnavailable
 *
 * After simplification (pending pods cancel out):
 *   deleteReadyLimit = (oldRunning + newRunning) - (replicas - maxUnavailable)
 *                    = available - minAvailable
 *
 * This means surge surplus flows into the drain budget. With maxSurge=5 and
 * maxUnavailable=10, the controller keeps 15 pods in flight per cycle — not just 10.
 */
function simulate(
  replicas: number,
  maxSurge: number,
  maxUnavail: number,
): StepState[] {
  const steps: StepState[] = [];
  let oldR = replicas;
  let newR = 0;
  const minAvailable = replicas - maxUnavail;

  steps.push({
    oldRunning: replicas,
    oldTerminating: 0,
    newRunning: 0,
    newPending: 0,
    total: replicas,
    label: 'Steady state',
    note: `All ${replicas} pods running current revision.`,
  });

  while (oldR > 0) {
    // Scale up: fill surge headroom
    const total = oldR + newR;
    const headroom = Math.max(0, replicas + maxSurge - total);
    const needed = Math.max(0, replicas - newR);
    const scaleUp = Math.min(headroom, needed, oldR, maxSurge);

    // Scale down: CloneSet formula — available minus minAvailable
    // NOT capped at maxUnavailable; surge surplus expands the drain budget
    const available = oldR + newR;
    const deleteReadyLimit = Math.max(0, available - minAvailable);
    const scaleDown = Math.min(deleteReadyLimit, oldR);

    const displayOld = oldR - scaleDown;
    const inFlight = scaleUp + scaleDown;
    const pctDone = Math.round(((newR + scaleUp) / replicas) * 100);

    let label: string;
    let note: string;
    if (steps.length === 1) {
      label = 'Surge + drain';
      note =
        `${scaleUp} new pods created (maxSurge). ` +
        `${scaleDown} old pods draining. ` +
        `${inFlight} in flight. Total peaks at ${displayOld + scaleDown + newR + scaleUp}.`;
    } else if (needed - scaleUp <= 0 && displayOld === 0) {
      label = 'Final drain';
      note = `Last ${scaleDown} old pods draining. ${newR} v2 already running.`;
    } else {
      label = `Rolling — ${pctDone}%`;
      note = `${scaleDown} draining · ${scaleUp} starting · ${inFlight} in flight · ${newR} v2 ready`;
    }

    steps.push({
      oldRunning: displayOld,
      oldTerminating: scaleDown,
      newRunning: newR,
      newPending: scaleUp,
      total: displayOld + scaleDown + newR + scaleUp,
      label,
      note,
    });

    // Resolve for next cycle: pending → running, terminating → gone
    oldR -= scaleDown;
    newR += scaleUp;
  }

  // Final clean state (no in-flight pods)
  const last = steps[steps.length - 1];
  if (last.oldTerminating > 0 || last.newPending > 0) {
    steps.push({
      oldRunning: 0,
      oldTerminating: 0,
      newRunning: replicas,
      newPending: 0,
      total: replicas,
      label: 'Complete',
      note: `All ${replicas} pods running new revision. Zero downtime.`,
    });
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

  // Build dot array grouped by state
  const dots: ('old' | 'old-term' | 'new' | 'new-pend')[] = [];
  for (let i = 0; i < step.oldRunning; i++) dots.push('old');
  for (let i = 0; i < step.oldTerminating; i++) dots.push('old-term');
  for (let i = 0; i < step.newRunning; i++) dots.push('new');
  for (let i = 0; i < step.newPending; i++) dots.push('new-pend');

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
        <div className="rv-grid" aria-label={`${dots.length} pods`}>
          {dots.map((status, i) => (
            <div key={i} className={`rv-dot rv-dot-${status}`} />
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
