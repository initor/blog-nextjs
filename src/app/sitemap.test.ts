const mockGetAllPosts = vi.fn();
const mockGetAllPieces = vi.fn();
vi.mock('@/lib/mdx/utils', () => ({ getAllPosts: (type: string) => mockGetAllPosts(type) }));
vi.mock('@/lib/design/pieces', () => ({ getAllPieces: () => mockGetAllPieces() }));
vi.mock('@/config/blog', () => ({ blogConfig: { siteUrl: 'https://waynewen.com' } }));

import sitemap from '@/app/sitemap';

describe('sitemap', () => {
  beforeEach(() => {
    mockGetAllPosts.mockResolvedValue([]);
    mockGetAllPieces.mockResolvedValue([
      { slug: 'rolling-update', frontMatter: { title: 'Rolling Update', date: '2026-10-05', layout: 'document' }, note: '' },
    ]);
  });

  it('lists the design index and every piece page, but not the raw files', async () => {
    const urls = (await sitemap()).map((entry) => entry.url);
    expect(urls).toContain('https://waynewen.com/design');
    expect(urls).toContain('https://waynewen.com/design/rolling-update');
    expect(urls.some((url) => url.endsWith('.html'))).toBe(false);
  });

  it('dates each piece page by its note', async () => {
    const entry = (await sitemap()).find((e) => e.url === 'https://waynewen.com/design/rolling-update');
    expect(entry?.lastModified).toEqual(new Date('2026-10-05'));
  });
});
