import type { Metadata } from 'next';
import { getPostBySlug, getAllPosts, ContentType } from '@/lib/mdx/utils';
import { blogConfig } from '@/config/blog';

/**
 * Labels appended to page titles per content type.
 * Blog posts have no extra label; preview and archive include their type.
 */
const CONTENT_TYPE_LABELS: Record<ContentType, string | null> = {
  blog: null,
  preview: 'Preview',
  archive: 'Archive',
};

/**
 * Factory that returns a `generateMetadata` function scoped to a content type.
 * Usage: `export const generateMetadata = createGenerateMetadata('blog');`
 */
export function createGenerateMetadata(contentType: ContentType) {
  return async function generateMetadata({
    params,
  }: {
    params: Promise<{ slug: string }>;
  }): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPostBySlug(slug, contentType);

    if (!post) {
      return { title: 'Post Not Found' };
    }

    const ogImage =
      post.frontMatter.ogImage ||
      `${blogConfig.siteUrl}/api/og?title=${post.frontMatter.title}`;

    const title = [
      post.frontMatter.title,
      CONTENT_TYPE_LABELS[contentType],
      blogConfig.title,
    ]
      .filter(Boolean)
      .join(' | ');

    return {
      title,
      description: post.frontMatter.description,
      authors: [{ name: blogConfig.author.name }],
      alternates: {
        canonical: `/${contentType}/${post.slug}`,
      },
      openGraph: {
        title: post.frontMatter.title,
        description: post.frontMatter.description,
        type: 'article',
        authors: [blogConfig.author.name],
        publishedTime: post.frontMatter.date,
        url: `${blogConfig.siteUrl}/${contentType}/${post.slug}`,
        siteName: blogConfig.openGraph.siteName,
        locale: blogConfig.openGraph.locale,
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: post.frontMatter.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: post.frontMatter.title,
        description: post.frontMatter.description,
        creator: blogConfig.author.twitter,
      },
    };
  };
}

/**
 * Factory that returns a `generateStaticParams` function scoped to a content type.
 * Usage: `export const generateStaticParams = createGenerateStaticParams('blog');`
 */
export function createGenerateStaticParams(contentType: ContentType) {
  return async function generateStaticParams() {
    const posts = await getAllPosts(contentType);
    return posts.map((post) => ({ slug: post.slug }));
  };
}
