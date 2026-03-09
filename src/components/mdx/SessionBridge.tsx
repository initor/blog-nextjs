/*
 * SessionBridge — Static SVG showing how planning files bridge ephemeral sessions.
 *
 * Visual language matches ContextFlow: same column styling, same color tokens,
 * same typography. Session columns are ephemeral (dashed border), bridge is
 * persistent (solid accent border).
 */

const VB_W = 720;
const VB_H = 260;

/* ── Layout ──────────────────────────────────── */

const COL_W = 160;
const BRIDGE_W = 120;
const GAP = 36;
const TOTAL_W = COL_W * 2 + BRIDGE_W + GAP * 2;
const X0 = (VB_W - TOTAL_W) / 2;
const COL_Y = 10;
const COL_H = 220;
const RX = 14;

const BRIDGE_X = X0 + COL_W + GAP;
const BRIDGE_Y = COL_Y + 20;
const BRIDGE_H = COL_H - 40;

/* ── Colors — same tokens as ContextFlow ────── */

const FILL_BG = '#f5f5f7';
const STROKE_SOFT = '#d2d2d7';
const TEXT_PRIMARY = '#1d1d1f';
const TEXT_SECONDARY = '#86868b';
const ACCENT = '#0071e3';
const ACCENT_FILL = '#e8f0fe';

/* ── Data ────────────────────────────────────── */

const COLS = [
  {
    label: 'Session N',
    sub: 'Execute phase 3',
    items: ['Read STATE.md', 'Run plan tasks', 'Write SUMMARY.md'],
  },
  {
    label: 'Session N+1',
    sub: 'Execute phase 4',
    items: ['Read SUMMARY.md', 'Load decisions', 'Continue from state'],
  },
];

const FILES = ['STATE.md', 'PLAN.md', 'SUMMARY.md', 'CONTEXT.md'];

/* ── Component ───────────────────────────────── */

export default function SessionBridge() {
  const s1x = X0;
  const s2x = X0 + COL_W + GAP + BRIDGE_W + GAP;

  return (
    <figure
      className="sb not-prose"
      role="figure"
      aria-label="Session handoff via planning files"
    >
      <div className="sb-header">
        <span className="sb-title">Session Handoff</span>
        <span className="sb-subtitle">Planning files persist across ephemeral sessions</span>
      </div>
      <svg
        className="sb-svg"
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* ── Session columns (ephemeral) ── */}
        {COLS.map((col, cIdx) => {
          const sx = cIdx === 0 ? s1x : s2x;
          return (
            <g key={`col-${cIdx}`}>
              <rect
                x={sx}
                y={COL_Y}
                width={COL_W}
                height={COL_H}
                rx={RX}
                ry={RX}
                fill={FILL_BG}
                stroke={STROKE_SOFT}
                strokeWidth={1}
              />

              {/* Label */}
              <text
                x={sx + COL_W / 2}
                y={COL_Y + 24}
                textAnchor="middle"
                fill={TEXT_PRIMARY}
                style={{
                  fontFamily: 'var(--font-heading), system-ui, sans-serif',
                  fontSize: '12px',
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                }}
              >
                {col.label}
              </text>

              {/* Subtitle */}
              <text
                x={sx + COL_W / 2}
                y={COL_Y + 40}
                textAnchor="middle"
                fill={TEXT_SECONDARY}
                style={{
                  fontFamily: 'var(--font-mono), ui-monospace, monospace',
                  fontSize: '9.5px',
                  fontWeight: 400,
                }}
              >
                {col.sub}
              </text>

              {/* Task items */}
              {col.items.map((item, iIdx) => {
                const iy = COL_Y + 56 + iIdx * 38;
                return (
                  <g key={`item-${cIdx}-${iIdx}`}>
                    <rect
                      x={sx + 10}
                      y={iy}
                      width={COL_W - 20}
                      height={28}
                      rx={6}
                      ry={6}
                      fill={ACCENT_FILL}
                      stroke={ACCENT}
                      strokeWidth={0.75}
                      strokeOpacity={0.4}
                    />
                    <text
                      x={sx + COL_W / 2}
                      y={iy + 18}
                      textAnchor="middle"
                      fill={ACCENT}
                      style={{
                        fontFamily:
                          'var(--font-heading), system-ui, sans-serif',
                        fontSize: '9.5px',
                        fontWeight: 500,
                      }}
                    >
                      {item}
                    </text>
                  </g>
                );
              })}

              {/* Ephemeral tag */}
              <text
                x={sx + COL_W / 2}
                y={COL_Y + COL_H - 10}
                textAnchor="middle"
                fill={TEXT_SECONDARY}
                style={{
                  fontFamily: 'var(--font-heading), system-ui, sans-serif',
                  fontSize: '9px',
                  fontWeight: 400,
                }}
              >
                ephemeral
              </text>
            </g>
          );
        })}

        {/* ── Central bridge (persistent) ── */}
        <rect
          x={BRIDGE_X}
          y={BRIDGE_Y}
          width={BRIDGE_W}
          height={BRIDGE_H}
          rx={RX}
          ry={RX}
          fill={ACCENT_FILL}
          stroke={ACCENT}
          strokeWidth={1.25}
        />

        {/* Bridge header */}
        <text
          x={BRIDGE_X + BRIDGE_W / 2}
          y={BRIDGE_Y + 22}
          textAnchor="middle"
          fill={ACCENT}
          style={{
            fontFamily: 'var(--font-mono), ui-monospace, monospace',
            fontSize: '11px',
            fontWeight: 600,
          }}
        >
          .planning/
        </text>

        {/* Divider */}
        <line
          x1={BRIDGE_X + 12}
          y1={BRIDGE_Y + 32}
          x2={BRIDGE_X + BRIDGE_W - 12}
          y2={BRIDGE_Y + 32}
          stroke={ACCENT}
          strokeWidth={0.5}
          strokeOpacity={0.2}
        />

        {/* File entries */}
        {FILES.map((file, fIdx) => {
          const fy = BRIDGE_Y + 44 + fIdx * 28;
          return (
            <g key={`file-${fIdx}`}>
              <rect
                x={BRIDGE_X + 10}
                y={fy}
                width={BRIDGE_W - 20}
                height={20}
                rx={6}
                ry={6}
                fill="white"
                stroke={ACCENT}
                strokeWidth={0.5}
                strokeOpacity={0.3}
              />
              <text
                x={BRIDGE_X + BRIDGE_W / 2}
                y={fy + 14}
                textAnchor="middle"
                fill={ACCENT}
                style={{
                  fontFamily: 'var(--font-mono), ui-monospace, monospace',
                  fontSize: '9px',
                  fontWeight: 500,
                }}
              >
                {file}
              </text>
            </g>
          );
        })}

        {/* Persistent tag */}
        <text
          x={BRIDGE_X + BRIDGE_W / 2}
          y={BRIDGE_Y + BRIDGE_H - 8}
          textAnchor="middle"
          fill={ACCENT}
          style={{
            fontFamily: 'var(--font-heading), system-ui, sans-serif',
            fontSize: '9px',
            fontWeight: 500,
          }}
        >
          persistent
        </text>

        {/* ── Arrows ── */}
        <defs>
          <marker
            id="sb-arrow"
            markerWidth={7}
            markerHeight={5}
            refX={6}
            refY={2.5}
            orient="auto"
          >
            <path d="M 0 0 L 7 2.5 L 0 5 Z" fill={ACCENT} fillOpacity={0.6} />
          </marker>
        </defs>

        {/* Write: Session N → Bridge */}
        <line
          x1={s1x + COL_W + 2}
          y1={COL_Y + COL_H / 2 - 8}
          x2={BRIDGE_X - 2}
          y2={COL_Y + COL_H / 2 - 8}
          stroke={ACCENT}
          strokeWidth={1}
          strokeOpacity={0.5}
          markerEnd="url(#sb-arrow)"
        />
        <text
          x={s1x + COL_W + GAP / 2}
          y={COL_Y + COL_H / 2 - 16}
          textAnchor="middle"
          fill={ACCENT}
          style={{
            fontFamily: 'var(--font-heading), system-ui, sans-serif',
            fontSize: '9px',
            fontWeight: 500,
          }}
        >
          write
        </text>

        {/* Read: Bridge → Session N+1 */}
        <line
          x1={BRIDGE_X + BRIDGE_W + 2}
          y1={COL_Y + COL_H / 2 - 8}
          x2={s2x - 2}
          y2={COL_Y + COL_H / 2 - 8}
          stroke={ACCENT}
          strokeWidth={1}
          strokeOpacity={0.5}
          markerEnd="url(#sb-arrow)"
        />
        <text
          x={BRIDGE_X + BRIDGE_W + GAP / 2}
          y={COL_Y + COL_H / 2 - 16}
          textAnchor="middle"
          fill={ACCENT}
          style={{
            fontFamily: 'var(--font-heading), system-ui, sans-serif',
            fontSize: '9px',
            fontWeight: 500,
          }}
        >
          read
        </text>
      </svg>
    </figure>
  );
}
