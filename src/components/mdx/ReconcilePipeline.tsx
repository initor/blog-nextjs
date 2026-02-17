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

  // Find contiguous error range for the bracket
  const errorStart = stepList.findIndex((s) => s.style === 'error');
  const errorEnd = stepList.reduce(
    (last, s, i) => (s.style === 'error' ? i : last),
    -1,
  );
  const hasErrorRange = errorStart >= 0 && errorEnd >= 0;

  return (
    <figure className="rp not-prose">
      <div className="rp-body">
        <ol className="rp-steps">
          {stepList.map((step, i) => (
            <li key={i} className={`rp-step ${stepStyle[step.style] || 'rp-step-normal'}`}>
              <div className="rp-step-num">{i + 1}</div>
              <div className="rp-step-content">
                <span className="rp-step-label">{step.label}</span>
                <span className="rp-step-note">{step.note}</span>
              </div>
              {i < stepList.length - 1 && <div className="rp-arrow">↓</div>}
            </li>
          ))}
        </ol>
        {hasErrorRange && annotation && (
          <div
            className="rp-bracket"
            style={{
              gridRowStart: errorStart + 1,
              gridRowEnd: errorEnd + 2,
            }}
          >
            <div className="rp-bracket-line" />
            <span className="rp-bracket-label">{annotation}</span>
          </div>
        )}
      </div>
    </figure>
  );
}
