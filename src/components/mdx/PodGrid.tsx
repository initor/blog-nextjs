interface Step {
  label: string;
  pods: string;
  note?: string;
}

interface PodGridProps {
  title: string;
  steps: Step[];
  caption?: string;
}

type PodState = 'running' | 'surge' | 'drain' | 'phantom' | 'patch';

interface ParsedPod {
  version: string;
  state: PodState;
}

function parsePod(token: string): ParsedPod {
  if (token.startsWith('+')) return { version: token.slice(1), state: 'surge' };
  if (token.startsWith('~')) return { version: token.slice(1), state: 'drain' };
  if (token.startsWith('!')) return { version: token.slice(1), state: 'phantom' };
  if (token.endsWith('*')) return { version: token.slice(0, -1), state: 'patch' };
  return { version: token, state: 'running' };
}

export default function PodGrid({ title, steps, caption }: PodGridProps) {
  const stepList = Array.isArray(steps) ? steps : [];

  return (
    <figure className="pod-grid not-prose">
      <div className="pod-grid-header">
        <span className="pod-grid-title">{title}</span>
      </div>
      <div className="pod-grid-body">
        {stepList.map((step, i) => {
          const pods = (step.pods || '')
            .split(/\s+/)
            .filter(Boolean)
            .map(parsePod);
          return (
            <div key={i} className="pod-grid-step">
              <div className="pod-grid-label">{step.label}</div>
              <div className="pod-grid-row">
                <div className="pod-grid-pods">
                  {pods.map((pod, j) => (
                    <div key={j} className={`pod-box pod-${pod.state}`}>
                      {pod.version}
                    </div>
                  ))}
                </div>
                {step.note && (
                  <span className="pod-grid-note">{step.note}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {caption && (
        <figcaption className="pod-grid-caption">{caption}</figcaption>
      )}
    </figure>
  );
}
