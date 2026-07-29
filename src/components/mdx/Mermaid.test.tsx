import {
  intrinsicWidthOf,
  fitsColumn,
  hasInventedHyphen,
  pickLayout,
  explainLayouts,
} from '@/components/mdx/Mermaid';

describe('intrinsicWidthOf', () => {
  it('reads the width out of a real mermaid viewBox with a negative origin', () => {
    const svg = '<svg id="x" width="100%" viewBox="-50 -10 1191 694" style="max-width: 1191px;">';
    expect(intrinsicWidthOf(svg)).toBe(1191);
  });

  it('reads fractional widths', () => {
    expect(intrinsicWidthOf('<svg viewBox="-103 -10 939.5 635">')).toBe(939.5);
  });

  it('tolerates comma separators and leading whitespace', () => {
    expect(intrinsicWidthOf('<svg viewBox=" 0,0,420,300">')).toBe(420);
  });

  it('is unaffected by a width attribute of "100%"', () => {
    // useMaxWidth makes width="100%", so the viewBox is the only real source.
    expect(intrinsicWidthOf('<svg width="100%" viewBox="0 0 598 889">')).toBe(598);
  });

  it('returns null when there is no viewBox to measure', () => {
    expect(intrinsicWidthOf('<svg width="600" height="400">')).toBeNull();
  });

  it('returns null for a degenerate zero width', () => {
    expect(intrinsicWidthOf('<svg viewBox="0 0 0 0">')).toBeNull();
  });
});

describe('fitsColumn', () => {
  it('accepts a diagram narrower than the column', () => {
    expect(fitsColumn(275, 326)).toBe(true);
  });

  it('rejects a diagram meaningfully wider than the column', () => {
    expect(fitsColumn(1191, 326)).toBe(false);
  });

  it('accepts a 2% overshoot rather than dropping a whole preset over a rounding error', () => {
    expect(fitsColumn(650, 640)).toBe(true);
  });

  it('rejects an overshoot beyond the tolerance', () => {
    expect(fitsColumn(700, 640)).toBe(false);
  });

  it('treats an unmeasured column as fitting, so a hidden container still renders', () => {
    expect(fitsColumn(1191, 0)).toBe(true);
  });
});

describe('hasInventedHyphen', () => {
  // Mermaid emits one <text> per wrapped line, all sharing a class. This mirrors
  // the real output; a fixture built from sibling tspans would pass a detector
  // that never fires on the real thing.
  const svgWith = (...lines: string[]) =>
    `<svg xmlns="http://www.w3.org/2000/svg">${lines
      .map((l) => `<text class="messageText"><tspan>${l}</tspan></text>`)
      .join('')}</svg>`;

  const CHART = [
    'sequenceDiagram',
    '    participant G as controller-tools',
    '    participant V as kube-openapi',
    '    M->>G: Maximum = 9223372036854775807',
    '    V->>V: Return 0x8000000000000000',
  ].join('\n');

  it('flags a hyphen mermaid invented inside a number', () => {
    // This is the case that made the post render its own subject wrong.
    expect(hasInventedHyphen(svgWith('9223372036854-', '775807'), CHART)).toBe(true);
  });

  it('flags a second hyphen appended next to one the author wrote', () => {
    expect(hasInventedHyphen(svgWith('controller--', 'tools'), CHART)).toBe(true);
  });

  it('flags a hyphen invented inside a word', () => {
    expect(hasInventedHyphen(svgWith('kube-open-', 'api'), CHART)).toBe(true);
  });

  it("allows a break at a hyphen the author wrote", () => {
    expect(hasInventedHyphen(svgWith('controller-', 'tools'), CHART)).toBe(false);
  });

  it('ignores wrapping that does not introduce a hyphen at all', () => {
    expect(hasInventedHyphen(svgWith('Maximum =', '9223372036854775807'), CHART)).toBe(false);
  });

  it('ignores a trailing hyphen on the last line, which broke nothing', () => {
    expect(hasInventedHyphen(svgWith('Return 0x8000000000000000-'), CHART)).toBe(false);
  });

  it('does not rejoin two lines belonging to different labels', () => {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg">' +
      '<text class="actor"><tspan>kube-open-</tspan></text>' +
      '<text class="messageText"><tspan>api</tspan></text></svg>';
    expect(hasInventedHyphen(svg, CHART)).toBe(false);
  });

  it('does not flag a split it cannot prove was invented', () => {
    expect(hasInventedHyphen(svgWith('some-', 'thing'), CHART)).toBe(false);
  });

  it('tolerates unparseable input rather than rejecting every layout', () => {
    expect(hasInventedHyphen('not svg at all', CHART)).toBe(false);
  });
});

describe('pickLayout', () => {
  const svgOf = (w: number, ...lines: string[]) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 ${w} 400">` +
    lines.map((l) => `<text class="messageText"><tspan>${l}</tspan></text>`).join('') +
    '</svg>';

  const CHART = 'sequenceDiagram\n    M->>G: Maximum = 9223372036854775807';

  // Widths mirror the real ladder for the-maximum-became-the-minimum.
  const LADDER = [1096, 800, 739, 651, 558, 484, 422];
  const clean = (i: number) => svgOf(LADDER[i], 'Maximum =', '9223372036854775807');
  // Presets from index 4 down corrupt the literal, exactly as measured.
  const maybeBroken = (i: number) =>
    i >= 4 ? svgOf(LADDER[i], '9223372036854-', '775807') : clean(i);

  it('picks the widest preset that fits, not the first one rendered', async () => {
    const out = await pickLayout(700, CHART, async (i) => clean(i));
    expect(intrinsicWidthOf(out!)).toBe(651);
  });

  it('stops rendering as soon as a preset fits', async () => {
    const seen: number[] = [];
    await pickLayout(1200, CHART, async (i) => {
      seen.push(i);
      return clean(i);
    });
    expect(seen).toEqual([0]);
  });

  it('refuses a narrower preset that would corrupt a token', async () => {
    // 484 and 422 both fit a 326px column better, but both hyphenate the number.
    const out = await pickLayout(326, CHART, async (i) => maybeBroken(i));
    expect(intrinsicWidthOf(out!)).toBe(651);
  });

  it('uses a narrow preset when it corrupts nothing', async () => {
    const out = await pickLayout(326, CHART, async (i) => clean(i));
    expect(intrinsicWidthOf(out!)).toBe(422);
  });

  it('falls back to a corrupting preset only when every preset corrupts', async () => {
    const out = await pickLayout(326, CHART, async (i) =>
      svgOf(LADDER[i], '9223372036854-', '775807')
    );
    expect(intrinsicWidthOf(out!)).toBe(422);
  });

  it('skips a preset mermaid rejects and keeps going', async () => {
    const out = await pickLayout(760, CHART, async (i) => {
      if (i === 2) throw new Error('mermaid blew up on this preset');
      return clean(i);
    });
    expect(intrinsicWidthOf(out!)).toBe(651);
  });

  it('returns null only when every preset fails', async () => {
    const out = await pickLayout(640, CHART, async () => {
      throw new Error('nope');
    });
    expect(out).toBeNull();
  });

  it('takes an unmeasurable render as-is instead of discarding it', async () => {
    const bare = '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"></svg>';
    const out = await pickLayout(640, CHART, async () => bare);
    expect(out).toBe(bare);
  });
});

describe('explainLayouts', () => {
  const CHART = 'sequenceDiagram\n    M->>G: Maximum = 9223372036854775807';
  const svgOf = (w: number, ...lines: string[]) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} 400">` +
    lines.map((l) => `<text class="messageText"><tspan>${l}</tspan></text>`).join('') +
    '</svg>';

  it('reports width and cleanliness for every preset, for diagnosis', async () => {
    const rows = await explainLayouts(CHART, async (i) =>
      i < 2
        ? svgOf(1000 - i * 100, '9223372036854775807')
        : svgOf(1000 - i * 100, '9223372036854-', '775807')
    );
    expect(rows).toHaveLength(7);
    expect(rows[0]).toEqual({ name: 'source', width: 1000, clean: true });
    expect(rows[1].clean).toBe(true);
    expect(rows.slice(2).every((r) => r.clean === false)).toBe(true);
  });

  it('marks a preset mermaid rejected rather than dropping the row', async () => {
    const rows = await explainLayouts(CHART, async () => {
      throw new Error('nope');
    });
    expect(rows).toHaveLength(7);
    expect(rows.every((r) => r.width === null && r.clean === false)).toBe(true);
  });
});
