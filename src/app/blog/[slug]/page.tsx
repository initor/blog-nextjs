import { createGenerateMetadata, createGenerateStaticParams } from '@/lib/mdx/metadata';
import PostPageLayout from '@/components/PostPageLayout';

export const generateMetadata = createGenerateMetadata('blog');
export const generateStaticParams = createGenerateStaticParams('blog');

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PostPageLayout slug={slug} contentType="blog" />;
}
