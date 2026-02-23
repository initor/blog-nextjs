'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

/* ── Data types ──────────────────────────────────────────── */

type BandFate = 'pass' | 'summarize' | 'prune';
type BandColor = 'blue' | 'green' | 'purple';

interface ContextBand {
  label: string;
  size: number;
  fate: BandFate;
  color: BandColor;
}

interface SessionConfig {
  name: string;
  bands: ContextBand[];
}

/* ── Default data: 3 sessions illustrating context flow ── */

const DEFAULT_SESSIONS: SessionConfig[] = [
  {
    name: 'Session 1',
    bands: [
      { label: 'API specs', size: 3, fate: 'pass', color: 'blue' },
      { label: 'Architecture notes', size: 2, fate: 'summarize', color: 'purple' },
      { label: 'Test results', size: 2, fate: 'summarize', color: 'green' },
      { label: 'Debug logs', size: 3, fate: 'prune', color: 'blue' },
      { label: 'Verbose output', size: 2, fate: 'prune', color: 'green' },
    ],
  },
  {
    name: 'Session 2',
    bands: [
      { label: 'API specs', size: 3, fate: 'pass', color: 'blue' },
      { label: 'Arch summary', size: 1, fate: 'pass', color: 'purple' },
      { label: 'Test summary', size: 1, fate: 'summarize', color: 'green' },
      { label: 'Schema changes', size: 2, fate: 'pass', color: 'purple' },
      { label: 'Migration logs', size: 2, fate: 'prune', color: 'blue' },
    ],
  },
  {
    name: 'Session 3',
    bands: [
      { label: 'API specs', size: 3, fate: 'pass', color: 'blue' },
      { label: 'Arch summary', size: 1, fate: 'pass', color: 'purple' },
      { label: 'Test digest', size: 1, fate: 'pass', color: 'green' },
      { label: 'Schema changes', size: 2, fate: 'pass', color: 'purple' },
      { label: 'Integration tests', size: 2, fate: 'pass', color: 'green' },
      { label: 'Deploy config', size: 2, fate: 'pass', color: 'blue' },
    ],
  },
];

/* ── Prop deserialization ────────────────────────────────── */

function parseSessions(sessions: string | SessionConfig[]): SessionConfig[] {
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

/* ── Layout constants ────────────────────────────────────── */

const VB_W = 800;
const VB_H = 420;
const SESSION_W = 140;
const GAP = 110;
const BAND_PAD = 6;
const SESSION_RX = 8;
/** Total width of the 3 session blocks + 2 gaps. */
const CONTENT_W = SESSION_W * 3 + GAP * 2;
const X_OFFSET = (VB_W - CONTENT_W) / 2;

/** Session top and height, leaving room for session labels above. */
const SESSION_Y = 50;
const SESSION_H = VB_H - SESSION_Y - 30;

/* ── Geometry helpers ────────────────────────────────────── */

interface BandRect {
  x: number;
  y: number;
  w: number;
  h: number;
  band: ContextBand;
}

function layoutBands(
  sessionIdx: number,
  bands: ContextBand[],
): BandRect[] {
  const sx = X_OFFSET + sessionIdx * (SESSION_W + GAP);
  const totalSize = bands.reduce((s, b) => s + b.size, 0);
  const usableH = SESSION_H - BAND_PAD * 2;
  const rects: BandRect[] = [];
  let cy = SESSION_Y + BAND_PAD;

  for (const band of bands) {
    const h = (band.size / totalSize) * usableH;
    rects.push({ x: sx, y: cy, w: SESSION_W, h, band });
    cy += h;
  }
  return rects;
}

/**
 * Build a cubic bezier path between a source band (right edge) and a
 * destination band (left edge).  The control points create a smooth
 * S-curve through the pinch zone.
 */
function flowPath(
  src: BandRect,
  dst: BandRect,
): string {
  const x1 = src.x + src.w;
  const y1s = src.y;
  const y1e = src.y + src.h;

  const x2 = dst.x;
  const y2s = dst.y;
  const y2e = dst.y + dst.h;

  /** Pinch-point x: midpoint of the gap. */
  const px = x1 + GAP / 2;

  // For "summarize" fate: narrow at the pinch, then widen to destination.
  // For "pass" fate: direct smooth curve.
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
    // At the pinch, the band narrows to ~40% of its source height.
    const srcMid = (y1s + y1e) / 2;
    const pinchHalf = (src.h * 0.4) / 2;
    const pinchTop = srcMid - pinchHalf;
    const pinchBot = srcMid + pinchHalf;

    const cxL = x1 + GAP * 0.3;
    const cxR = x2 - GAP * 0.3;

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

  // "prune": band tapers to nothing at the pinch point.
  const srcMid = (y1s + y1e) / 2;
  const cx = x1 + GAP * 0.4;
  return [
    `M ${x1} ${y1s}`,
    `C ${cx} ${y1s}, ${px - 5} ${srcMid}, ${px} ${srcMid}`,
    `C ${px - 5} ${srcMid}, ${cx} ${y1e}, ${x1} ${y1e}`,
    'Z',
  ].join(' ');
}

/* ── Flow connections: match bands across sessions ───────── */

interface FlowConnection {
  srcRect: BandRect;
  dstRect: BandRect;
  srcSessionIdx: number;
  fate: BandFate;
  color: BandColor;
  path: string;
}

/**
 * Determine which bands survive from one session to the next.
 * A band "connects" to the next session's band with a matching label
 * (or a label that is its summarized equivalent).
 */
function buildConnections(
  allLayouts: BandRect[][],
): FlowConnection[] {
  const connections: FlowConnection[] = [];

  for (let sIdx = 0; sIdx < allLayouts.length - 1; sIdx++) {
    const srcBands = allLayouts[sIdx];
    const dstBands = allLayouts[sIdx + 1];

    for (const srcRect of srcBands) {
      if (srcRect.band.fate === 'prune') {
        // Pruned bands get a path that tapers to nothing (no destination needed).
        connections.push({
          srcRect,
          dstRect: srcRect, // placeholder -- path gen only uses src for prune
          srcSessionIdx: sIdx,
          fate: 'prune',
          color: srcRect.band.color,
          path: flowPath(srcRect, srcRect),
        });
        continue;
      }

      // Try to find a matching destination band by label heuristic.
      const dstRect = dstBands.find((d) => {
        const sl = srcRect.band.label.toLowerCase();
        const dl = d.band.label.toLowerCase();
        // Exact match or destination contains abbreviated form.
        return (
          dl === sl ||
          dl.startsWith(sl.split(' ')[0]) ||
          sl.startsWith(dl.split(' ')[0])
        );
      });

      if (dstRect) {
        const path = flowPath(srcRect, dstRect);
        connections.push({
          srcRect,
          dstRect,
          srcSessionIdx: sIdx,
          fate: srcRect.band.fate,
          color: srcRect.band.color,
          path,
        });
      }
    }
  }
  return connections;
}

/* ── Animation phases ────────────────────────────────────── */

/**
 * Maps progress (0-1) to per-element visibility.
 *
 * Timeline:
 * 0.00-0.20  Session 1 bands appear
 * 0.20-0.35  Flow curves from S1 draw through pinch 1
 * 0.35-0.45  Pinch 1: prune fades, summarize narrows
 * 0.45-0.55  Session 2 bands appear
 * 0.55-0.70  Flow curves from S2 draw through pinch 2
 * 0.70-0.80  Pinch 2: prune fades, summarize narrows
 * 0.80-1.00  Session 3 bands appear
 */

function sessionOpacity(sessionIdx: number, progress: number): number {
  if (sessionIdx === 0) return progress < 0.2 ? progress / 0.2 : 1;
  if (sessionIdx === 1)
    return progress < 0.45 ? 0 : progress < 0.55 ? (progress - 0.45) / 0.1 : 1;
  // sessionIdx === 2
  return progress < 0.8 ? 0 : (progress - 0.8) / 0.2;
}

function flowOpacity(srcSessionIdx: number, fate: BandFate, progress: number): number {
  if (srcSessionIdx === 0) {
    // Flows from session 0 appear during 0.20-0.45.
    if (progress < 0.2) return 0;
    if (fate === 'prune') {
      // Prune flows fade during 0.35-0.45.
      if (progress < 0.35) return (progress - 0.2) / 0.15;
      return Math.max(0, 1 - (progress - 0.35) / 0.1);
    }
    if (progress < 0.35) return (progress - 0.2) / 0.15;
    return 1;
  }
  // srcSessionIdx === 1
  if (progress < 0.55) return 0;
  if (fate === 'prune') {
    if (progress < 0.7) return (progress - 0.55) / 0.15;
    return Math.max(0, 1 - (progress - 0.7) / 0.1);
  }
  if (progress < 0.7) return (progress - 0.55) / 0.15;
  return 1;
}

/** strokeDashoffset for the animated draw effect (1 = fully hidden, 0 = fully drawn). */
function flowDashOffset(srcSessionIdx: number, progress: number): number {
  if (srcSessionIdx === 0) {
    if (progress < 0.2) return 1;
    if (progress < 0.35) return 1 - (progress - 0.2) / 0.15;
    return 0;
  }
  if (progress < 0.55) return 1;
  if (progress < 0.7) return 1 - (progress - 0.55) / 0.15;
  return 0;
}

/* ── Pinch-point marker ──────────────────────────────────── */

function PinchMarker({ x }: { x: number }) {
  return (
    <line
      className="cf-pinch"
      x1={x}
      y1={SESSION_Y - 5}
      x2={x}
      y2={SESSION_Y + SESSION_H + 5}
      strokeDasharray="4 4"
    />
  );
}

/* ── Component ───────────────────────────────────────────── */

interface Props {
  sessions?: string;
  title?: string;
}

export default function SessionContextFlow({
  sessions,
  title = 'Context Flow Across Sessions',
}: Props) {
  const data = useMemo(
    () => (sessions ? parseSessions(sessions) : DEFAULT_SESSIONS),
    [sessions],
  );

  /* Layouts for each session's bands. */
  const allLayouts = useMemo(() => data.map((s, i) => layoutBands(i, s.bands)), [data]);
  const connections = useMemo(() => buildConnections(allLayouts), [allLayouts]);

  /* Animation state. */
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);

  const containerRef = useRef<HTMLElement>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const DURATION_MS = 2500;

  /* IntersectionObserver: auto-play when scrolled into viewport. */
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

  /* ── Render ──────────────────────────────────────────── */

  return (
    <figure
      className="cf not-prose"
      role="figure"
      aria-label={title}
      ref={containerRef}
    >
      <div className="cf-header">
        <span className="cf-title">{title}</span>
      </div>

      <div className="cf-body">
        <svg
          className="cf-svg"
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Pinch-point markers between sessions. */}
          {[0, 1].map((i) => {
            const px = X_OFFSET + SESSION_W + i * (SESSION_W + GAP) + GAP / 2;
            return <PinchMarker key={`pinch-${i}`} x={px} />;
          })}

          {/* Flow connections (render behind session blocks). */}
          {connections.map((conn, ci) => {
            const opacity = flowOpacity(conn.srcSessionIdx, conn.fate, progress);
            const dashOffset = flowDashOffset(conn.srcSessionIdx, progress);
            const isPruned = conn.fate === 'prune';

            return (
              <path
                key={`flow-${ci}`}
                d={conn.path}
                fill={BAND_FILL[conn.color]}
                stroke={BAND_STROKE[conn.color]}
                strokeWidth={1}
                opacity={opacity}
                className={
                  isPruned
                    ? 'cf-flow cf-flow-pruned'
                    : conn.fate === 'summarize'
                      ? 'cf-flow cf-flow-summarized'
                      : 'cf-flow'
                }
                style={
                  isPruned
                    ? {
                        strokeDasharray: '4 3',
                        opacity,
                      }
                    : {
                        strokeDasharray: 1000,
                        strokeDashoffset: dashOffset * 1000,
                        opacity,
                      }
                }
              />
            );
          })}

          {/* Session blocks and bands. */}
          {data.map((session, sIdx) => {
            const bands = allLayouts[sIdx];
            const sx = X_OFFSET + sIdx * (SESSION_W + GAP);
            const opacity = sessionOpacity(sIdx, progress);

            return (
              <g key={`session-${sIdx}`} opacity={opacity}>
                {/* Session background rect. */}
                <rect
                  className="cf-session"
                  x={sx}
                  y={SESSION_Y}
                  width={SESSION_W}
                  height={SESSION_H}
                  rx={SESSION_RX}
                  ry={SESSION_RX}
                />

                {/* Session label above the block. */}
                <text
                  className="cf-session-label"
                  x={sx + SESSION_W / 2}
                  y={SESSION_Y - 12}
                  textAnchor="middle"
                >
                  {session.name}
                </text>

                {/* Context bands inside the session block (clipped). */}
                <clipPath id={`clip-session-${sIdx}`}>
                  <rect
                    x={sx}
                    y={SESSION_Y}
                    width={SESSION_W}
                    height={SESSION_H}
                    rx={SESSION_RX}
                    ry={SESSION_RX}
                  />
                </clipPath>
                <g clipPath={`url(#clip-session-${sIdx})`}>
                  {bands.map((br, bIdx) => (
                    <g key={`band-${sIdx}-${bIdx}`}>
                      <rect
                        className={`cf-band-${br.band.color}`}
                        x={br.x}
                        y={br.y}
                        width={br.w}
                        height={br.h}
                      />
                      {br.h > 18 && (
                        <text
                          className="cf-band-label"
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
        </svg>
      </div>

      {/* Replay button -- shown after full completion. */}
      {completed && !playing && (
        <div className="cf-footer">
          <button
            className="cf-replay"
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
