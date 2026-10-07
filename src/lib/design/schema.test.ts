import { PieceFrontmatterSchema, SLUG_PATTERN } from '@/lib/design/schema';

describe('PieceFrontmatterSchema', () => {
  const valid = { title: 'Rolling Update', date: '2026-10-05', layout: 'document' };

  it('parses the required fields', () => {
    expect(PieceFrontmatterSchema.parse(valid)).toEqual(valid);
  });

  it('keeps an optional description', () => {
    const parsed = PieceFrontmatterSchema.parse({ ...valid, description: 'Pods replaced one at a time.' });
    expect(parsed.description).toBe('Pods replaced one at a time.');
  });

  it('accepts an unquoted YAML date, which gray-matter hands over as a Date', () => {
    const parsed = PieceFrontmatterSchema.parse({ ...valid, date: new Date('2026-10-05T00:00:00Z') });
    expect(parsed.date).toBe('2026-10-05');
  });

  it.each(['title', 'date', 'layout'])('rejects a missing %s', (field) => {
    const input: Record<string, unknown> = { ...valid };
    delete input[field];
    expect(PieceFrontmatterSchema.safeParse(input).success).toBe(false);
  });

  it('rejects a layout other than document or screen', () => {
    expect(PieceFrontmatterSchema.safeParse({ ...valid, layout: 'gallery' }).success).toBe(false);
  });

  it.each(['2026-13-45', '2026-02-30', '2026-00-10'])('rejects the impossible date %s', (date) => {
    expect(PieceFrontmatterSchema.safeParse({ ...valid, date }).success).toBe(false);
  });

  it('rejects an unquoted YAML timestamp, which is more than a date', () => {
    const date = new Date('2026-10-06T23:30:00-08:00');
    expect(PieceFrontmatterSchema.safeParse({ ...valid, date }).success).toBe(false);
  });

  it('rejects a date that is not YYYY-MM-DD', () => {
    expect(PieceFrontmatterSchema.safeParse({ ...valid, date: 'October 5, 2026' }).success).toBe(false);
  });
});

describe('SLUG_PATTERN', () => {
  it.each(['request-path', 'pod-budget-2026-04-06', 'h200'])('accepts %s', (slug) => {
    expect(SLUG_PATTERN.test(slug)).toBe(true);
  });

  it.each(['Pod-Network', 'pod network', 'pod--network', '-pod', 'pod_network', ''])('rejects "%s"', (slug) => {
    expect(SLUG_PATTERN.test(slug)).toBe(false);
  });
});
