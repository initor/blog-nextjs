'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

/* ── Data types ──────────────────────────────────────────── */

type BandFate = 'pass' | 'summarize' | 'prune';
type BandColor = 'blue' | 'green' | 'purple';

interface TaskData {
  label: string;
  duration: number;
}

interface ContextBand {
  label: string;
  size: number;
  fate: BandFate;
  color: BandColor;
}

interface SessionData {
  name: string;
  agent: string;
  tasks: TaskData[];
  context: ContextBand[];
}

/* ── Default data: 3 sessions with tasks + context bands ── */

const DEFAULT_SESSIONS: SessionData[] = [
  {
    name: 'Session 1',
    agent: 'Plan',
    tasks: [
      { label: 'Read goals', duration: 2 },
      { label: 'Create roadmap', duration: 3 },
      { label: 'Define phases', duration: 2 },
    ],
    context: [
      { label: 'Project goals', size: 3, fate: 'pass', color: 'blue' },
      { label: 'Research notes', size: 2, fate: 'summarize', color: 'purple' },
      { label: 'Prior context', size: 2, fate: 'summarize', color: 'green' },
      { label: 'Exploration logs', size: 3, fate: 'prune', color: 'blue' },
      { label: 'Verbose output', size: 2, fate: 'prune', color: 'green' },
    ],
  },
  {
    name: 'Session 2',
    agent: 'Execute',
    tasks: [
      { label: 'Implement feature', duration: 3 },
      { label: 'Write tests', duration: 3 },
      { label: 'Commit', duration: 1 },
    ],
    context: [
      { label: 'Project goals', size: 3, fate: 'pass', color: 'blue' },
      { label: 'Research summary', size: 1, fate: 'pass', color: 'purple' },
      { label: 'Prior summary', size: 1, fate: 'summarize', color: 'green' },
      { label: 'Phase plan', size: 2, fate: 'pass', color: 'purple' },
      { label: 'Build logs', size: 2, fate: 'prune', color: 'blue' },
    ],
  },
  {
    name: 'Session 3',
    agent: 'Verify',
    tasks: [
      { label: 'Check completion', duration: 3 },
      { label: 'Summarize context', duration: 2 },
    ],
    context: [
      { label: 'Project goals', size: 3, fate: 'pass', color: 'blue' },
      { label: 'Research summary', size: 1, fate: 'pass', color: 'purple' },
      { label: 'Prior digest', size: 1, fate: 'pass', color: 'green' },
      { label: 'Phase plan', size: 2, fate: 'pass', color: 'purple' },
      { label: 'Test results', size: 2, fate: 'pass', color: 'green' },
      { label: 'Verification', size: 2, fate: 'pass', color: 'blue' },
    ],
  },
];

/* ── Prop deserialization ────────────────────────────────── */

function parseSessions(sessions: string | SessionData[]): SessionData[] {
  if (typeof sessions === 'string') {
    try {
      return JSON.parse(sessions);
    } catch {
      return [];
    }
  }
  return Array.isArray(sessions) ? sessions : [];
}

/* ── Color helpers ───────────────────────────────────────── */

const BAND_FILL: Record<BandColor, string> = {
  blue: 'var(--mermaid-primary-fill)',
  green: 'var(--mermaid-success-fill)',
  purple: 'var(--mermaid-secondary-fill)',
};

const BAND_STROKE: Record<BandColor, string> = {
  blue: 'var(--mermaid-primary)',
  green: 'var(--mermaid-success)',
  purple: 'var(--mermaid-secondary)',
};

const TASK_COLOR: Record<number, { bg: string; border: string; text: string }> = {
  0: {
    bg: 'var(--mermaid-primary-fill)',
    border: 'var(--mermaid-primary)',
    text: 'var(--mermaid-primary)',
  },
  1: {
    bg: 'var(--mermaid-success-fill)',
    border: 'var(--mermaid-success)',
    text: 'var(--mermaid-success)',
  },
  2: {
    bg: 'var(--mermaid-secondary-fill)',
    border: 'var(--mermaid-secondary)',
    text: 'var(--mermaid-secondary)',
  },
};

/* ── SVG Layout constants ────────────────────────────────── */

const VB_W = 900;
const VB_H = 480;

/** Sessions are wide enough for readable labels; flow gaps between them show context paths. */
const SESSION_W = 160;
const FLOW_GAP = 130;
const SESSION_RX = 6;

const CONTENT_W = SESSION_W * 3 + FLOW_GAP * 2;
const X_OFFSET = (VB_W - CONTENT_W) / 2;

/** Orchestrator bar at the top. */
const ORCH_Y = 14;
const ORCH_H = 18;

/** Session column geometry below orchestrator. */
const SESSION_Y = 60;
const SESSION_H = VB_H - SESSION_Y - 20;

/** Tasks take the top portion of each session column. */
const TASK_AREA_H = 110;
const TASK_PAD = 6;

/** Context bands take the remaining height below tasks. */
const BAND_TOP = SESSION_Y + TASK_AREA_H + 4;
const BAND_AREA_H = SESSION_H - TASK_AREA_H - 8;
const BAND_PAD = 4;

/* ── Geometry helpers ────────────────────────────────────── */

interface BandRect {
  x: number;
  y: number;
  w: number;
  h: number;
  band: ContextBand;
}

function layoutBands(sessionIdx: number, bands: ContextBand[]): BandRect[] {
  const sx = X_OFFSET + sessionIdx * (SESSION_W + FLOW_GAP);
  const totalSize = bands.reduce((s, b) => s + b.size, 0);
  const usableH = BAND_AREA_H - BAND_PAD * 2;
  const rects: BandRect[] = [];
  let cy = BAND_TOP + BAND_PAD;

  for (const band of bands) {
    const h = (band.size / totalSize) * usableH;
    rects.push({ x: sx, y: cy, w: SESSION_W, h, band });
    cy += h;
  }
  return rects;
}

/**
 * Build a cubic bezier path between a source band (right edge) and a
 * destination band (left edge). Smooth S-curve through the gap.
 */
function flowPath(src: BandRect, dst: BandRect): string {
  const x1 = src.x + src.w;
  const y1s = src.y;
  const y1e = src.y + src.h;

  const x2 = dst.x;
  const y2s = dst.y;
  const y2e = dst.y + dst.h;

  const px = x1 + FLOW_GAP / 2;
  const fate = src.band.fate;

  if (fate === 'pass') {
    const cx = (x1 + x2) / 2;
    return [
      `M ${x1} ${y1s}`,
      `C ${cx} ${y1s}, ${cx} ${y2s}, ${x2} ${y2s}`,
      `L ${x2} ${y2e}`,
      `C ${cx} ${y2e}, ${cx} ${y1e}, ${x1} ${y1e}`,
      'Z',
    ].join(' ');
  }

  if (fate === 'summarize') {
    const srcMid = (y1s + y1e) / 2;
    const pinchHalf = (src.h * 0.4) / 2;
    const pinchTop = srcMid - pinchHalf;
    const pinchBot = srcMid + pinchHalf;
    const cxL = x1 + FLOW_GAP * 0.3;
    const cxR = x2 - FLOW_GAP * 0.3;

    return [
      `M ${x1} ${y1s}`,
      `C ${cxL} ${y1s}, ${px - 10} ${pinchTop}, ${px} ${pinchTop}`,
      `C ${px + 10} ${pinchTop}, ${cxR} ${y2s}, ${x2} ${y2s}`,
      `L ${x2} ${y2e}`,
      `C ${cxR} ${y2e}, ${px + 10} ${pinchBot}, ${px} ${pinchBot}`,
      `C ${px - 10} ${pinchBot}, ${cxL} ${y1e}, ${x1} ${y1e}`,
      'Z',
    ].join(' ');
  }

  // 'prune': band tapers to nothing at the midpoint.
  const srcMid = (y1s + y1e) / 2;
  const cx = x1 + FLOW_GAP * 0.4;
  return [
    `M ${x1} ${y1s}`,
    `C ${cx} ${y1s}, ${px - 5} ${srcMid}, ${px} ${srcMid}`,
    `C ${px - 5} ${srcMid}, ${cx} ${y1e}, ${x1} ${y1e}`,
    'Z',
  ].join(' ');
}

/* ── Flow connections ────────────────────────────────────── */

interface FlowConnection {
  srcRect: BandRect;
  dstRect: BandRect;
  srcSessionIdx: number;
  fate: BandFate;
  color: BandColor;
  path: string;
}

function buildConnections(allLayouts: BandRect[][]): FlowConnection[] {
  const connections: FlowConnection[] = [];

  for (let sIdx = 0; sIdx < allLayouts.length - 1; sIdx++) {
    const srcBands = allLayouts[sIdx];
    const dstBands = allLayouts[sIdx + 1];

    for (const srcRect of srcBands) {
      if (srcRect.band.fate === 'prune') {
        connections.push({
          srcRect,
          dstRect: srcRect,
          srcSessionIdx: sIdx,
          fate: 'prune',
          color: srcRect.band.color,
          path: flowPath(srcRect, srcRect),
        });
        continue;
      }

      const dstRect = dstBands.find((d) => {
        const sl = srcRect.band.label.toLowerCase();
        const dl = d.band.label.toLowerCase();
        return (
          dl === sl ||
          dl.startsWith(sl.split(' ')[0]) ||
          sl.startsWith(dl.split(' ')[0])
        );
      });

      if (dstRect) {
        connections.push({
          srcRect,
          dstRect,
          srcSessionIdx: sIdx,
          fate: srcRect.band.fate,
          color: srcRect.band.color,
          path: flowPath(srcRect, dstRect),
        });
      }
    }
  }
  return connections;
}

/* ── Animation phases ────────────────────────────────────── */

/**
 * Timeline (progress 0-1):
 * 0.00-0.15  Session 1 appears (tasks + bands)
 * 0.15-0.30  Flows from S1 draw
 * 0.30-0.40  Session 2 appears
 * 0.40-0.55  Flows from S2 draw
 * 0.55-0.70  Session 3 appears
 * 0.70-0.85  Orchestrator bar fills
 * 0.85-1.00  Final settle
 */

function sessionOpacity(sessionIdx: number, progress: number): number {
  if (sessionIdx === 0) return progress < 0.15 ? progress / 0.15 : 1;
  if (sessionIdx === 1) return progress < 0.3 ? 0 : progress < 0.4 ? (progress - 0.3) / 0.1 : 1;
  return progress < 0.55 ? 0 : progress < 0.7 ? (progress - 0.55) / 0.15 : 1;
}

function flowOpacity(srcSessionIdx: number, fate: BandFate, progress: number): number {
  if (srcSessionIdx === 0) {
    if (progress < 0.15) return 0;
    if (fate === 'prune') {
      if (progress < 0.25) return (progress - 0.15) / 0.1;
      return Math.max(0, 1 - (progress - 0.25) / 0.1);
    }
    if (progress < 0.3) return (progress - 0.15) / 0.15;
    return 1;
  }
  if (progress < 0.4) return 0;
  if (fate === 'prune') {
    if (progress < 0.5) return (progress - 0.4) / 0.1;
    return Math.max(0, 1 - (progress - 0.5) / 0.1);
  }
  if (progress < 0.55) return (progress - 0.4) / 0.15;
  return 1;
}

/** Task progress: fraction filled for a given task at current animation progress. */
function taskFill(sessionIdx: number, taskIdx: number, totalTasks: number, progress: number): number {
  // Each session's tasks animate during the session's appearance window.
  const sessionStart = sessionIdx === 0 ? 0 : sessionIdx === 1 ? 0.3 : 0.55;
  const sessionEnd = sessionIdx === 0 ? 0.15 : sessionIdx === 1 ? 0.4 : 0.7;
  const duration = sessionEnd - sessionStart;

  const taskStart = sessionStart + (taskIdx / totalTasks) * duration;
  const taskEnd = sessionStart + ((taskIdx + 1) / totalTasks) * duration;

  if (progress < taskStart) return 0;
  if (progress >= taskEnd) return 100;
  return ((progress - taskStart) / (taskEnd - taskStart)) * 100;
}

/** Orchestrator bar fill (dispatch/wait/collect). */
function orchestratorProgress(progress: number): number {
  return Math.min(progress / 0.85, 1);
}

function orchestratorPhase(progress: number): 'dispatch' | 'wait' | 'collect' {
  const op = orchestratorProgress(progress);
  if (op < 0.1) return 'dispatch';
  if (op < 0.9) return 'wait';
  return 'collect';
}

/* ── Component ───────────────────────────────────────────── */

interface Props {
  sessions?: string;
  title?: string;
}

export default function AgentSessionFlow({
  sessions,
  title = 'Agent Session Flow',
}: Props) {
  const data = useMemo(
    () => (sessions ? parseSessions(sessions) : DEFAULT_SESSIONS),
    [sessions],
  );

  const allLayouts = useMemo(() => data.map((s, i) => layoutBands(i, s.context)), [data]);
  const connections = useMemo(() => buildConnections(allLayouts), [allLayouts]);

  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);

  const containerRef = useRef<HTMLElement>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const DURATION_MS = 3000;

  /* IntersectionObserver: auto-play on scroll into viewport (single-fire). */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasPlayed) {
          setPlaying(true);
          setHasPlayed(true);
          observerRef.current?.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observerRef.current.observe(el);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [hasPlayed]);

  /* requestAnimationFrame animation loop. */
  useEffect(() => {
    if (!playing) return;

    startRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const p = Math.min(elapsed / DURATION_MS, 1);
      setProgress(p);

      if (p >= 1) {
        setPlaying(false);
        setCompleted(true);
        rafRef.current = null;
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [playing]);

  const handleReplay = useCallback(() => {
    setProgress(0);
    setCompleted(false);
    setPlaying(true);
  }, []);

  /* ── Derived values ─────────────────────────────────── */

  const orchProgress = orchestratorProgress(progress);
  const orchPhase = orchestratorPhase(progress);

  /* ── Render ─────────────────────────────────────────── */

  return (
    <figure
      className="af not-prose"
      role="figure"
      aria-label={title}
      ref={containerRef}
    >
      <div className="af-header">
        <span className="af-title">{title}</span>
      </div>

      <div className="af-body">
        <svg
          className="af-svg"
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* ── Orchestrator bar ─────────────────────────── */}
          <rect
            className="af-orch-bg"
            x={X_OFFSET}
            y={ORCH_Y}
            width={CONTENT_W}
            height={ORCH_H}
            rx={4}
            ry={4}
          />
          <rect
            className="af-orch-fill"
            x={X_OFFSET}
            y={ORCH_Y}
            width={CONTENT_W * orchProgress}
            height={ORCH_H}
            rx={4}
            ry={4}
          />
          {/* Orchestrator phase labels */}
          {(['dispatch', 'wait', 'collect'] as const).map((phase, i) => {
            const segW = CONTENT_W / 3;
            const cx = X_OFFSET + segW * i + segW / 2;
            const isActive = orchPhase === phase;
            const isDone =
              (phase === 'dispatch' && orchProgress >= 0.1) ||
              (phase === 'wait' && orchProgress >= 0.9) ||
              (phase === 'collect' && orchProgress >= 1);

            return (
              <text
                key={phase}
                x={cx}
                y={ORCH_Y + ORCH_H / 2 + 3.5}
                textAnchor="middle"
                className={`af-orch-label${isActive ? ' af-orch-label-active' : ''}${isDone ? ' af-orch-label-done' : ''}`}
              >
                {phase}
              </text>
            );
          })}

          {/* ── Session name labels ─────────────────────── */}
          {data.map((session, sIdx) => {
            const sx = X_OFFSET + sIdx * (SESSION_W + FLOW_GAP);
            const opacity = sessionOpacity(sIdx, progress);
            return (
              <text
                key={`label-${sIdx}`}
                className="af-session-label"
                x={sx + SESSION_W / 2}
                y={SESSION_Y - 8}
                textAnchor="middle"
                opacity={opacity}
              >
                {session.name}
              </text>
            );
          })}

          {/* ── Flow connections (behind session columns) ── */}
          {connections.map((conn, ci) => {
            const opacity = flowOpacity(conn.srcSessionIdx, conn.fate, progress);
            const isPruned = conn.fate === 'prune';

            return (
              <path
                key={`flow-${ci}`}
                d={conn.path}
                fill={BAND_FILL[conn.color]}
                stroke={BAND_STROKE[conn.color]}
                strokeWidth={0.75}
                opacity={opacity * 0.45}
                className={
                  isPruned
                    ? 'af-flow af-flow-pruned'
                    : conn.fate === 'summarize'
                      ? 'af-flow af-flow-summarized'
                      : 'af-flow'
                }
                style={
                  isPruned ? { strokeDasharray: '4 3' } : undefined
                }
              />
            );
          })}

          {/* ── Session columns ──────────────────────────── */}
          {data.map((session, sIdx) => {
            const sx = X_OFFSET + sIdx * (SESSION_W + FLOW_GAP);
            const bands = allLayouts[sIdx];
            const opacity = sessionOpacity(sIdx, progress);
            const totalTasks = session.tasks.length;
            const maxDuration = Math.max(...session.tasks.map((t) => t.duration));

            return (
              <g key={`session-${sIdx}`} opacity={opacity}>
                {/* Session column background */}
                <rect
                  className="af-session-bg"
                  x={sx}
                  y={SESSION_Y}
                  width={SESSION_W}
                  height={SESSION_H}
                  rx={SESSION_RX}
                  ry={SESSION_RX}
                />

                {/* Agent name (small, inside top of column) */}
                <text
                  className="af-agent-label"
                  x={sx + SESSION_W / 2}
                  y={SESSION_Y + 14}
                  textAnchor="middle"
                >
                  {session.agent}
                </text>

                {/* ── Task bars ───────────────────────── */}
                {session.tasks.map((task, tIdx) => {
                  const taskH = 20;
                  const taskGap = 5;
                  const ty = SESSION_Y + 22 + tIdx * (taskH + taskGap) + TASK_PAD;
                  const barW = SESSION_W - TASK_PAD * 2 - 4;
                  const fill = taskFill(sIdx, tIdx, totalTasks, progress);
                  const colors = TASK_COLOR[sIdx % 3];

                  return (
                    <g key={`task-${sIdx}-${tIdx}`}>
                      {/* Task background */}
                      <rect
                        x={sx + TASK_PAD + 2}
                        y={ty}
                        width={barW}
                        height={taskH}
                        rx={3}
                        ry={3}
                        fill="rgba(0,0,0,0.03)"
                        stroke={colors.border}
                        strokeWidth={0.75}
                        strokeOpacity={0.4}
                      />
                      {/* Task fill */}
                      <rect
                        x={sx + TASK_PAD + 2}
                        y={ty}
                        width={barW * (fill / 100)}
                        height={taskH}
                        rx={3}
                        ry={3}
                        fill={colors.bg}
                        opacity={0.7}
                      />
                      {/* Task label */}
                      <text
                        className="af-task-label"
                        x={sx + TASK_PAD + 7}
                        y={ty + taskH / 2 + 4}
                        fill={colors.text}
                      >
                        {task.label}
                      </text>
                    </g>
                  );
                })}

                {/* Divider between tasks and context bands */}
                <line
                  x1={sx + 8}
                  y1={BAND_TOP - 2}
                  x2={sx + SESSION_W - 8}
                  y2={BAND_TOP - 2}
                  stroke="rgba(0,0,0,0.06)"
                  strokeWidth={0.5}
                />

                {/* ── Context bands ───────────────────── */}
                <clipPath id={`clip-band-${sIdx}`}>
                  <rect
                    x={sx}
                    y={BAND_TOP}
                    width={SESSION_W}
                    height={BAND_AREA_H}
                    rx={SESSION_RX}
                    ry={SESSION_RX}
                  />
                </clipPath>
                <g clipPath={`url(#clip-band-${sIdx})`}>
                  {bands.map((br, bIdx) => (
                    <g key={`band-${sIdx}-${bIdx}`}>
                      <rect
                        x={br.x + 3}
                        y={br.y}
                        width={br.w - 6}
                        height={Math.max(br.h - 1, 1)}
                        rx={2}
                        ry={2}
                        fill={BAND_FILL[br.band.color]}
                        stroke={BAND_STROKE[br.band.color]}
                        strokeWidth={0.5}
                        strokeOpacity={0.5}
                        fillOpacity={0.5}
                      />
                      {br.h > 14 && (
                        <text
                          className="af-band-label"
                          x={br.x + 8}
                          y={br.y + br.h / 2 + 3}
                        >
                          {br.band.label}
                        </text>
                      )}
                    </g>
                  ))}
                </g>
              </g>
            );
          })}

          {/* ── Flow fate legend (bottom right) ────────── */}
          <g opacity={progress > 0.8 ? (progress - 0.8) / 0.2 : 0}>
            <text
              className="af-legend-text"
              x={VB_W - 28}
              y={VB_H - 36}
              textAnchor="end"
            >
              pass
            </text>
            <line
              x1={VB_W - 24}
              y1={VB_H - 39}
              x2={VB_W - 8}
              y2={VB_H - 39}
              stroke="var(--mermaid-primary)"
              strokeWidth={1.5}
              opacity={0.5}
            />
            <text
              className="af-legend-text"
              x={VB_W - 28}
              y={VB_H - 22}
              textAnchor="end"
            >
              summarize
            </text>
            <line
              x1={VB_W - 24}
              y1={VB_H - 25}
              x2={VB_W - 8}
              y2={VB_H - 25}
              stroke="var(--mermaid-secondary)"
              strokeWidth={1.5}
              opacity={0.5}
            />
            <text
              className="af-legend-text"
              x={VB_W - 28}
              y={VB_H - 8}
              textAnchor="end"
            >
              prune
            </text>
            <line
              x1={VB_W - 24}
              y1={VB_H - 11}
              x2={VB_W - 8}
              y2={VB_H - 11}
              stroke="var(--mermaid-line)"
              strokeWidth={1.5}
              strokeDasharray="3 2"
              opacity={0.4}
            />
          </g>
        </svg>
      </div>

      {/* Replay button -- shown after completion */}
      {completed && !playing && (
        <div className="af-footer">
          <button
            className="af-replay"
            onClick={handleReplay}
            aria-label="Replay animation"
          >
            &#x21BB; Replay
          </button>
        </div>
      )}
    </figure>
  );
}
