/* ── Session Handoff — static SVG showing how planning files bridge sessions ── */

const VB_W = 720;
const VB_H = 340;

/* Layout constants */
const SESSION_W = 150;
const BRIDGE_W = 100;
const GAP = 10;
const CONTENT_W = SESSION_W * 2 + BRIDGE_W + GAP * 2;
const X_OFF = (VB_W - CONTENT_W) / 2;

const SESSION_Y = 48;
const SESSION_H = 240;

const BRIDGE_X = X_OFF + SESSION_W + GAP;
const BRIDGE_Y = SESSION_Y + 30;
const BRIDGE_H = SESSION_H - 60;

interface WorkspaceLayoutProps {
  directories?: string;
  title?: string;
}

const SESSION_TASKS = [
  {
    label: 'Session N',
    subtitle: 'Execute phase 3',
    tasks: ['Read STATE.md', 'Run plan tasks', 'Write SUMMARY.md'],
  },
  {
    label: 'Session N+1',
    subtitle: 'Execute phase 4',
    tasks: ['Read SUMMARY.md', 'Load decisions', 'Continue from state'],
  },
];

const BRIDGE_FILES = ['STATE.md', 'SUMMARY.md', 'PLAN.md', 'CONTEXT.md'];

export default function WorkspaceLayout({
  title = 'Session Handoff',
}: WorkspaceLayoutProps) {
  const s1x = X_OFF;
  const s2x = X_OFF + SESSION_W + GAP + BRIDGE_W + GAP;

  return (
    <figure className="wl not-prose" role="figure" aria-label={title}>
      <div className="wl-header">
        <span className="wl-title">{title}</span>
      </div>
      <div className="wl-body">
        <svg
          className="wl-svg"
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* ── Subtitle ── */}
          <text
            className="wl-subtitle"
            x={VB_W / 2}
            y={28}
            textAnchor="middle"
          >
            Planning files persist across ephemeral sessions
          </text>

          {/* ── Session columns (ephemeral, dashed) ── */}
          {SESSION_TASKS.map((session, sIdx) => {
            const sx = sIdx === 0 ? s1x : s2x;
            return (
              <g key={`session-${sIdx}`}>
                {/* Dashed border = ephemeral */}
                <rect
                  className="wl-session-box"
                  x={sx}
                  y={SESSION_Y}
                  width={SESSION_W}
                  height={SESSION_H}
                  rx={6}
                  ry={6}
                />

                {/* Session label */}
                <text
                  className="wl-session-label"
                  x={sx + SESSION_W / 2}
                  y={SESSION_Y + 22}
                  textAnchor="middle"
                >
                  {session.label}
                </text>

                {/* Session subtitle */}
                <text
                  className="wl-session-sub"
                  x={sx + SESSION_W / 2}
                  y={SESSION_Y + 38}
                  textAnchor="middle"
                >
                  {session.subtitle}
                </text>

                {/* Divider */}
                <line
                  x1={sx + 12}
                  y1={SESSION_Y + 48}
                  x2={sx + SESSION_W - 12}
                  y2={SESSION_Y + 48}
                  stroke="var(--code-border)"
                  strokeWidth={0.75}
                />

                {/* Task items */}
                {session.tasks.map((task, tIdx) => {
                  const ty = SESSION_Y + 68 + tIdx * 50;
                  return (
                    <g key={`task-${sIdx}-${tIdx}`}>
                      <rect
                        className="wl-task-box"
                        x={sx + 10}
                        y={ty}
                        width={SESSION_W - 20}
                        height={32}
                        rx={4}
                        ry={4}
                      />
                      <text
                        className="wl-task-label"
                        x={sx + SESSION_W / 2}
                        y={ty + 20}
                        textAnchor="middle"
                      >
                        {task}
                      </text>
                    </g>
                  );
                })}

                {/* Ephemeral label at bottom */}
                <text
                  className="wl-ephemeral-tag"
                  x={sx + SESSION_W / 2}
                  y={SESSION_Y + SESSION_H - 10}
                  textAnchor="middle"
                >
                  ephemeral
                </text>
              </g>
            );
          })}

          {/* ── Central bridge (persistent, solid) ── */}
          <rect
            className="wl-bridge-box"
            x={BRIDGE_X}
            y={BRIDGE_Y}
            width={BRIDGE_W}
            height={BRIDGE_H}
            rx={6}
            ry={6}
          />

          {/* Bridge header */}
          <text
            className="wl-bridge-header"
            x={BRIDGE_X + BRIDGE_W / 2}
            y={BRIDGE_Y + 20}
            textAnchor="middle"
          >
            .planning/
          </text>

          {/* Divider */}
          <line
            x1={BRIDGE_X + 8}
            y1={BRIDGE_Y + 30}
            x2={BRIDGE_X + BRIDGE_W - 8}
            y2={BRIDGE_Y + 30}
            stroke="var(--mermaid-primary)"
            strokeWidth={0.5}
            strokeOpacity={0.4}
          />

          {/* Planning file labels */}
          {BRIDGE_FILES.map((file, fIdx) => {
            const fy = BRIDGE_Y + 52 + fIdx * 36;
            return (
              <g key={`file-${fIdx}`}>
                <rect
                  className="wl-file-box"
                  x={BRIDGE_X + 8}
                  y={fy - 12}
                  width={BRIDGE_W - 16}
                  height={24}
                  rx={3}
                  ry={3}
                />
                <text
                  className="wl-file-label"
                  x={BRIDGE_X + BRIDGE_W / 2}
                  y={fy + 4}
                  textAnchor="middle"
                >
                  {file}
                </text>
              </g>
            );
          })}

          {/* "persistent" label at bottom of bridge */}
          <text
            className="wl-persistent-tag"
            x={BRIDGE_X + BRIDGE_W / 2}
            y={BRIDGE_Y + BRIDGE_H - 8}
            textAnchor="middle"
          >
            persistent
          </text>

          {/* ── Arrows: Session N -> Bridge ── */}
          <g className="wl-arrow-group">
            {/* Write arrow (Session N -> Bridge) */}
            <line
              className="wl-arrow-line"
              x1={s1x + SESSION_W}
              y1={SESSION_Y + SESSION_H / 2 - 16}
              x2={BRIDGE_X}
              y2={SESSION_Y + SESSION_H / 2 - 16}
              markerEnd="url(#wl-arrowhead)"
            />
            <text
              className="wl-arrow-label"
              x={s1x + SESSION_W + (GAP / 2)}
              y={SESSION_Y + SESSION_H / 2 - 22}
              textAnchor="middle"
            >
              write
            </text>

            {/* Read arrow (Bridge -> Session N+1) */}
            <line
              className="wl-arrow-line"
              x1={BRIDGE_X + BRIDGE_W}
              y1={SESSION_Y + SESSION_H / 2 - 16}
              x2={s2x}
              y2={SESSION_Y + SESSION_H / 2 - 16}
              markerEnd="url(#wl-arrowhead)"
            />
            <text
              className="wl-arrow-label"
              x={BRIDGE_X + BRIDGE_W + (GAP / 2)}
              y={SESSION_Y + SESSION_H / 2 - 22}
              textAnchor="middle"
            >
              read
            </text>
          </g>

          {/* ── Arrow marker definition ── */}
          <defs>
            <marker
              id="wl-arrowhead"
              markerWidth={8}
              markerHeight={6}
              refX={7}
              refY={3}
              orient="auto"
            >
              <path
                d="M 0 0 L 8 3 L 0 6 Z"
                fill="var(--mermaid-primary)"
                fillOpacity={0.7}
              />
            </marker>
          </defs>

          {/* ── Legend ── */}
          <g className="wl-legend">
            <rect
              x={VB_W - 145}
              y={VB_H - 34}
              width={8}
              height={8}
              rx={1}
              fill="none"
              stroke="var(--code-comment)"
              strokeWidth={1}
              strokeDasharray="3 2"
            />
            <text
              className="wl-legend-text"
              x={VB_W - 132}
              y={VB_H - 27}
            >
              ephemeral
            </text>
            <rect
              x={VB_W - 72}
              y={VB_H - 34}
              width={8}
              height={8}
              rx={1}
              fill="var(--mermaid-primary-fill)"
              stroke="var(--mermaid-primary)"
              strokeWidth={1.5}
            />
            <text
              className="wl-legend-text"
              x={VB_W - 59}
              y={VB_H - 27}
            >
              persistent
            </text>
          </g>
        </svg>
      </div>
    </figure>
  );
}
