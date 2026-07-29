'use client';

import { useEffect, useRef, useState } from 'react';

interface MermaidProps {
  chart: string;
}

// Helper to read CSS variable value
function getCSSVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/* Responsive sizing
   ------------------
   A sequence diagram has an intrinsic width set by its participants and labels.
   The maximum post is 1191px wide against a 326px column on a 390px phone, so
   neither obvious strategy works alone: scaling it to fit puts the text at
   5.5px, and pinning it to source size hides 73% of it behind a horizontal
   scroll.

   Tightening spacing barely helps, because width is dominated by label text and
   not by gaps: with wrapping off, the widest diagram only comes down from 1096px
   to 854px. Wrapping is what actually collapses it, to 379px. But mermaid wraps
   by hard-breaking mid-token and inserting a hyphen, which turned
   9223372036854775807 into "922337203685-4775807" in a post whose whole subject
   is that exact integer. Zooming can fix text that is too small; it cannot
   un-hyphenate a number.

   So we wrap, but only as far as the text allows. Each preset below caps the
   wrap width; a preset is discarded outright if it made mermaid invent a hyphen
   inside a token. Among the survivors we take the widest that fits the column,
   or the narrowest overall when none fit, which is the largest on-screen text
   the diagram can reach without corrupting its own labels. Where that floor
   lands is a property of the chart: charts with short labels reach 20px on a
   phone, and the maximum post bottoms out around 10px because it contains four
   unbreakable 18-to-19 character literals. */

/** Sequence layout presets, widest first. `width` caps how far text may wrap. */
const LAYOUTS: ReadonlyArray<{ name: string; sequence: Record<string, unknown> }> = [
  { name: 'source', sequence: {} },
  { name: 'w190', sequence: { width: 190, actorMargin: 24, boxMargin: 10, noteMargin: 10, messageMargin: 32, diagramMarginX: 20, wrap: true } },
  { name: 'w165', sequence: { width: 165, actorMargin: 18, boxMargin: 8, noteMargin: 8, messageMargin: 28, diagramMarginX: 16, wrap: true } },
  { name: 'w145', sequence: { width: 145, actorMargin: 12, boxMargin: 8, noteMargin: 8, messageMargin: 26, diagramMarginX: 12, wrap: true } },
  { name: 'w125', sequence: { width: 125, actorMargin: 8, boxMargin: 6, noteMargin: 6, messageMargin: 24, diagramMarginX: 10, wrap: true } },
  { name: 'w105', sequence: { width: 105, actorMargin: 5, boxMargin: 5, noteMargin: 5, messageMargin: 22, diagramMarginX: 8, wrap: true } },
  { name: 'w90', sequence: { width: 90, actorMargin: 3, boxMargin: 4, noteMargin: 4, messageMargin: 20, diagramMarginX: 6, wrap: true } },
];

/** How far a preset may exceed the column and still count as fitting. Two percent
 *  costs two percent of text size, and avoids discarding a well-proportioned
 *  layout in favour of a much tighter one over a rounding error. */
const FIT_TOLERANCE = 1.02;

/** Intrinsic width of a rendered diagram, read from its viewBox. Mermaid always
 *  emits one, and it is authoritative even when width is the string "100%". */
export function intrinsicWidthOf(svg: string): number | null {
  const m = svg.match(/viewBox="\s*([-\d.]+)[ ,]+([-\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)/);
  if (!m) return null;
  const w = Number.parseFloat(m[3]);
  return Number.isFinite(w) && w > 0 ? w : null;
}

/** Whether a diagram of this intrinsic width renders in this column unscaled. */
export function fitsColumn(intrinsicWidth: number, columnWidth: number): boolean {
  if (columnWidth <= 0) return true;
  return intrinsicWidth <= columnWidth * FIT_TOLERANCE;
}

/**
 * Whether mermaid split a token by inventing a hyphen that is not in the source.
 *
 * Wrapping at a hyphen the author wrote is fine: "controller-" / "tools" reads
 * correctly. Wrapping mid-token is not: "9223372036854-" / "775807" reads as a
 * different number. The two are told apart by rejoining the pair and asking
 * which form the chart actually contains. Only a provably invented hyphen
 * counts, so an unrecognised split never costs us a usable layout.
 *
 * Note that mermaid emits each wrapped line as its own <text> element rather
 * than as sibling <tspan>s, so the comparison has to be across elements in
 * document order. Looking inside a single <text> finds nothing.
 */
export function hasInventedHyphen(svg: string, chart: string): boolean {
  if (typeof DOMParser === 'undefined') return false;

  let doc: Document;
  try {
    doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
  } catch {
    return false;
  }

  const source = chart.replace(/\s+/g, '');
  const squash = (s: string) => s.replace(/\s+/g, '');

  // One entry per rendered line, in document order, tagged with its owner so we
  // never rejoin two labels that merely happen to be adjacent.
  const lines: Array<{ text: string; group: string }> = [];
  for (const el of Array.from(doc.querySelectorAll('text'))) {
    const group = el.getAttribute('class') ?? '';
    const spans = Array.from(el.querySelectorAll('tspan'));
    if (spans.length > 1) {
      for (const s of spans) {
        const t = (s.textContent ?? '').trim();
        if (t) lines.push({ text: t, group });
      }
    } else {
      const t = (el.textContent ?? '').trim();
      if (t) lines.push({ text: t, group });
    }
  }

  for (let i = 0; i < lines.length - 1; i++) {
    const head = lines[i];
    const tail = lines[i + 1];
    if (head.group !== tail.group) continue;
    // One or more trailing hyphens: mermaid appends its own even when the token
    // already ends in one, which is how "controller-tools" becomes "controller--".
    if (!/[A-Za-z0-9]-+$/.test(head.text)) continue;

    if (source.includes(squash(head.text + tail.text))) continue; // author's hyphen
    if (source.includes(squash(head.text.slice(0, -1) + tail.text))) return true;
  }

  return false;
}

/**
 * Render through the presets widest-first, discarding any that corrupt a token,
 * and keep the widest survivor that fits the column. When none fit, the
 * narrowest survivor is the largest the text can be drawn without breaking it.
 * Only if every preset corrupts something do we fall back to the narrowest
 * render, which is still better than showing nothing.
 */
export async function pickLayout(
  columnWidth: number,
  chart: string,
  renderWith: (layoutIndex: number) => Promise<string>
): Promise<string | null> {
  let narrowestClean: string | null = null;
  let narrowestAny: string | null = null;

  for (let i = 0; i < LAYOUTS.length; i++) {
    let svg: string;
    try {
      svg = await renderWith(i);
    } catch {
      continue; // a preset that mermaid rejects is not a reason to give up
    }
    narrowestAny = svg;

    if (hasInventedHyphen(svg, chart)) continue;

    const width = intrinsicWidthOf(svg);
    if (width === null) return svg; // cannot measure it, so take it as-is
    if (fitsColumn(width, columnWidth)) return svg;
    narrowestClean = svg;
  }

  return narrowestClean ?? narrowestAny;
}

/** Diagnostic: which presets a chart can use, and what each one costs. */
export async function explainLayouts(
  chart: string,
  renderWith: (layoutIndex: number) => Promise<string>
): Promise<Array<{ name: string; width: number | null; clean: boolean }>> {
  const rows = [];
  for (let i = 0; i < LAYOUTS.length; i++) {
    try {
      const svg = await renderWith(i);
      rows.push({
        name: LAYOUTS[i].name,
        width: intrinsicWidthOf(svg),
        clean: !hasInventedHyphen(svg, chart),
      });
    } catch {
      rows.push({ name: LAYOUTS[i].name, width: null, clean: false });
    }
  }
  return rows;
}

/** Serialises every mermaid render in the page.
 *
 *  mermaid's sequence renderer keeps its options in a module-level `conf` that
 *  draw() reassigns on entry and then reads again after a dozen awaits, right
 *  down to the viewBox computation. Two renders in flight at once therefore lay
 *  out against each other's spacing, and the width we measure gets attributed to
 *  the wrong preset. That is not hypothetical here: the preset ladder is the
 *  whole mechanism, and two diagrams on one page would be enough. Queueing costs
 *  nothing, since a render is a few milliseconds and happens once per resize. */
let renderQueue: Promise<unknown> = Promise.resolve();

function serialized<T>(task: () => Promise<T>): Promise<T> {
  const run = renderQueue.then(task, task);
  // Keep the chain alive even when a preset throws, so one bad render cannot
  // wedge every diagram that comes after it.
  renderQueue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}

export default function Mermaid({ chart }: MermaidProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  // Column width the current SVG was chosen for, so resizes that cannot change
  // the outcome do not trigger a re-render.
  const renderedForRef = useRef<number>(-1);

  useEffect(() => {
    let cancelled = false;
    let frame = 0;
    const container = containerRef.current;
    if (!container) return;

    const renderChart = async (columnWidth: number) => {
      // Claim the width before the first await. The ResizeObserver fires as soon
      // as the SVG changes the container's height, which is well before an async
      // render finishes, and without this claim that fire sees no recorded width
      // and starts the whole preset ladder a second time.
      renderedForRef.current = columnWidth;
      try {
        const mermaid = (await import('mermaid')).default;

        // Read Catppuccin Frappé colors from CSS variables
        // Fill colors should match their borders but with lower saturation
        const themeVariables = {
          // Primary: blue tones - fill matches border
          primaryColor: getCSSVar('--mermaid-primary-fill'),
          primaryTextColor: getCSSVar('--mermaid-primary-text'),
          primaryBorderColor: getCSSVar('--mermaid-primary'),
          // Secondary: purple tones - fill matches border
          secondaryColor: getCSSVar('--mermaid-secondary-fill'),
          secondaryTextColor: getCSSVar('--mermaid-secondary-text'),
          secondaryBorderColor: getCSSVar('--mermaid-secondary'),
          // Tertiary: pink tones - fill matches border
          tertiaryColor: getCSSVar('--mermaid-tertiary-fill'),
          tertiaryTextColor: getCSSVar('--mermaid-primary-text'),
          tertiaryBorderColor: getCSSVar('--mermaid-tertiary'),
          lineColor: getCSSVar('--mermaid-line'),
          textColor: getCSSVar('--mermaid-primary-text'),
          mainBkg: getCSSVar('--mermaid-node-bg'),
          background: getCSSVar('--mermaid-bg'),
          nodeBorder: getCSSVar('--mermaid-node-border'),
          clusterBkg: getCSSVar('--mermaid-node-bg'),
          clusterBorder: getCSSVar('--mermaid-node-border'),
          titleColor: getCSSVar('--mermaid-primary-text'),
          edgeLabelBackground: getCSSVar('--mermaid-bg'),
          // Sequence diagram specific
          actorBkg: getCSSVar('--mermaid-actor-bg'),
          actorBorder: getCSSVar('--mermaid-actor-border'),
          actorTextColor: getCSSVar('--mermaid-primary-text'),
          actorLineColor: getCSSVar('--mermaid-line'),
          signalColor: getCSSVar('--mermaid-line'),
          signalTextColor: getCSSVar('--mermaid-primary-text'),
          labelBoxBkgColor: getCSSVar('--mermaid-node-bg'),
          labelBoxBorderColor: getCSSVar('--mermaid-node-border'),
          labelTextColor: getCSSVar('--mermaid-primary-text'),
          loopTextColor: getCSSVar('--mermaid-primary-text'),
          noteBkgColor: getCSSVar('--mermaid-note-bg'),
          noteBorderColor: getCSSVar('--mermaid-note-border'),
          noteTextColor: getCSSVar('--mermaid-primary-text'),
          activationBkgColor: getCSSVar('--mermaid-primary-fill'),
          activationBorderColor: getCSSVar('--mermaid-primary'),
          sequenceNumberColor: getCSSVar('--mermaid-bg'),
          // Error/critical styling (for :::error class)
          errorBkgColor: getCSSVar('--mermaid-error-fill'),
          errorTextColor: getCSSVar('--mermaid-primary-text'),
        };

        const seed = Math.random().toString(36).slice(2, 11);

        const renderPreset = (i: number, id: string) =>
          serialized(async () => {
            mermaid.initialize({
              startOnLoad: false,
              theme: 'base',
              themeVariables,
              securityLevel: 'loose',
              fontFamily: 'inherit',
              // useMaxWidth lets the SVG scale down into its column instead of
              // overflowing it. The presets are what keep that scaling legible.
              sequence: { useMaxWidth: true, ...LAYOUTS[i].sequence },
              flowchart: { useMaxWidth: true },
            });
            const { svg: out } = await mermaid.render(id, chart);
            return out;
          });

        const next = await pickLayout(columnWidth, chart, (i) =>
          renderPreset(i, `mermaid-${seed}-${i}`)
        );

        if (cancelled) return;
        if (next === null) {
          setError('Failed to render diagram');
          return;
        }
        if (typeof window !== 'undefined' && window.location.search.includes('diagramDebug')) {
          console.log(
            'mermaid layouts',
            columnWidth,
            JSON.stringify(await explainLayouts(chart, (i) => renderPreset(i, `dbg-${seed}-${i}`)))
          );
        }
        renderedForRef.current = columnWidth;
        setSvg(next);
        setError(null);
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        if (!cancelled) setError('Failed to render diagram');
      }
    };

    void renderChart(container.clientWidth);

    // Re-pick the preset when the column changes width enough to matter, so
    // rotating a phone or resizing a window lands on the right one.
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const width = container.clientWidth;
        if (width <= 0) return;
        const last = renderedForRef.current;
        // A resize can only change the outcome if it crosses a preset boundary.
        if (last > 0 && Math.abs(width - last) / last < 0.02) return;
        void renderChart(width);
      });
    });
    observer.observe(container);

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [chart]);

  if (error) {
    return (
      <div className="p-4 my-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
        {error}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="mermaid-diagram my-6"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
