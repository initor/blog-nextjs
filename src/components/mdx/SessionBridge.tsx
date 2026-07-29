/*
 * SessionBridge — how planning files bridge ephemeral sessions.
 *
 * Built from HTML and CSS rather than a fixed-viewBox SVG, matching
 * RollingUpdateVisualizer and TimelineCompare. The SVG version scaled a
 * 720-unit-wide drawing into the prose column, which multiplied its 9px and
 * 12px labels by 0.42 on a phone and rendered them at 4px. Text here is in rem
 * and never scales with the container, so it reads at every width, and it also
 * responds to a reader who enlarges their browser font, which viewBox units
 * cannot do.
 */

interface Session {
  name: string;
  sub: string;
  items: string[];
}

const SESSIONS: [Session, Session] = [
  {
    name: 'Session N',
    sub: 'Execute phase 3',
    items: ['Read STATE.md', 'Run plan tasks', 'Distill SUMMARY.md'],
  },
  {
    name: 'Session N+1',
    sub: 'Execute phase 4',
    items: ['Read SUMMARY.md', 'Load decisions', 'Continue from state'],
  },
];

const FILES = ['STATE.md', 'PLAN.md', 'SUMMARY.md', 'CONTEXT.md'];

function SessionCard({ session }: { session: Session }) {
  return (
    <div className="sb-session">
      <span className="sb-session-name">{session.name}</span>
      <span className="sb-session-sub">{session.sub}</span>
      <ul className="sb-tasks">
        {session.items.map((item) => (
          <li key={item} className="sb-task">
            {item}
          </li>
        ))}
      </ul>
      <span className="sb-tag">ephemeral</span>
    </div>
  );
}

function Arrow({ label }: { label: string }) {
  return (
    <div className="sb-arrow">
      <span className="sb-arrow-label">{label}</span>
      <span className="sb-arrow-line" aria-hidden="true" />
    </div>
  );
}

export default function SessionBridge() {
  return (
    <figure
      className="sb not-prose"
      role="figure"
      aria-label="Session handoff via planning files"
    >
      <div className="sb-header">
        <span className="sb-title">Session Handoff</span>
        <span className="sb-subtitle">
          Planning files persist across ephemeral sessions
        </span>
      </div>

      {/* DOM order reads left to right on desktop and top to bottom on a phone,
          so the stacked layout needs no reordering. */}
      <div className="sb-body">
        <SessionCard session={SESSIONS[0]} />
        <Arrow label="distill" />

        <div className="sb-bridge">
          <span className="sb-bridge-head">.planning/</span>
          <ul className="sb-files">
            {FILES.map((file) => (
              <li key={file} className="sb-file">
                {file}
              </li>
            ))}
          </ul>
          <span className="sb-tag sb-tag-persistent">persistent</span>
        </div>

        <Arrow label="read" />
        <SessionCard session={SESSIONS[1]} />
      </div>
    </figure>
  );
}
