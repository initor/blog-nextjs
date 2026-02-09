import { promises as fs } from 'fs';
import matter from 'gray-matter';
import { ZodError } from 'zod';

vi.mock('fs', () => {
  const mocked = {
    promises: {
      readdir: vi.fn(),
      readFile: vi.fn(),
    },
  };
  return { ...mocked, default: mocked };
});

vi.mock('gray-matter', () => ({
  default: vi.fn(),
}));

vi.mock('reading-time', () => ({
  default: vi.fn(() => ({
    text: '3 min read',
    minutes: 3,
    time: 180000,
    words: 600,
  })),
}));

// Import the module under test AFTER mocks are set up
// (vitest hoists vi.mock calls automatically, but import order matters for clarity)
import { getAllPosts, getPostBySlug } from '@/lib/mdx/utils';

describe('getAllPosts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns posts sorted by date (newest first)', async () => {
    vi.mocked(fs.readdir).mockResolvedValue([
      'post-a.mdx',
      'post-b.mdx',
    ] as unknown as Awaited<ReturnType<typeof fs.readdir>>);

    vi.mocked(fs.readFile)
      .mockResolvedValueOnce('---\ntitle: Post A\ndate: 2024-01-01\n---\nContent A' as unknown as Awaited<ReturnType<typeof fs.readFile>>)
      .mockResolvedValueOnce('---\ntitle: Post B\ndate: 2024-06-15\n---\nContent B' as unknown as Awaited<ReturnType<typeof fs.readFile>>);

    vi.mocked(matter)
      .mockReturnValueOnce({
        data: { title: 'Post A', date: '2024-01-01' },
        content: 'Content A',
      } as unknown as ReturnType<typeof matter>)
      .mockReturnValueOnce({
        data: { title: 'Post B', date: '2024-06-15' },
        content: 'Content B',
      } as unknown as ReturnType<typeof matter>);

    const posts = await getAllPosts();

    expect(posts).toHaveLength(2);
    expect(posts[0].frontMatter.title).toBe('Post B');
    expect(posts[0].frontMatter.date).toBe('2024-06-15');
    expect(posts[1].frontMatter.title).toBe('Post A');
    expect(posts[1].frontMatter.date).toBe('2024-01-01');
  });

  it('filters out non-MDX files', async () => {
    vi.mocked(fs.readdir).mockResolvedValue([
      'post.mdx',
      'readme.txt',
      '.DS_Store',
    ] as unknown as Awaited<ReturnType<typeof fs.readdir>>);

    vi.mocked(fs.readFile).mockResolvedValue(
      '---\ntitle: Post\ndate: 2024-01-01\n---\nContent' as unknown as Awaited<ReturnType<typeof fs.readFile>>
    );

    vi.mocked(matter).mockReturnValue({
      data: { title: 'Post', date: '2024-01-01' },
      content: 'Content',
    } as unknown as ReturnType<typeof matter>);

    const posts = await getAllPosts();

    expect(posts).toHaveLength(1);
    expect(posts[0].slug).toBe('post');
  });

  it('handles .md extension files', async () => {
    vi.mocked(fs.readdir).mockResolvedValue([
      'old-post.md',
    ] as unknown as Awaited<ReturnType<typeof fs.readdir>>);

    vi.mocked(fs.readFile).mockResolvedValue(
      '---\ntitle: Old Post\ndate: 2023-06-01\n---\nOld content' as unknown as Awaited<ReturnType<typeof fs.readFile>>
    );

    vi.mocked(matter).mockReturnValue({
      data: { title: 'Old Post', date: '2023-06-01' },
      content: 'Old content',
    } as unknown as ReturnType<typeof matter>);

    const posts = await getAllPosts();

    expect(posts).toHaveLength(1);
    expect(posts[0].slug).toBe('old-post');
  });

  it('returns empty array when no files exist', async () => {
    vi.mocked(fs.readdir).mockResolvedValue(
      [] as unknown as Awaited<ReturnType<typeof fs.readdir>>
    );

    const posts = await getAllPosts();

    expect(posts).toEqual([]);
  });

  it('defaults to blog content type', async () => {
    vi.mocked(fs.readdir).mockResolvedValue(
      [] as unknown as Awaited<ReturnType<typeof fs.readdir>>
    );

    await getAllPosts();

    expect(fs.readdir).toHaveBeenCalledWith(
      expect.stringContaining('/blog')
    );
  });

  it('respects contentType parameter', async () => {
    vi.mocked(fs.readdir).mockResolvedValue(
      [] as unknown as Awaited<ReturnType<typeof fs.readdir>>
    );

    await getAllPosts('preview');

    expect(fs.readdir).toHaveBeenCalledWith(
      expect.stringContaining('/preview')
    );
  });

  it('includes readingTime in frontMatter', async () => {
    vi.mocked(fs.readdir).mockResolvedValue([
      'post.mdx',
    ] as unknown as Awaited<ReturnType<typeof fs.readdir>>);

    vi.mocked(fs.readFile).mockResolvedValue(
      'source' as unknown as Awaited<ReturnType<typeof fs.readFile>>
    );

    vi.mocked(matter).mockReturnValue({
      data: { title: 'Post', date: '2024-01-01' },
      content: 'Content',
    } as unknown as ReturnType<typeof matter>);

    const posts = await getAllPosts();

    expect(posts[0].frontMatter.readingTime).toEqual({
      text: '3 min read',
      minutes: 3,
      time: 180000,
      words: 600,
    });
  });
});

describe('getPostBySlug', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns post for a valid slug', async () => {
    vi.mocked(fs.readFile).mockResolvedValue(
      '---\ntitle: My Post\ndate: 2024-03-15\n---\nPost content' as unknown as Awaited<ReturnType<typeof fs.readFile>>
    );

    vi.mocked(matter).mockReturnValue({
      data: { title: 'My Post', date: '2024-03-15' },
      content: 'Post content',
    } as unknown as ReturnType<typeof matter>);

    const post = await getPostBySlug('my-post');

    expect(post).toBeDefined();
    expect(post!.slug).toBe('my-post');
    expect(post!.frontMatter.title).toBe('My Post');
    expect(post!.frontMatter.date).toBe('2024-03-15');
    expect(post!.content).toBe('Post content');
  });

  it('returns undefined for a missing slug', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('ENOENT: no such file or directory') as NodeJS.ErrnoException;
    error.code = 'ENOENT';
    vi.mocked(fs.readFile).mockRejectedValue(error);

    const post = await getPostBySlug('nonexistent');

    expect(post).toBeUndefined();
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('re-throws ZodError on invalid frontmatter', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(fs.readFile).mockResolvedValue(
      'source' as unknown as Awaited<ReturnType<typeof fs.readFile>>
    );

    // Return frontmatter that will fail FrontmatterSchema.parse()
    // (empty title violates min(1) constraint)
    vi.mocked(matter).mockReturnValue({
      data: { title: '', date: '2024-01-01' },
      content: 'content',
    } as unknown as ReturnType<typeof matter>);

    await expect(getPostBySlug('bad-post')).rejects.toThrow(ZodError);
    consoleSpy.mockRestore();
  });

  it('defaults to blog content type', async () => {
    vi.mocked(fs.readFile).mockResolvedValue(
      'source' as unknown as Awaited<ReturnType<typeof fs.readFile>>
    );

    vi.mocked(matter).mockReturnValue({
      data: { title: 'Post', date: '2024-01-01' },
      content: 'Content',
    } as unknown as ReturnType<typeof matter>);

    await getPostBySlug('test-slug');

    expect(fs.readFile).toHaveBeenCalledWith(
      expect.stringContaining('/blog'),
      'utf8'
    );
  });

  it('respects contentType parameter', async () => {
    vi.mocked(fs.readFile).mockResolvedValue(
      'source' as unknown as Awaited<ReturnType<typeof fs.readFile>>
    );

    vi.mocked(matter).mockReturnValue({
      data: { title: 'Post', date: '2024-01-01' },
      content: 'Content',
    } as unknown as ReturnType<typeof matter>);

    await getPostBySlug('test-slug', 'archive');

    expect(fs.readFile).toHaveBeenCalledWith(
      expect.stringContaining('/archive'),
      'utf8'
    );
  });

  it('includes readingTime in the returned post', async () => {
    vi.mocked(fs.readFile).mockResolvedValue(
      'source' as unknown as Awaited<ReturnType<typeof fs.readFile>>
    );

    vi.mocked(matter).mockReturnValue({
      data: { title: 'Post', date: '2024-01-01' },
      content: 'Content',
    } as unknown as ReturnType<typeof matter>);

    const post = await getPostBySlug('test');

    expect(post!.frontMatter.readingTime).toEqual({
      text: '3 min read',
      minutes: 3,
      time: 180000,
      words: 600,
    });
  });

  it('does not log ENOENT errors to console', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('ENOENT: no such file or directory') as NodeJS.ErrnoException;
    error.code = 'ENOENT';
    vi.mocked(fs.readFile).mockRejectedValue(error);

    await getPostBySlug('nonexistent');

    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('logs unexpected errors with contentType/slug context', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(fs.readFile).mockRejectedValue(new Error('disk failure'));

    const result = await getPostBySlug('broken-post', 'preview');

    expect(result).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith(
      '[preview/broken-post] Unexpected error loading post:',
      expect.any(Error)
    );
    consoleSpy.mockRestore();
  });

  it('logs ZodError details with context before re-throwing', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(fs.readFile).mockResolvedValue(
      'source' as unknown as Awaited<ReturnType<typeof fs.readFile>>
    );
    vi.mocked(matter).mockReturnValue({
      data: { title: '', date: '2024-01-01' },
      content: 'content',
    } as unknown as ReturnType<typeof matter>);

    await expect(getPostBySlug('bad-post', 'blog')).rejects.toThrow(ZodError);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[blog/bad-post] Frontmatter validation failed:'),
      expect.any(String)
    );
    consoleSpy.mockRestore();
  });
});
