import { getPostBySlug, ContentType } from '@/lib/mdx/utils';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { notFound } from 'next/navigation';
import MDXComponents from '@/components/mdx/MDXComponents';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { buildBlogPostingJsonLd, safeJsonLd } from '@/lib/jsonLd';

/**
 * Badge configuration per content type.
 * Blog posts have no badge; preview and archive posts display a labeled badge.
 */
const BADGE_CONFIG: Record<
  ContentType,
  { label: string; className: string } | null
> = {
  blog: null,
  preview: { label: 'Preview', className: 'preview-badge' },
  archive: { label: 'Archive', className: 'archive-badge' },
};

interface PostPageLayoutProps {
  slug: string;
  contentType: ContentType;
}

/**
 * Shared post rendering layout used by blog, preview, and archive routes.
 * Handles post fetching, badge display, and MDX rendering.
 */
export default async function PostPageLayout({
  slug,
  contentType,
}: PostPageLayoutProps) {
  const post = await getPostBySlug(slug, contentType);

  if (!post) {
    notFound();
  }

  const badge = BADGE_CONFIG[contentType];

  return (
    <>
      <article className="max-w-2xl mx-auto px-4 py-8">
        <header className="mb-6">
          <div className={badge ? 'flex items-start gap-3 mb-1.5' : 'mb-1.5'}>
            <h1 className="text-4xl font-bold">{post.frontMatter.title}</h1>
            {badge && (
              <span className={`${badge.className} mt-2`}>{badge.label}</span>
            )}
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-1.5">
            <time dateTime={post.frontMatter.date}>
              {new Date(post.frontMatter.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            <span>·</span>
            <span>{post.frontMatter.readingTime.text}</span>
            {post.frontMatter.location && (
              <>
                <span>·</span>
                <span>{post.frontMatter.location}</span>
              </>
            )}
          </div>
        </header>

        <div className="prose dark:prose-invert max-w-none">
          <MDXRemote
            source={post.content}
            components={MDXComponents}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [rehypeHighlight],
              },
            }}
          />
        </div>
      </article>
      {contentType === 'blog' && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: safeJsonLd(buildBlogPostingJsonLd(post)),
          }}
        />
      )}
    </>
  );
}
