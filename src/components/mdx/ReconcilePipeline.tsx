interface PipelineStep {
  label: string;
  note: string;
  style: 'normal' | 'error';
}

interface ReconcilePipelineProps {
  steps: PipelineStep[] | string;
  annotation?: string;
}

// Literal class names so Tailwind's content scanner preserves them
const stepStyle: Record<string, string> = {
  normal: 'rp-step-normal',
  error: 'rp-step-error',
};

export default function ReconcilePipeline({
  steps,
  annotation,
}: ReconcilePipelineProps) {
  let stepList: PipelineStep[];
  if (typeof steps === 'string') {
    try {
      stepList = JSON.parse(steps);
    } catch {
      stepList = [];
    }
  } else {
    stepList = Array.isArray(steps) ? steps : [];
  }

  const errorStart = stepList.findIndex((s) => s.style === 'error');
  const errorEnd = stepList.reduce(
    (last, s, i) => (s.style === 'error' ? i : last),
    -1,
  );
  const hasErrorRange = errorStart >= 0 && errorEnd >= 0;

  return (
    <figure className="rp not-prose">
      <div className="rp-flow">
        {stepList.map((step, i) => (
          <div
            key={i}
            className={`rp-step ${stepStyle[step.style] || 'rp-step-normal'}`}
          >
            <span className="rp-step-label">{step.label}</span>
            {i < stepList.length - 1 && <span className="rp-arrow">→</span>}
          </div>
        ))}
      </div>
      {hasErrorRange && annotation && (
        <div className="rp-annotation">
          <div
            className="rp-bracket-line"
            style={{
              gridColumnStart: errorStart + 1,
              gridColumnEnd: errorEnd + 2,
            }}
          />
          <span
            className="rp-bracket-label"
            style={{
              gridColumnStart: errorStart + 1,
              gridColumnEnd: errorEnd + 2,
            }}
          >
            {annotation}
          </span>
        </div>
      )}
    </figure>
  );
}
