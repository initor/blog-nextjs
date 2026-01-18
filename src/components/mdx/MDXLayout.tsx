import { ReactNode } from 'react';
import type { PostFrontMatter } from '@/lib/mdx/utils';

interface MDXLayoutProps {
  children: ReactNode;
  frontMatter: PostFrontMatter;
}

const MDXLayout = ({ children, frontMatter }: MDXLayoutProps) => {
  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-6">
        <div className="mb-1.5">
          <h1 className="text-4xl font-bold">{frontMatter.title}</h1>
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-1.5">
          <time dateTime={frontMatter.date}>
            {new Date(frontMatter.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </time>
          <span>·</span>
          <span>{frontMatter.readingTime.text}</span>
        </div>

        {frontMatter.description && (
          <p className="text-base text-gray-600 dark:text-gray-400 mb-1.5 leading-[1.55]">
            {frontMatter.description}
          </p>
        )}

        {frontMatter.tags && (
          <div className="flex flex-wrap gap-1.5">
            {frontMatter.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="prose dark:prose-invert max-w-none">
        {children}
      </div>
    </article>
  );
};

export default MDXLayout;
