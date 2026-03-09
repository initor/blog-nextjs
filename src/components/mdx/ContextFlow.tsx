'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

/*
 * ContextFlow — Animated SVG showing context distillation across agent sessions.
 *
 * Concept: Three sessions, each with context bands. Between sessions, bands are
 * carried forward, distilled (narrowed), or pruned (faded out). The animation
 * loops every 9 seconds to show the flow continuously.
 *
 * Design language: Apple-inspired — generous whitespace, thin strokes,
 * neutral palette with one accent color, no visual clutter.
 */

const VB_W = 800;
const VB_H = 290;

/* ── Layout ──────────────────────────────────── */

const COL_W = 160;
const COL_H = 220;
const COL_GAP = 100;
const COLS_W = COL_W * 3 + COL_GAP * 2;
const X0 = (VB_W - COLS_W) / 2;
const COL_Y = 16;
const COL_RX = 14;

/* ── Colors — restrained Apple palette with semantic meaning ── */

const FILL_BG = '#f5f5f7';       /* Apple light gray */
const FILL_BG_DARK = '#1d1d1f';
const STROKE_SOFT = '#d2d2d7';    /* Apple border gray */
const STROKE_SOFT_DARK = '#424245';
const TEXT_PRIMARY = '#1d1d1f';
const TEXT_PRIMARY_DARK = '#f5f5f7';
const TEXT_SECONDARY = '#86868b';  /* Apple secondary text */

/* Per-band identity colors — consistent across sessions */
const BAND_COLORS: Record<string, { stroke: string; fill: string }> = {
  goals:      { stroke: '#0071e3', fill: '#e8f0fe' },   /* Apple blue */
  research:   { stroke: '#bf5af2', fill: '#f3e8fd' },   /* Apple purple */
  phase:      { stroke: '#30d158', fill: '#e5f8eb' },   /* Apple green */
  prior:      { stroke: '#ff9f0a', fill: '#fff3e0' },   /* Apple orange */
  results:    { stroke: '#64d2ff', fill: '#e5f6fd' },   /* Apple cyan */
};
const PRUNE_STROKE = '#86868b';

function bandColorKey(label: string): string {
  const l = label.toLowerCase();
  if (l.includes('goal')) return 'goals';
  if (l.includes('research')) return 'research';
  if (l.includes('phase') || l.includes('plan')) return 'phase';
  if (l.includes('prior') || l.includes('context')) return 'prior';
  if (l.includes('result') || l.includes('test') || l.includes('verif')) return 'results';
  return 'goals';
}

/* ── Data ────────────────────────────────────── */

interface Band {
  label: string;
  size: number;
  fate: 'carry' | 'distill' | 'prune';
}

const SESSIONS: { name: string; role: string; bands: Band[] }[] = [
  {
    name: 'Session 1',
    role: 'Plan',
    bands: [
      { label: 'Goals', size: 3, fate: 'carry' },
      { label: 'Research', size: 2.5, fate: 'distill' },
      { label: 'Exploration', size: 3, fate: 'prune' },
      { label: 'Prior context', size: 2, fate: 'distill' },
    ],
  },
  {
    name: 'Session 2',
    role: 'Execute',
    bands: [
      { label: 'Goals', size: 3, fate: 'carry' },
      { label: 'Research digest', size: 1.2, fate: 'carry' },
      { label: 'Phase plan', size: 2, fate: 'carry' },
      { label: 'Build logs', size: 2.5, fate: 'prune' },
    ],
  },
  {
    name: 'Session 3',
    role: 'Verify',
    bands: [
      { label: 'Goals', size: 3, fate: 'carry' },
      { label: 'Research digest', size: 1.2, fate: 'carry' },
      { label: 'Phase plan', size: 2, fate: 'carry' },
      { label: 'Results', size: 2, fate: 'carry' },
    ],
  },
];

/* ── Geometry helpers ────────────────────────── */

interface BandRect {
  x: number;
  y: number;
  w: number;
  h: number;
  band: Band;
}

function layoutBands(colIdx: number, bands: Band[]): BandRect[] {
  const sx = X0 + colIdx * (COL_W + COL_GAP);
  const padTop = 52;
  const padBot = 12;
  const padX = 10;
  const areaH = COL_H - padTop - padBot;
  const total = bands.reduce((s, b) => s + b.size, 0);
  const gap = 4;
  const usable = areaH - gap * (bands.length - 1);
  const rects: BandRect[] = [];
  let cy = COL_Y + padTop;

  for (const band of bands) {
    const h = (band.size / total) * usable;
    rects.push({ x: sx + padX, y: cy, w: COL_W - padX * 2, h, band });
    cy += h + gap;
  }
  return rects;
}

function flowPath(src: BandRect, dst: BandRect, colGap: number): string {
  const x1 = src.x + src.w;
  const x2 = dst.x;
  const cx = (x1 + x2) / 2;

  if (src.band.fate === 'prune') {
    const mid = (src.y + src.y + src.h) / 2;
    const fadeX = x1 + colGap * 0.45;
    return [
      `M ${x1} ${src.y}`,
      `C ${fadeX} ${src.y}, ${fadeX} ${mid}, ${fadeX} ${mid}`,
      `C ${fadeX} ${mid}, ${fadeX} ${src.y + src.h}, ${x1} ${src.y + src.h}`,
      'Z',
    ].join(' ');
  }

  if (src.band.fate === 'distill') {
    const srcMid = (src.y + src.y + src.h) / 2;
    const pinchH = src.h * 0.35;
    const pinchTop = srcMid - pinchH / 2;
    const pinchBot = srcMid + pinchH / 2;
    const px = (x1 + x2) / 2;

    return [
      `M ${x1} ${src.y}`,
      `C ${px} ${src.y}, ${px} ${pinchTop}, ${px} ${pinchTop}`,
      `C ${px} ${pinchTop}, ${px} ${dst.y}, ${x2} ${dst.y}`,
      `L ${x2} ${dst.y + dst.h}`,
      `C ${px} ${dst.y + dst.h}, ${px} ${pinchBot}, ${px} ${pinchBot}`,
      `C ${px} ${pinchBot}, ${px} ${src.y + src.h}, ${x1} ${src.y + src.h}`,
      'Z',
    ].join(' ');
  }

  // carry
  return [
    `M ${x1} ${src.y}`,
    `C ${cx} ${src.y}, ${cx} ${dst.y}, ${x2} ${dst.y}`,
    `L ${x2} ${dst.y + dst.h}`,
    `C ${cx} ${dst.y + dst.h}, ${cx} ${src.y + src.h}, ${x1} ${src.y + src.h}`,
    'Z',
  ].join(' ');
}

/* ── Animation timing (0→1 over 6s, loops) ─── */

function colOpacity(colIdx: number, t: number): number {
  const start = colIdx * 0.2;
  const fadeIn = 0.12;
  if (t < start) return 0;
  if (t < start + fadeIn) return (t - start) / fadeIn;
  // Fade out near end for loop reset
  if (t > 0.88) return Math.max(0, (1 - t) / 0.12);
  return 1;
}

function flowT(colIdx: number, t: number): number {
  const start = colIdx * 0.2 + 0.12;
  const dur = 0.14;
  if (t < start) return 0;
  if (t < start + dur) return (t - start) / dur;
  if (t > 0.88) return Math.max(0, (1 - t) / 0.12);
  return 1;
}

/* ── Component ───────────────────────────────── */

export default function ContextFlow() {
  const [t, setT] = useState(0);
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  const DURATION = 9000;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }

    startRef.current = performance.now() - t * DURATION;

    const tick = (now: number) => {
      const elapsed = (now - startRef.current) % DURATION;
      setT(elapsed / DURATION);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [visible]);

  /* Pre-compute layouts and connections */
  const allLayouts = SESSIONS.map((s, i) => layoutBands(i, s.bands));

  interface Connection {
    src: BandRect;
    dst: BandRect;
    colIdx: number;
    path: string;
  }

  const connections: Connection[] = [];
  for (let i = 0; i < allLayouts.length - 1; i++) {
    const srcBands = allLayouts[i];
    const dstBands = allLayouts[i + 1];
    for (const src of srcBands) {
      if (src.band.fate === 'prune') {
        connections.push({
          src,
          dst: src,
          colIdx: i,
          path: flowPath(src, src, COL_GAP),
        });
        continue;
      }
      const dst = dstBands.find((d) => {
        const sl = src.band.label.toLowerCase().split(' ')[0];
        const dl = d.band.label.toLowerCase().split(' ')[0];
        return sl === dl;
      });
      if (dst) {
        connections.push({
          src,
          dst,
          colIdx: i,
          path: flowPath(src, dst, COL_GAP),
        });
      }
    }
  }

  const bg = FILL_BG;
  const stroke = STROKE_SOFT;
  const textP = TEXT_PRIMARY;
  const textS = TEXT_SECONDARY;

  function bandStroke(band: Band) {
    if (band.fate === 'prune') return PRUNE_STROKE;
    return BAND_COLORS[bandColorKey(band.label)]?.stroke ?? '#0071e3';
  }
  function bandFill(band: Band) {
    if (band.fate === 'prune') return 'transparent';
    return BAND_COLORS[bandColorKey(band.label)]?.fill ?? '#e8f0fe';
  }

  return (
    <figure
      className="cf not-prose"
      role="figure"
      aria-label="Context distillation across agent sessions"
      ref={containerRef}
    >
      <div className="cf-header">
        <span className="cf-title">Context Distillation</span>
        <span className="cf-subtitle">Each session starts with narrower, more precise context</span>
      </div>
      <svg
        className="cf-svg"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* ── Flow connections (behind columns) ── */}
        {connections.map((conn, ci) => {
          const opacity = flowT(conn.colIdx, t);
          const fate = conn.src.band.fate;
          const isPrune = fate === 'prune';
          return (
            <path
              key={`flow-${ci}`}
              d={conn.path}
              fill={isPrune ? 'none' : bandFill(conn.src.band)}
              stroke={bandStroke(conn.src.band)}
              strokeWidth={isPrune ? 0.75 : 0.5}
              strokeDasharray={isPrune ? '3 3' : 'none'}
              opacity={opacity * (isPrune ? 0.4 : 0.6)}
            />
          );
        })}

        {/* ── Session columns ── */}
        {SESSIONS.map((session, sIdx) => {
          const sx = X0 + sIdx * (COL_W + COL_GAP);
          const opacity = colOpacity(sIdx, t);
          const bands = allLayouts[sIdx];

          return (
            <g key={`col-${sIdx}`} opacity={opacity}>
              {/* Column background */}
              <rect
                x={sx}
                y={COL_Y}
                width={COL_W}
                height={COL_H}
                rx={COL_RX}
                ry={COL_RX}
                fill={bg}
                stroke={stroke}
                strokeWidth={1}
              />

              {/* Session label */}
              <text
                x={sx + COL_W / 2}
                y={COL_Y + 22}
                textAnchor="middle"
                fill={textP}
                style={{
                  fontFamily: 'var(--font-heading), system-ui, sans-serif',
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                }}
              >
                {session.name}
              </text>

              {/* Role tag */}
              <text
                x={sx + COL_W / 2}
                y={COL_Y + 38}
                textAnchor="middle"
                fill={textS}
                style={{
                  fontFamily: 'var(--font-mono), ui-monospace, monospace',
                  fontSize: '9.5px',
                  fontWeight: 400,
                }}
              >
                {session.role}
              </text>

              {/* Context bands */}
              {bands.map((br, bIdx) => {
                const fate = br.band.fate;
                const isPrune = fate === 'prune';
                return (
                  <g key={`band-${sIdx}-${bIdx}`}>
                    <rect
                      x={br.x}
                      y={br.y}
                      width={br.w}
                      height={Math.max(br.h, 2)}
                      rx={6}
                      ry={6}
                      fill={bandFill(br.band)}
                      stroke={bandStroke(br.band)}
                      strokeWidth={isPrune ? 0.5 : 0.75}
                      strokeDasharray={isPrune ? '2 2' : 'none'}
                      strokeOpacity={isPrune ? 0.5 : 0.4}
                    />
                    {br.h > 16 && (
                      <text
                        x={br.x + 10}
                        y={br.y + br.h / 2 + 3.5}
                        fill={bandStroke(br.band)}
                        style={{
                          fontFamily:
                            'var(--font-heading), system-ui, sans-serif',
                          fontSize: '9.5px',
                          fontWeight: isPrune ? 400 : 500,
                        }}
                      >
                        {br.band.label}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* ── Legend ── */}
        <g opacity={t > 0.5 ? Math.min((t - 0.5) / 0.15, 1) * (t > 0.88 ? Math.max(0, (1 - t) / 0.12) : 1) : 0}>
          {/* Carried forward */}
          <rect x={X0} y={VB_H - 34} width={18} height={3} rx={1.5} fill={BAND_COLORS.goals.stroke} opacity={0.7} />
          <text x={X0 + 24} y={VB_H - 30} fill={textS} style={{ fontFamily: 'var(--font-heading), system-ui, sans-serif', fontSize: '10px' }}>
            carried forward
          </text>

          {/* Distilled */}
          <rect x={X0 + 128} y={VB_H - 34} width={18} height={3} rx={1.5} fill={BAND_COLORS.research.stroke} opacity={0.7} />
          <text x={X0 + 152} y={VB_H - 30} fill={textS} style={{ fontFamily: 'var(--font-heading), system-ui, sans-serif', fontSize: '10px' }}>
            distilled
          </text>

          {/* Pruned */}
          <line x1={X0 + 222} y1={VB_H - 32.5} x2={X0 + 240} y2={VB_H - 32.5} stroke={PRUNE_STROKE} strokeWidth={1} strokeDasharray="3 3" opacity={0.5} />
          <text x={X0 + 246} y={VB_H - 30} fill={textS} style={{ fontFamily: 'var(--font-heading), system-ui, sans-serif', fontSize: '10px' }}>
            pruned
          </text>
        </g>
      </svg>
    </figure>
  );
}
