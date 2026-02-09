import { createGenerateMetadata, createGenerateStaticParams } from '@/lib/mdx/metadata';
import PostPageLayout from '@/components/PostPageLayout';

export const generateMetadata = createGenerateMetadata('preview');
export const generateStaticParams = createGenerateStaticParams('preview');

export default async function PreviewPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PostPageLayout slug={slug} contentType="preview" />;
}
