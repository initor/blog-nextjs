import { render, screen } from '@testing-library/react';

// Mock all server-side dependencies at module level (hoisted by vitest)

const mockGetPostBySlug = vi.fn();
vi.mock('@/lib/mdx/utils', () => ({
  getPostBySlug: (...args: unknown[]) => mockGetPostBySlug(...args),
}));

vi.mock('next-mdx-remote/rsc', () => ({
  MDXRemote: ({ source }: { source: string }) => (
    <div data-testid="mdx-content">{source}</div>
  ),
}));

const mockNotFound = vi.fn();
vi.mock('next/navigation', () => ({
  notFound: () => {
    mockNotFound();
    throw new Error('NEXT_NOT_FOUND');
  },
}));

vi.mock('@/components/mdx/MDXComponents', () => ({
  default: {},
}));

vi.mock('remark-gfm', () => ({ default: {} }));
vi.mock('rehype-highlight', () => ({ default: {} }));

vi.mock('@/config/blog', () => ({
  blogConfig: {
    siteUrl: 'https://example.com',
    author: { name: 'Test Author' },
  },
}));

const mockPost = {
  frontMatter: {
    title: 'Test Post Title',
    date: '2024-01-15',
    tags: ['testing', 'vitest'],
    category: 'development',
    description: 'A test post',
    readingTime: { text: '3 min read', minutes: 3, time: 180000, words: 600 },
  },
  slug: 'test-post',
  content: '# Hello World',
};

describe('PostPageLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mockGetPostBySlug.mockResolvedValue(mockPost);
  });

  async function renderPostPageLayout(
    slug: string = 'test-post',
    contentType: 'blog' | 'preview' | 'archive' = 'blog',
  ) {
    const PostPageLayout = (await import('@/components/PostPageLayout')).default;
    const jsx = await PostPageLayout({ slug, contentType });
    return render(jsx);
  }

  it('renders post title', async () => {
    await renderPostPageLayout();
    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
  });

  it('renders formatted date', async () => {
    await renderPostPageLayout();
    // The date string '2024-01-15' is parsed by new Date() and formatted via
    // toLocaleDateString('en-US'). Match the actual rendered output from the
    // component rather than assuming a specific timezone interpretation.
    const timeElement = screen.getByRole('time');
    expect(timeElement).toBeInTheDocument();
    expect(timeElement).toHaveAttribute('datetime', '2024-01-15');
    // Verify the date text is a reasonable English format (month name + day + year)
    expect(timeElement.textContent).toMatch(/January \d{1,2}, 2024/);
  });

  it('renders reading time', async () => {
    await renderPostPageLayout();
    expect(screen.getByText('3 min read')).toBeInTheDocument();
  });

  it('renders MDX content area', async () => {
    await renderPostPageLayout();
    const mdxContent = screen.getByTestId('mdx-content');
    expect(mdxContent).toBeInTheDocument();
    expect(mdxContent).toHaveTextContent('# Hello World');
  });

  it('calls notFound when post is undefined', async () => {
    mockGetPostBySlug.mockResolvedValue(undefined);
    const PostPageLayout = (await import('@/components/PostPageLayout')).default;
    await expect(
      PostPageLayout({ slug: 'missing', contentType: 'blog' }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
    expect(mockNotFound).toHaveBeenCalled();
  });

  it('renders no badge for blog content type', async () => {
    await renderPostPageLayout('test-post', 'blog');
    expect(screen.queryByText('Preview')).not.toBeInTheDocument();
    expect(screen.queryByText('Archive')).not.toBeInTheDocument();
  });

  it('renders Preview badge for preview content type', async () => {
    await renderPostPageLayout('test-post', 'preview');
    expect(screen.getByText('Preview')).toBeInTheDocument();
  });

  it('renders Archive badge for archive content type', async () => {
    await renderPostPageLayout('test-post', 'archive');
    expect(screen.getByText('Archive')).toBeInTheDocument();
  });

  it('passes slug and contentType to getPostBySlug', async () => {
    await renderPostPageLayout('test-post', 'blog');
    expect(mockGetPostBySlug).toHaveBeenCalledWith('test-post', 'blog');
  });

  // JSON-LD structured data tests

  it('renders JSON-LD script tag for blog content type', async () => {
    const { container } = await renderPostPageLayout('test-post', 'blog');
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    // Parse the JSON-LD content (replace escaped sequences for parsing)
    const content = script!.textContent!.replace(/\\u003c/g, '<');
    const jsonLd = JSON.parse(content);
    expect(jsonLd['@type']).toBe('BlogPosting');
    expect(jsonLd.headline).toBe('Test Post Title');
  });

  it('does NOT render JSON-LD for preview content type', async () => {
    const { container } = await renderPostPageLayout('test-post', 'preview');
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).toBeNull();
  });

  it('does NOT render JSON-LD for archive content type', async () => {
    const { container } = await renderPostPageLayout('test-post', 'archive');
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).toBeNull();
  });

  it('JSON-LD output does not contain literal < characters', async () => {
    // Use a title that contains < to verify XSS safety
    const xssPost = {
      ...mockPost,
      frontMatter: {
        ...mockPost.frontMatter,
        title: 'Test</script><script>alert("xss")</script>',
      },
    };
    mockGetPostBySlug.mockResolvedValue(xssPost);
    const { container } = await renderPostPageLayout('test-post', 'blog');
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    // The raw textContent should not contain literal < (they should be escaped)
    expect(script!.innerHTML).not.toContain('<');
  });
});
