import { createFrameFitter, FitTracker, SCREEN_HEIGHT } from '@/lib/design/frameFit';

describe('FitTracker', () => {
  /** Four growths 16ms apart, each right after the fit before it: the tracker ends up holding at 1165px. */
  function holdAt1165(tracker: FitTracker) {
    [1, 2, 3, 4].forEach((step) => tracker.measure(765 + step * 100, (step - 1) * 16));
  }

  it('resizes the frame to the content height, rounded up', () => {
    const tracker = new FitTracker(765);
    expect(tracker.measure(4095.2, 0)).toEqual({ kind: 'resize', height: 4096 });
  });

  it('keeps the frame when the content already fits', () => {
    const tracker = new FitTracker(765);
    tracker.measure(4096, 0);
    expect(tracker.measure(4096, 16)).toEqual({ kind: 'keep' });
  });

  it('shrinks the frame when the content gets shorter, such as a collapsed details element', () => {
    const tracker = new FitTracker(765);
    tracker.measure(4096, 0);
    expect(tracker.measure(3800, 400)).toEqual({ kind: 'resize', height: 3800 });
  });

  it('holds the frame still after three fits in a row that each made the page grow', () => {
    const tracker = new FitTracker(765);
    const kinds = [1, 2, 3, 4].map((step) => tracker.measure(765 + step * 100, (step - 1) * 16).kind);
    expect(kinds).toEqual(['resize', 'resize', 'resize', 'hold']);
  });

  it('stops when a held page stays still and then grows again with the frame', () => {
    const tracker = new FitTracker(765);
    holdAt1165(tracker);
    expect(tracker.measure(1165, 108)).toEqual({ kind: 'resize', height: 1165 });
    expect(tracker.measure(1265, 124).kind).toBe('stop');
  });

  it('goes back to fitting when a held page changes on its own, like an animation', () => {
    const tracker = new FitTracker(765);
    holdAt1165(tracker);
    expect(tracker.measure(1190, 64)).toEqual({ kind: 'resize', height: 1190 });
    expect(tracker.measure(1215, 80).kind).toBe('resize');
  });

  it('goes back to fitting when the probe shows the page stayed still', () => {
    const tracker = new FitTracker(765);
    holdAt1165(tracker);
    tracker.measure(1165, 108);
    expect(tracker.measure(1500, 5000)).toEqual({ kind: 'resize', height: 1500 });
  });

  it('still follows shrinks after it stops, but not growth', () => {
    const tracker = new FitTracker(765);
    holdAt1165(tracker);
    tracker.measure(1165, 108);
    tracker.measure(1265, 124);
    expect(tracker.measure(900, 2000)).toEqual({ kind: 'resize', height: 900 });
    expect(tracker.measure(5000, 2100)).toEqual({ kind: 'keep' });
  });
});

describe('createFrameFitter', () => {
  beforeEach(() => {
    // The page models below read time from 0.
    vi.useFakeTimers({ now: 0 });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /**
   * Fits a frame to a simulated page. The content height may depend on the frame height (a vh
   * hero) and on time (an animation). Like a ResizeObserver, a check every 16ms reports a change.
   */
  function simulate(content: (frame: number, now: number) => number, initialFrame = 765) {
    let frame = initialFrame;
    const measure = () => Math.ceil(content(frame, Date.now()));
    let observed = measure();
    const warnings: string[] = [];
    let resizes = 0;
    const fitter = createFrameFitter(initialFrame, {
      contentHeight: () => content(frame, Date.now()),
      setFrameHeight: (px) => {
        frame = px;
        resizes += 1;
      },
      now: () => Date.now(),
      schedule: (fn, ms) => {
        const id = setTimeout(fn, ms);
        return () => clearTimeout(id);
      },
      warn: (message) => warnings.push(message),
    });
    setInterval(() => {
      const next = measure();
      if (next !== observed) {
        observed = next;
        fitter.onResize();
      }
    }, 16);
    fitter.onResize();
    return {
      warnings,
      frame: () => frame,
      content: measure,
      resizes: () => resizes,
    };
  }

  it('stops on a page that grows with its frame, warns once, and leaves the frame scrollable', () => {
    const page = simulate((frame) => frame + 11_298);
    vi.advanceTimersByTime(2000);
    expect(page.warnings).toHaveLength(1);
    expect(page.content()).toBeGreaterThan(page.frame());
    expect(page.resizes()).toBeLessThan(10);
  });

  it('follows a height transition to the end without stopping', () => {
    const page = simulate((_frame, now) => 4000 + 25 * Math.min(Math.floor(now / 16), 25));
    vi.advanceTimersByTime(2000);
    expect(page.warnings).toEqual([]);
    expect(page.frame()).toBe(4625);
  });

  it('fits quick reflows that end while the frame is held, without stopping', () => {
    const page = simulate((_frame, now) => (now < 48 ? 4000 + 25 * Math.floor(now / 16) : 4075));
    vi.advanceTimersByTime(2000);
    expect(page.warnings).toEqual([]);
    expect(page.frame()).toBe(4075);
  });

  it('follows a window being dragged narrower and wider without stopping', () => {
    const page = simulate((_frame, now) => (now < 1500 ? 6000 + Math.round(400 * Math.sin(now / 50)) : 6200));
    vi.advanceTimersByTime(3000);
    expect(page.warnings).toEqual([]);
    expect(page.frame()).toBe(6200);
  });

  it('still shrinks a stopped frame to fit when the content collapses, with no empty band', () => {
    const page = simulate((frame, now) => Math.ceil(0.6 * frame) + (now < 1000 ? 6000 : 1000));
    vi.advanceTimersByTime(3000);
    expect(page.warnings).toHaveLength(1);
    expect(page.frame()).toBe(page.content());
  });
});

describe('SCREEN_HEIGHT', () => {
  it('fills the rest of the small viewport below the frame, never under 420px', () => {
    expect(SCREEN_HEIGHT).toBe('max(420px, calc(100svh - var(--piece-frame-top, 200px) - 24px))');
  });
});
