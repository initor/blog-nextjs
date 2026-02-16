import { generateAtomFeed } from '@/lib/feed';
import { getAllPosts } from '@/lib/mdx/utils';
import { blogConfig } from '@/config/blog';

export const dynamic = 'force-static';

export async function GET() {
  const posts = await getAllPosts('blog');
  const xml = generateAtomFeed(posts, blogConfig);
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/atom+xml; charset=utf-8',
    },
  });
}
