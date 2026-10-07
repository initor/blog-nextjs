// @vitest-environment node
const mockGetPostBySlug = vi.fn();
const mockGetAllPosts = vi.fn();
vi.mock('@/lib/mdx/utils', () => ({
  getPostBySlug: (slug: string, contentType: string) => mockGetPostBySlug(slug, contentType),
  getAllPosts: (contentType: string) => mockGetAllPosts(contentType),
}));

vi.mock('@/config/blog', () => ({
  blogConfig: { siteUrl: 'https://waynewen.com', author: { name: 'Wayne Wen' } },
}));

import { GET, generateStaticParams } from '@/app/og/[type]/[slug]/route';

function request(type: string, slug: string) {
  return GET(new Request(`http://localhost/og/${type}/${slug}`), { params: Promise.resolve({ type, slug }) });
}

describe('og card route', () => {
  beforeEach(() => {
    mockGetAllPosts.mockImplementation(async (contentType: string) =>
      contentType === 'blog' ? [{ slug: 'the-pod-budget' }] : contentType === 'archive' ? [{ slug: 'old' }] : [],
    );
    mockGetPostBySlug.mockImplementation(async (slug: string) =>
      slug === 'the-pod-budget' ? { slug, content: '', frontMatter: { title: 'The Pod Budget Hidden in a Container Limit' } } : undefined,
    );
  });

  it('prerenders a card for every post of every content type', async () => {
    await expect(generateStaticParams()).resolves.toEqual([
      { type: 'blog', slug: 'the-pod-budget' },
      { type: 'archive', slug: 'old' },
    ]);
  });

  it('renders the card as a PNG', async () => {
    const response = await request('blog', 'the-pod-budget');
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('image/png');
    const signature = [...new Uint8Array(await response.arrayBuffer()).slice(0, 4)];
    expect(signature).toEqual([0x89, 0x50, 0x4e, 0x47]);
  });

  it('answers 404 for an unknown post or content type', async () => {
    expect((await request('blog', 'missing')).status).toBe(404);
    expect((await request('drafts', 'the-pod-budget')).status).toBe(404);
  });
});
