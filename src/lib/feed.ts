import type { Post } from '@/lib/mdx/utils';

/** Configuration for Atom feed generation (kept as parameter for testability). */
export interface FeedConfig {
  siteUrl: string;
  title: string;
  description: string;
  author: { name: string };
}

/**
 * Escapes XML special characters in a string.
 * Ampersand is replaced first to avoid double-escaping.
 */
export function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generates an Atom 1.0 feed XML string from posts and config.
 * Pure function -- no side effects, no imports of runtime config.
 */
export function generateAtomFeed(posts: Post[], config: FeedConfig): string {
  const { siteUrl, title, description, author } = config;

  const updatedDate =
    posts.length > 0
      ? new Date(
          Math.max(...posts.map((p) => new Date(p.frontMatter.date).getTime()))
        ).toISOString()
      : new Date().toISOString();

  const entries = posts
    .map((post) => {
      const postDate = new Date(post.frontMatter.date).toISOString();
      const summaryTag =
        post.frontMatter.description !== undefined
          ? `\n    <summary>${escapeXml(post.frontMatter.description)}</summary>`
          : '';

      return `  <entry>
    <id>${siteUrl}/blog/${post.slug}</id>
    <title>${escapeXml(post.frontMatter.title)}</title>
    <link rel="alternate" href="${siteUrl}/blog/${post.slug}"/>
    <updated>${postDate}</updated>
    <published>${postDate}</published>${summaryTag}
  </entry>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <id>${siteUrl}/</id>
  <title>${escapeXml(title)}</title>
  <subtitle>${escapeXml(description)}</subtitle>
  <updated>${updatedDate}</updated>
  <author>
    <name>${escapeXml(author.name)}</name>
  </author>
  <link rel="alternate" href="${siteUrl}"/>
  <link rel="self" href="${siteUrl}/feed.xml"/>
  <link rel="hub" href="https://pubsubhubbub.appspot.com/"/>
${entries}
</feed>`;
}
