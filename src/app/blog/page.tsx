import { getAllPosts } from '@/lib/mdx/utils';
import Link from 'next/link';
import Pagination from '@/components/Pagination';

const POSTS_PER_PAGE = 5;

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const posts = await getAllPosts();
  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);

  const params = await searchParams;
  const parsed = parseInt(params.page ?? '1', 10);
  const currentPage = Math.max(1, Math.min(Number.isNaN(parsed) ? 1 : parsed, totalPages));

  const start = (currentPage - 1) * POSTS_PER_PAGE;
  const paginatedPosts = posts.slice(start, start + POSTS_PER_PAGE);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Posts</h1>
      <div className="space-y-8">
        {paginatedPosts.map((post) => (
          <article key={post.slug} className="border-b border-gray-200 pb-8">
            <Link
              href={`/blog/${post.slug}`}
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
      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/blog" />
      )}
    </div>
  );
}
