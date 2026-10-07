import { formatPieceDate } from '@/lib/design/format';

describe('formatPieceDate', () => {
  it('writes a YYYY-MM-DD date out in words', () => {
    expect(formatPieceDate('2026-10-06')).toBe('October 6, 2026');
  });

  it('keeps the day in time zones west of UTC', () => {
    expect(formatPieceDate('2026-01-01')).toBe('January 1, 2026');
  });
});
