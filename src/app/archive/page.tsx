import { getAllPosts } from '@/lib/mdx/utils';
import Link from 'next/link';

export default async function ArchiveIndexPage() {
  const posts = await getAllPosts('archive');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-start gap-3 mb-8">
        <h1 className="text-4xl font-bold">Archive</h1>
      </div>
      <div className="space-y-8">
        {posts.map((post) => (
          <article key={post.slug} className="border-b border-gray-200 pb-8">
            <Link
              href={`/archive/${post.slug}`}
              className="group block"
            >
              <h2 className="font-title text-2xl font-bold mb-2 group-hover:text-blue-600">
                {post.frontMatter.title}
              </h2>
              <div className="flex items-center gap-4 text-gray-600 mb-2">
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
              {post.frontMatter.description && (
                <p className="text-gray-600">
                  {post.frontMatter.description}
                </p>
              )}
            </Link>
            {post.frontMatter.tags && (
              <div className="flex gap-2 mt-4">
                {post.frontMatter.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
