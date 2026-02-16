import { describe, it, expect, vi } from 'vitest';

vi.mock('@/config/blog', () => ({
  blogConfig: {
    siteUrl: 'https://example.com',
    author: { name: 'Test Author' },
  },
}));

import { buildBlogPostingJsonLd, safeJsonLd } from '@/lib/jsonLd';
import type { Post } from '@/lib/mdx/utils';

function makePost(overrides: Partial<Post['frontMatter']> = {}): Post {
  return {
    frontMatter: {
      title: 'My Test Post',
      date: '2024-06-15',
      tags: [],
      description: 'A description of the post',
      readingTime: { text: '2 min read', minutes: 2, time: 120000, words: 400 },
      ...overrides,
    },
    slug: 'my-test-post',
    content: '# Hello',
  };
}

describe('safeJsonLd', () => {
  it('escapes < characters to prevent XSS', () => {
    const data = { title: '</script><script>alert("xss")</script>' };
    const result = safeJsonLd(data);
    expect(result).not.toContain('<');
    expect(result).toContain('\\u003c');
  });

  it('returns valid JSON that round-trips correctly', () => {
    const data = { title: 'Test</script>', nested: { value: '<b>bold</b>' } };
    const serialized = safeJsonLd(data);
    // Replace escaped sequences back to verify round-trip
    const restored = serialized.replace(/\\u003c/g, '<');
    expect(JSON.parse(restored)).toEqual(data);
  });
});

describe('buildBlogPostingJsonLd', () => {
  it('returns correct @context and @type', () => {
    const result = buildBlogPostingJsonLd(makePost());
    expect(result['@context']).toBe('https://schema.org');
    expect(result['@type']).toBe('BlogPosting');
  });

  it('maps post fields to JSON-LD properties', () => {
    const post = makePost({ title: 'My Title', date: '2024-03-01', description: 'Desc' });
    const result = buildBlogPostingJsonLd(post);
    expect(result.headline).toBe('My Title');
    expect(result.datePublished).toBe('2024-03-01');
    expect(result.description).toBe('Desc');
  });

  it('uses empty string for description when post has no description', () => {
    const post = makePost({ description: undefined });
    const result = buildBlogPostingJsonLd(post);
    expect(result.description).toBe('');
  });

  it('constructs the correct URL using blogConfig.siteUrl + /blog/ + slug', () => {
    const post = makePost();
    const result = buildBlogPostingJsonLd(post);
    expect(result.url).toBe('https://example.com/blog/my-test-post');
  });

  it('includes author as Person with name and url', () => {
    const result = buildBlogPostingJsonLd(makePost());
    expect(result.author).toEqual({
      '@type': 'Person',
      name: 'Test Author',
      url: 'https://example.com',
    });
  });
});
