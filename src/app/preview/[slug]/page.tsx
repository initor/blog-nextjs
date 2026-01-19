import { getPostBySlug, getAllPosts } from '@/lib/mdx/utils';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { notFound } from 'next/navigation';
import MDXComponents from '@/components/mdx/MDXComponents';
import type { Metadata } from 'next';
import { blogConfig } from '@/config/blog';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

interface PreviewPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: PreviewPostPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await getPostBySlug(resolvedParams.slug, 'preview');

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  const ogImage = post.frontMatter.ogImage || `${blogConfig.siteUrl}/api/og?title=${post.frontMatter.title}`;

  return {
    title: `${post.frontMatter.title} | Preview | ${blogConfig.title}`,
    description: post.frontMatter.description,
    authors: [{ name: blogConfig.author.name }],
    openGraph: {
      title: post.frontMatter.title,
      description: post.frontMatter.description,
      type: 'article',
      authors: [blogConfig.author.name],
      publishedTime: post.frontMatter.date,
      url: `${blogConfig.siteUrl}/preview/${post.slug}`,
      siteName: blogConfig.openGraph.siteName,
      locale: blogConfig.openGraph.locale,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.frontMatter.title,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.frontMatter.title,
      description: post.frontMatter.description,
      creator: blogConfig.author.twitter,
    },
  };
}

export async function generateStaticParams() {
  const posts = await getAllPosts('preview');
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function PreviewPostPage({
  params,
}: PreviewPostPageProps) {
  const resolvedParams = await params;
  const post = await getPostBySlug(resolvedParams.slug, 'preview');

  if (!post) {
    notFound();
  }

  return (
    <article className="max-w-2xl mx-auto px-4 py-8">
      <header className="mb-6">
        <div className="flex items-start gap-3 mb-1.5">
          <h1 className="text-4xl font-bold">{post.frontMatter.title}</h1>
          <span className="preview-badge mt-2">Preview</span>
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-1.5">
          <time dateTime={post.frontMatter.date}>
            {new Date(post.frontMatter.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </time>
          <span>·</span>
          <span>{post.frontMatter.readingTime.text}</span>
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
  );
}
