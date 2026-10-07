const mockGetPostBySlug = vi.fn();
vi.mock('@/lib/mdx/utils', () => ({
  getPostBySlug: (slug: string, contentType: string) => mockGetPostBySlug(slug, contentType),
  getAllPosts: vi.fn(),
}));

vi.mock('@/config/blog', () => ({
  blogConfig: {
    title: 'initial',
    siteUrl: 'https://waynewen.com',
    author: { name: 'Wayne Wen', twitter: '@w3ewen' },
    openGraph: { siteName: 'initial', locale: 'en_US' },
  },
}));

import { createGenerateMetadata } from '@/lib/mdx/metadata';

function post(frontMatter: Record<string, unknown> = {}) {
  return {
    slug: 'the-pod-budget',
    content: '',
    frontMatter: {
      title: 'The Pod Budget',
      date: '2026-08-01',
      tags: [],
      readingTime: { text: '3 min read', minutes: 3, time: 180000, words: 600 },
      ...frontMatter,
    },
  };
}

const params = Promise.resolve({ slug: 'the-pod-budget' });

describe('post metadata', () => {
  beforeEach(() => {
    mockGetPostBySlug.mockResolvedValue(post());
  });

  it("points og:image at the post's prerendered card", async () => {
    const metadata = await createGenerateMetadata('blog')({ params });
    expect(metadata.openGraph?.images).toEqual([
      { url: 'https://waynewen.com/og/blog/the-pod-budget', width: 1200, height: 630, alt: 'The Pod Budget' },
    ]);
  });

  it("uses the card for the post's own content type", async () => {
    const metadata = await createGenerateMetadata('preview')({ params });
    expect(JSON.stringify(metadata.openGraph?.images)).toContain('https://waynewen.com/og/preview/the-pod-budget');
  });

  it('keeps an ogImage set in frontmatter', async () => {
    mockGetPostBySlug.mockResolvedValue(post({ ogImage: 'https://example.com/card.png' }));
    const metadata = await createGenerateMetadata('blog')({ params });
    expect(JSON.stringify(metadata.openGraph?.images)).toContain('https://example.com/card.png');
  });
});
