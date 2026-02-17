interface PodGroup {
  count: number;
  style: 'v1' | 'v2' | 'surge' | 'drain' | 'phantom' | 'patch';
}

interface Step {
  label: string;
  pods: PodGroup[];
  note?: string;
}

interface RolloutTimelineProps {
  title: string;
  subtitle?: string;
  steps: Step[] | string;
  caption?: string;
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

export default function RolloutTimeline({
  title,
  subtitle,
  steps,
  caption,
}: RolloutTimelineProps) {
  // Accept JSON string (reliable through MDX/RSC) or direct array
  let stepList: Step[];
  if (typeof steps === 'string') {
    try {
      stepList = JSON.parse(steps);
    } catch {
      stepList = [];
    }
  } else {
    stepList = Array.isArray(steps) ? steps : [];
  }

  return (
    <figure className="rollout not-prose">
      <div className="rollout-header">
        <span className="rollout-title">{title}</span>
        {subtitle && <span className="rollout-subtitle">{subtitle}</span>}
      </div>
      <div className="rollout-body">
        {stepList.map((step, i) => {
          const groups = Array.isArray(step.pods) ? step.pods : [];
          const total = groups.reduce((sum, g) => sum + (g.count || 0), 0);

          return (
            <div key={i} className="rt-step">
              <div className="rt-marker">
                <span className="rt-num">{i + 1}</span>
                {i < stepList.length - 1 && <div className="rt-connector" />}
              </div>
              <div className="rt-content">
                <div className="rt-step-head">
                  <span className="rt-label">{step.label}</span>
                  <span className="rt-total">{total} pods</span>
                </div>
                <div className="rt-grid">
                  {groups.map((group, gi) => (
                    <div key={gi} className="rt-group">
                      <div className="rt-group-pods">
                        {Array.from({ length: group.count || 0 }).map(
                          (_, pi) => (
                            <div
                              key={pi}
                              className={`rt-pod ${podClass[group.style] || 'rt-pod-v1'}`}
                            />
                          ),
                        )}
                      </div>
                      <span
                        className={`rt-group-label ${labelClass[group.style] || 'rt-group-label-v1'}`}
                      >
                        {group.count} {group.style}
                      </span>
                    </div>
                  ))}
                </div>
                {step.note && <div className="rt-note">{step.note}</div>}
              </div>
            </div>
          );
        })}
      </div>
      {caption && <figcaption className="rt-caption">{caption}</figcaption>}
    </figure>
  );
}
