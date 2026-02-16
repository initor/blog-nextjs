import type { Post } from '@/lib/mdx/utils';
import { blogConfig } from '@/config/blog';

/**
 * Builds a BlogPosting JSON-LD object for a given post.
 * Used to generate structured data that search engines consume for rich results.
 */
export function buildBlogPostingJsonLd(post: Post): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.frontMatter.title,
    datePublished: post.frontMatter.date,
    description: post.frontMatter.description ?? '',
    url: `${blogConfig.siteUrl}/blog/${post.slug}`,
    author: {
      '@type': 'Person',
      name: blogConfig.author.name,
      url: blogConfig.siteUrl,
    },
  };
}

/**
 * Serializes a JSON-LD object to a string safe for embedding in a <script> tag.
 * Replaces literal `<` with `\u003c` to prevent XSS via `</script>` injection.
 */
export function safeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
