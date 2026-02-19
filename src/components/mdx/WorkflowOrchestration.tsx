'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

interface AgentTask {
  label: string;
  duration: number;
}

interface AgentSession {
  agent: string;
  directory: string;
  tasks: AgentTask[];
}

const DEFAULT_SESSIONS: AgentSession[] = [
  {
    agent: 'Executor: Build API',
    directory: 'web-app',
    tasks: [
      { label: 'Read specs', duration: 2 },
      { label: 'Scaffold routes', duration: 3 },
      { label: 'Write tests', duration: 2 },
    ],
  },
  {
    agent: 'Executor: Refactor auth',
    directory: 'infra-tool',
    tasks: [
      { label: 'Analyze deps', duration: 2 },
      { label: 'Extract module', duration: 4 },
      { label: 'Verify types', duration: 1 },
    ],
  },
  {
    agent: 'Researcher: Auth patterns',
    directory: 'cli-prototype',
    tasks: [
      { label: 'Search codebase', duration: 3 },
      { label: 'Summarize findings', duration: 2 },
    ],
  },
];

/** Color classes for task bars — literal lookup for CSS scanning. */
const laneColor: Record<number, string> = {
  0: 'wo-task-blue',
  1: 'wo-task-green',
  2: 'wo-task-purple',
};

function parseSessions(sessions: string | AgentSession[]): AgentSession[] {
  if (typeof sessions === 'string') {
    try {
      return JSON.parse(sessions);
    } catch {
      return [];
    }
  }
  return Array.isArray(sessions) ? sessions : [];
}

/** Compute total ticks needed for a session (sum of all task durations). */
function sessionTotalTicks(session: AgentSession): number {
  return session.tasks.reduce((sum, t) => sum + t.duration, 0);
}

/** Compute the global max ticks across all sessions. */
function maxTicks(sessions: AgentSession[]): number {
  return Math.max(...sessions.map(sessionTotalTicks), 1);
}

/**
 * For a given tick and session, compute each task's fill percentage (0-100).
 * Tasks are sequential within a lane: task N starts when task N-1 finishes.
 */
function taskProgress(
  session: AgentSession,
  tick: number,
): { fill: number; state: 'done' | 'active' | 'pending' }[] {
  let elapsed = 0;
  return session.tasks.map((task) => {
    const taskStart = elapsed;
    const taskEnd = elapsed + task.duration;
    elapsed = taskEnd;

    if (tick >= taskEnd) {
      return { fill: 100, state: 'done' as const };
    }
    if (tick > taskStart) {
      const progress = ((tick - taskStart) / task.duration) * 100;
      return { fill: Math.min(100, progress), state: 'active' as const };
    }
    return { fill: 0, state: 'pending' as const };
  });
}

interface Props {
  sessions?: string;
  title?: string;
}

export default function WorkflowOrchestration({
  sessions,
  title = 'Orchestrated Workflow',
}: Props) {
  const data = useMemo(
    () => (sessions ? parseSessions(sessions) : DEFAULT_SESSIONS),
    [sessions],
  );

  const totalTicks = useMemo(() => maxTicks(data), [data]);

  const [tick, setTick] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);

  const containerRef = useRef<HTMLElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // IntersectionObserver: auto-play when scrolled into viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasPlayed) {
          setPlaying(true);
          setHasPlayed(true);
          // Disconnect after triggering -- only auto-play once
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

  // Animation tick interval
  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setTick((prev) => {
          const next = prev + 1;
          if (next >= totalTicks) {
            setPlaying(false);
            setCompleted(true);
            return totalTicks;
          }
          return next;
        });
      }, 300);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, totalTicks]);

  const handleReplay = useCallback(() => {
    setTick(0);
    setCompleted(false);
    setPlaying(true);
  }, []);

  // Orchestrator progress: fraction of total ticks elapsed
  const orchestratorProgress = Math.min(tick / totalTicks, 1);

  // Orchestrator phases: dispatch (0-10%), wait (10-90%), collect (90-100%)
  const orchestratorPhase =
    orchestratorProgress < 0.1
      ? 'dispatch'
      : orchestratorProgress < 0.9
        ? 'wait'
        : 'collect';

  return (
    <figure
      className="wo not-prose"
      role="figure"
      aria-label={title}
      ref={containerRef}
    >
      <div className="wo-header">
        <span className="wo-title">{title}</span>
      </div>

      <div className="wo-body">
        {/* Orchestrator lane */}
        <div className="wo-orchestrator">
          <div className="wo-lane-info">
            <span className="wo-agent">Orchestrator</span>
          </div>
          <div className="wo-timeline">
            <div className="wo-orch-bar">
              <div
                className="wo-orch-fill"
                style={{ width: `${orchestratorProgress * 100}%` }}
              />
              <div className="wo-orch-phases">
                <span
                  className={`wo-orch-phase${orchestratorPhase === 'dispatch' ? ' wo-orch-phase-active' : ''}${orchestratorProgress >= 0.1 ? ' wo-orch-phase-done' : ''}`}
                >
                  dispatch
                </span>
                <span
                  className={`wo-orch-phase${orchestratorPhase === 'wait' ? ' wo-orch-phase-active' : ''}${orchestratorProgress >= 0.9 ? ' wo-orch-phase-done' : ''}`}
                >
                  wait
                </span>
                <span
                  className={`wo-orch-phase${orchestratorPhase === 'collect' ? ' wo-orch-phase-active' : ''}${completed ? ' wo-orch-phase-done' : ''}`}
                >
                  collect
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Agent session lanes */}
        <div className="wo-lanes">
          {data.map((session, laneIdx) => {
            const progress = taskProgress(session, tick);
            const laneTotalTicks = sessionTotalTicks(session);
            const laneComplete = tick >= laneTotalTicks;
            const colorClass = laneColor[laneIdx % 3] || 'wo-task-blue';

            return (
              <div className="wo-lane" key={laneIdx}>
                <div className="wo-lane-info">
                  <span className="wo-agent">{session.agent}</span>
                  <span className="wo-dir">{session.directory}/</span>
                </div>
                <div className="wo-timeline">
                  <div className="wo-tasks">
                    {session.tasks.map((task, taskIdx) => {
                      const p = progress[taskIdx];
                      const widthPct =
                        (task.duration / totalTicks) * 100;
                      const stateClass =
                        p.state === 'done'
                          ? 'wo-task-done'
                          : p.state === 'active'
                            ? 'wo-task-active'
                            : 'wo-task-pending';

                      return (
                        <div
                          className={`wo-task ${colorClass} ${stateClass}`}
                          key={taskIdx}
                          style={{ width: `${widthPct}%` }}
                        >
                          <div
                            className="wo-task-fill"
                            style={{ width: `${p.fill}%` }}
                          />
                          <span className="wo-task-label">{task.label}</span>
                        </div>
                      );
                    })}
                  </div>
                  {laneComplete && completed && (
                    <span className="wo-complete" aria-label="Complete">
                      &#x2713;
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Replay button — only shown after full completion */}
      {completed && !playing && (
        <div className="wo-footer">
          <button
            className="wo-replay"
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
