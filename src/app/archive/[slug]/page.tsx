import { createGenerateMetadata, createGenerateStaticParams } from '@/lib/mdx/metadata';
import PostPageLayout from '@/components/PostPageLayout';

export const generateMetadata = createGenerateMetadata('archive');
export const generateStaticParams = createGenerateStaticParams('archive');

export default async function ArchivePostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PostPageLayout slug={slug} contentType="archive" />;
}
