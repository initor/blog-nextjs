import { describe, it, expect, vi } from 'vitest';

vi.mock('@/config/blog', () => ({
  blogConfig: {
    siteUrl: 'https://example.com',
    title: 'Test Blog',
    description: 'A test blog',
    author: { name: 'Test Author' },
  },
}));

import { escapeXml, generateAtomFeed } from '@/lib/feed';
import type { Post } from '@/lib/mdx/utils';

function makePost(overrides: Partial<Post['frontMatter']> = {}, slug = 'my-test-post'): Post {
  return {
    frontMatter: {
      title: 'My Test Post',
      date: '2024-06-15',
      tags: [],
      description: 'A description of the post',
      readingTime: { text: '2 min read', minutes: 2, time: 120000, words: 400 },
      ...overrides,
    },
    slug,
    content: '# Hello',
  };
}

describe('escapeXml', () => {
  it('escapes ampersand', () => {
    expect(escapeXml('A & B')).toBe('A &amp; B');
  });

  it('escapes angle brackets', () => {
    expect(escapeXml('<script>')).toBe('&lt;script&gt;');
  });

  it('escapes quotes', () => {
    const result = escapeXml('"hello\'');
    expect(result).toContain('&quot;');
    expect(result).toContain('&apos;');
  });

  it('handles multiple special chars', () => {
    expect(escapeXml('Tom & Jerry <3')).toBe('Tom &amp; Jerry &lt;3');
  });

  it('passes through clean strings unchanged', () => {
    expect(escapeXml('Hello World')).toBe('Hello World');
  });
});

describe('generateAtomFeed', () => {
  const config = {
    siteUrl: 'https://example.com',
    title: 'Test Blog',
    description: 'A test blog',
    author: { name: 'Test Author' },
  };

  it('starts with XML declaration', () => {
    const result = generateAtomFeed([makePost()], config);
    expect(result).toContain('<?xml version="1.0" encoding="utf-8"?>');
  });

  it('contains Atom namespace', () => {
    const result = generateAtomFeed([makePost()], config);
    expect(result).toContain('<feed xmlns="http://www.w3.org/2005/Atom">');
  });

  it('contains feed ID from config', () => {
    const result = generateAtomFeed([makePost()], config);
    expect(result).toContain('<id>https://example.com/</id>');
  });

  it('contains feed title', () => {
    const result = generateAtomFeed([makePost()], config);
    expect(result).toContain('<title>Test Blog</title>');
  });

  it('contains subtitle', () => {
    const result = generateAtomFeed([makePost()], config);
    expect(result).toContain('<subtitle>A test blog</subtitle>');
  });

  it('contains author name', () => {
    const result = generateAtomFeed([makePost()], config);
    expect(result).toContain('<name>Test Author</name>');
  });

  it('contains alternate link', () => {
    const result = generateAtomFeed([makePost()], config);
    expect(result).toContain('<link rel="alternate" href="https://example.com"/>');
  });

  it('contains self link', () => {
    const result = generateAtomFeed([makePost()], config);
    expect(result).toContain('<link rel="self" href="https://example.com/feed.xml"/>');
  });

  it('contains WebSub hub link', () => {
    const result = generateAtomFeed([makePost()], config);
    expect(result).toContain('<link rel="hub" href="https://pubsubhubbub.appspot.com/"/>');
  });

  it('contains entry for each post', () => {
    const posts = [makePost({}, 'post-1'), makePost({}, 'post-2')];
    const result = generateAtomFeed(posts, config);
    const entries = result.match(/<entry>/g);
    expect(entries).toHaveLength(2);
  });

  it('entry has correct ID', () => {
    const result = generateAtomFeed([makePost()], config);
    expect(result).toContain('<id>https://example.com/blog/my-test-post</id>');
  });

  it('entry has escaped title', () => {
    const post = makePost({ title: 'React & Next.js' });
    const result = generateAtomFeed([post], config);
    expect(result).toContain('<title>React &amp; Next.js</title>');
  });

  it('entry has published and updated dates in ISO format', () => {
    const post = makePost({ date: '2024-06-15' });
    const result = generateAtomFeed([post], config);
    const isoDate = new Date('2024-06-15').toISOString();
    expect(result).toContain(`<published>${isoDate}</published>`);
    expect(result).toContain(`<updated>${isoDate}</updated>`);
  });

  it('entry has alternate link', () => {
    const result = generateAtomFeed([makePost()], config);
    expect(result).toContain('<link rel="alternate" href="https://example.com/blog/my-test-post"/>');
  });

  it('includes summary when description exists', () => {
    const post = makePost({ description: 'A great post' });
    const result = generateAtomFeed([post], config);
    expect(result).toContain('<summary>A great post</summary>');
  });

  it('omits summary when description is undefined', () => {
    const post = makePost({ description: undefined });
    const result = generateAtomFeed([post], config);
    // Should not have a <summary> inside the entry
    const entryMatch = result.match(/<entry>[\s\S]*?<\/entry>/);
    expect(entryMatch).not.toBeNull();
    expect(entryMatch![0]).not.toContain('<summary>');
  });

  it('feed updated date is from newest post', () => {
    const posts = [
      makePost({ date: '2024-01-01' }, 'old-post'),
      makePost({ date: '2024-12-25' }, 'new-post'),
    ];
    const result = generateAtomFeed(posts, config);
    const newestDate = new Date('2024-12-25').toISOString();
    // The feed-level <updated> should use the newest post date
    // Match the feed-level updated (before any <entry>)
    const feedSection = result.split('<entry>')[0];
    expect(feedSection).toContain(`<updated>${newestDate}</updated>`);
  });

  it('handles empty posts array', () => {
    const result = generateAtomFeed([], config);
    expect(result).not.toContain('<entry>');
    expect(result).toContain('<updated>');
  });
});
