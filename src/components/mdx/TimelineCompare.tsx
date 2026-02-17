interface PodGroup {
  count: number;
  style: 'v1' | 'v2' | 'surge' | 'drain' | 'phantom' | 'patch';
}

interface Step {
  label: string;
  pods: PodGroup[];
  note?: string;
}

// Literal class names so Tailwind's content scanner preserves them
const podClass: Record<string, string> = {
  v1: 'rt-pod-v1',
  v2: 'rt-pod-v2',
  surge: 'rt-pod-surge',
  drain: 'rt-pod-drain',
  phantom: 'rt-pod-phantom',
  patch: 'rt-pod-patch',
};

const labelClass: Record<string, string> = {
  v1: 'rt-group-label-v1',
  v2: 'rt-group-label-v2',
  surge: 'rt-group-label-surge',
  drain: 'rt-group-label-drain',
  phantom: 'rt-group-label-phantom',
  patch: 'rt-group-label-patch',
};

function parseSteps(steps: Step[] | string): Step[] {
  if (typeof steps === 'string') {
    try {
      return JSON.parse(steps);
    } catch {
      return [];
    }
  }
  return Array.isArray(steps) ? steps : [];
}

function TimelineColumn({
  title,
  subtitle,
  steps,
  caption,
  variant,
}: {
  title: string;
  subtitle?: string;
  steps: Step[];
  caption?: string;
  variant: 'left' | 'right';
}) {
  return (
    <div className={`tc-col tc-col-${variant}`}>
      <div className="tc-header">
        <span className="tc-title">{title}</span>
        {subtitle && <span className="tc-subtitle">{subtitle}</span>}
      </div>
      <div className="tc-body">
        {steps.map((step, i) => {
          const groups = Array.isArray(step.pods) ? step.pods : [];
          const total = groups.reduce((sum, g) => sum + (g.count || 0), 0);

          return (
            <div key={i} className="tc-step">
              <div className="tc-step-head">
                <span className="tc-step-num">{i + 1}</span>
                <span className="tc-label">{step.label}</span>
                <span className="tc-total">{total}</span>
              </div>
              <div className="tc-grid">
                {groups.map((group, gi) => (
                  <div key={gi} className="tc-group">
                    <div className="tc-group-pods">
                      {Array.from({ length: group.count || 0 }).map((_, pi) => (
                        <div
                          key={pi}
                          className={`tc-pod ${podClass[group.style] || 'rt-pod-v1'}`}
                        />
                      ))}
                    </div>
                    <span
                      className={`tc-group-label ${labelClass[group.style] || 'rt-group-label-v1'}`}
                    >
                      {group.count} {group.style}
                    </span>
                  </div>
                ))}
              </div>
              {step.note && <div className="tc-note">{step.note}</div>}
            </div>
          );
        })}
      </div>
      {caption && <div className="tc-caption">{caption}</div>}
    </div>
  );
}

interface TimelineCompareProps {
  leftTitle: string;
  leftSubtitle?: string;
  leftSteps: Step[] | string;
  leftCaption?: string;
  rightTitle: string;
  rightSubtitle?: string;
  rightSteps: Step[] | string;
  rightCaption?: string;
}

export default function TimelineCompare({
  leftTitle,
  leftSubtitle,
  leftSteps,
  leftCaption,
  rightTitle,
  rightSubtitle,
  rightSteps,
  rightCaption,
}: TimelineCompareProps) {
  return (
    <figure className="tc not-prose">
      <div className="tc-columns">
        <TimelineColumn
          title={leftTitle}
          subtitle={leftSubtitle}
          steps={parseSteps(leftSteps)}
          caption={leftCaption}
          variant="left"
        />
        <div className="tc-divider" />
        <TimelineColumn
          title={rightTitle}
          subtitle={rightSubtitle}
          steps={parseSteps(rightSteps)}
          caption={rightCaption}
          variant="right"
        />
      </div>
    </figure>
  );
}
