/** Starting height of a document frame, and its height for readers without JavaScript. */
export const DOCUMENT_INITIAL_HEIGHT = '85svh';
/** A screen frame never gets shorter than this, even in a short window. */
export const SCREEN_MIN_HEIGHT = 420;
/** Space kept under a screen frame on the first screen. */
export const SCREEN_BOTTOM_GAP = 24;

/** How many fits in a row may each make the page grow again before the frame holds still to look. */
export const RUNAWAY_FITS = 3;
/** A growth counts as caused by the previous fit when it arrives within this many milliseconds. */
export const FEEDBACK_WINDOW_MS = 100;
/** How long the frame holds still to see whether the page changes on its own. */
export const HOLD_MS = 60;

export type FitDecision =
  | { kind: 'keep' }
  | { kind: 'resize'; height: number }
  | { kind: 'hold'; recheckInMs: number }
  | { kind: 'stop'; reason: string };

type Phase = 'fitting' | 'holding' | 'probing' | 'stopped';

/**
 * Turns successive measurements of a piece's content height into frame heights.
 *
 * A page sized in vh grows every time its frame grows. Growth right after each of RUNAWAY_FITS
 * fits is only a suspicion, because an animation or a reflow looks the same, so the tracker
 * tests it: it holds the frame still for HOLD_MS. A page that changes meanwhile is changing on
 * its own, and fitting resumes. A page that stays still gets the frame grown once more, and
 * only if it grows again in response does the tracker stop. A stopped frame stays scrollable
 * and still follows shrinks, which cannot run away.
 * Pure: the caller passes the clock, so tests control time.
 */
export class FitTracker {
  private frameHeight: number;
  private lastResizeAt = Number.NEGATIVE_INFINITY;
  private fedBack = 0;
  private phase: Phase = 'fitting';
  private heldHeight = 0;

  constructor(initialFrameHeight: number) {
    this.frameHeight = Math.ceil(initialFrameHeight);
  }

  measure(contentHeight: number, now: number): FitDecision {
    const height = Math.ceil(contentHeight);
    switch (this.phase) {
      case 'stopped':
        return height < this.frameHeight ? this.resize(height, now) : { kind: 'keep' };
      case 'holding':
        if (height !== this.heldHeight) return this.resume(height, now);
        this.phase = 'probing';
        return this.resize(height, now);
      case 'probing':
        if (height > this.frameHeight && now - this.lastResizeAt <= FEEDBACK_WINDOW_MS) {
          this.phase = 'stopped';
          return {
            kind: 'stop',
            reason: 'the page grows every time its frame does, so it sizes itself to the frame; use layout: screen',
          };
        }
        return this.resume(height, now);
      case 'fitting': {
        if (height === this.frameHeight) {
          this.fedBack = 0;
          return { kind: 'keep' };
        }
        const causedByLastFit = height > this.frameHeight && now - this.lastResizeAt <= FEEDBACK_WINDOW_MS;
        this.fedBack = causedByLastFit ? this.fedBack + 1 : 0;
        if (this.fedBack >= RUNAWAY_FITS) {
          this.phase = 'holding';
          this.heldHeight = height;
          return { kind: 'hold', recheckInMs: HOLD_MS };
        }
        return this.resize(height, now);
      }
    }
  }

  private resume(height: number, now: number): FitDecision {
    this.phase = 'fitting';
    this.fedBack = 0;
    return height === this.frameHeight ? { kind: 'keep' } : this.resize(height, now);
  }

  private resize(height: number, now: number): FitDecision {
    this.frameHeight = height;
    this.lastResizeAt = now;
    return { kind: 'resize', height };
  }
}

/** What a frame fitter needs from the page around it. */
export interface FitIO {
  contentHeight(): number;
  setFrameHeight(px: number): void;
  now(): number;
  /** Runs fn after ms milliseconds; returns a function that cancels it. */
  schedule(fn: () => void, ms: number): () => void;
  warn(message: string): void;
}

export interface FrameFitter {
  /** Call whenever the piece's content may have changed size. */
  onResize(): void;
  dispose(): void;
}

/** Fits a frame to its content with a FitTracker, including the delayed look a hold needs. */
export function createFrameFitter(initialFrameHeight: number, io: FitIO): FrameFitter {
  const tracker = new FitTracker(initialFrameHeight);
  let cancelRecheck: (() => void) | undefined;
  const step = () => {
    cancelRecheck?.();
    cancelRecheck = undefined;
    const decision = tracker.measure(io.contentHeight(), io.now());
    if (decision.kind === 'resize') io.setFrameHeight(decision.height);
    if (decision.kind === 'hold') cancelRecheck = io.schedule(step, decision.recheckInMs);
    if (decision.kind === 'stop') io.warn(decision.reason);
  };
  return {
    onResize: step,
    dispose: () => cancelRecheck?.(),
  };
}

/**
 * A screen frame fills the rest of the first screen below its top edge, which PieceFrame writes
 * to --piece-frame-top. It uses svh, not the window height, so phone toolbars sliding in and out
 * while the reader scrolls don't resize it. Before hydration, 200px stands in for the title block.
 */
export const SCREEN_HEIGHT = `max(${SCREEN_MIN_HEIGHT}px, calc(100svh - var(--piece-frame-top, 200px) - ${SCREEN_BOTTOM_GAP}px))`;
