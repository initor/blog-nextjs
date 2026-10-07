// @vitest-environment node
const mockGetAllPosts = vi.fn();
vi.mock('@/lib/mdx/utils', () => ({ getAllPosts: (contentType: string) => mockGetAllPosts(contentType) }));

import { GET } from '@/app/feed.xml/route';

describe('feed route', () => {
  it('links posts on www but keeps every id on the bare domain it was first published under', async () => {
    mockGetAllPosts.mockResolvedValue([
      { slug: 'one-second-29-days', content: '', frontMatter: { title: 'One Second, 29 Days', date: '2026-01-01' } },
    ]);
    const xml = await (await GET()).text();
    expect(xml).toContain('<id>https://waynewen.com/</id>');
    expect(xml).toContain('<id>https://waynewen.com/blog/one-second-29-days</id>');
    expect(xml).toContain('<link rel="alternate" href="https://www.waynewen.com/blog/one-second-29-days"/>');
  });
});
