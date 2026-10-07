import { OG_HEIGHT, OG_WIDTH, ogHostLabel, ogImagePath, ogTitleSize } from '@/lib/og';

describe('ogImagePath', () => {
  it('serves each post its own card, by content type and slug', () => {
    expect(ogImagePath('blog', 'the-pod-budget')).toBe('/og/blog/the-pod-budget');
    expect(ogImagePath('preview', 'draft')).toBe('/og/preview/draft');
  });
});

describe('ogTitleSize', () => {
  it('keeps short titles large', () => {
    expect(ogTitleSize('The Maximum Became the Minimum')).toBe(76);
  });

  it('steps down for longer titles so they stay within three lines', () => {
    expect(ogTitleSize('The Pod Budget Hidden in a Container Limit')).toBe(64);
    expect(ogTitleSize('A'.repeat(90))).toBe(52);
  });
});

describe('ogHostLabel', () => {
  it('prints the bare domain, even when the site is served from www', () => {
    expect(ogHostLabel('https://www.waynewen.com')).toBe('waynewen.com');
    expect(ogHostLabel('https://waynewen.com')).toBe('waynewen.com');
  });
});

describe('card size', () => {
  it('is 1200 by 630, the size Open Graph and X expect', () => {
    expect([OG_WIDTH, OG_HEIGHT]).toEqual([1200, 630]);
  });
});
