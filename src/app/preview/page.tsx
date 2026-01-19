import { getAllPosts } from '@/lib/mdx/utils';
import Link from 'next/link';

export default async function PreviewIndexPage() {
  const posts = await getAllPosts('preview');

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-start gap-3 mb-8">
        <h1 className="text-4xl font-bold">Preview</h1>
      </div>
      <div className="space-y-8">
        {posts.map((post) => (
          <article key={post.slug} className="border-b border-gray-200 pb-8">
            <Link
              href={`/preview/${post.slug}`}
              className="group block"
            >
              <h2 className="font-title text-2xl font-bold mb-2 group-hover:text-blue-600">
                {post.frontMatter.title}
              </h2>
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-2">
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
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
