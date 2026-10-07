import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import MDXComponents from '@/components/mdx/MDXComponents';
import PieceFrame from '@/components/PieceFrame';
import { pieceFileUrl } from '@/lib/design/assets';
import { formatPieceDate } from '@/lib/design/format';
import { pieceMetadata } from '@/lib/design/metadata';
import { getAllPieces, getPieceBySlug } from '@/lib/design/pieces';

type PiecePageProps = { params: Promise<{ slug: string }> };

const metaLink =
  'text-[color:var(--link-color)] hover:text-[color:var(--link-color-hover)] underline underline-offset-[3px] transition-colors';

export async function generateStaticParams() {
  return (await getAllPieces()).map((piece) => ({ slug: piece.slug }));
}

export async function generateMetadata({ params }: PiecePageProps): Promise<Metadata> {
  const piece = await getPieceBySlug((await params).slug);
  return piece ? pieceMetadata(piece) : { title: 'Piece Not Found' };
}

export default async function PiecePage({ params }: PiecePageProps) {
  const piece = await getPieceBySlug((await params).slug);
  if (!piece) notFound();

  const { title, date, layout } = piece.frontMatter;
  const file = pieceFileUrl(piece.slug);
  const hasNote = piece.note.length > 0;

  return (
    <>
      <header className="max-w-2xl mx-auto px-4 pt-8 mb-6">
        <h1 className="text-3xl font-bold mb-1.5">{title}</h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
          <time dateTime={date}>{formatPieceDate(date)}</time>
          {hasNote && (
            <>
              <span aria-hidden="true">·</span>
              <a href="#note" className={metaLink}>
                Note ↓
              </a>
            </>
          )}
          <span aria-hidden="true">·</span>
          {/* A plain link: the raw file is not a Next route. */}
          <a href={file} className={metaLink}>
            Full screen ↗
          </a>
        </div>
      </header>

      <PieceFrame src={file} title={title} layout={layout} />

      {hasNote && (
        <section id="note" className="max-w-2xl mx-auto px-4 mt-12">
          <h2 className="text-2xl font-bold mb-4">Note</h2>
          <div className="prose dark:prose-invert max-w-none">
            <MDXRemote
              source={piece.note}
              components={MDXComponents}
              options={{ mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeHighlight] } }}
            />
          </div>
        </section>
      )}
    </>
  );
}
