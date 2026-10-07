import type { Metadata } from 'next';
import Link from 'next/link';
import PieceThumbnail from '@/components/PieceThumbnail';
import { pieceUrl } from '@/lib/design/assets';
import { formatPieceDate } from '@/lib/design/format';
import { designIndexMetadata } from '@/lib/design/metadata';
import { getAllPieces } from '@/lib/design/pieces';

export const metadata: Metadata = designIndexMetadata;

export default async function DesignIndexPage() {
  const pieces = await getAllPieces();

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-4xl font-bold mb-8">Design</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {pieces.map((piece) => (
          <Link key={piece.slug} href={pieceUrl(piece.slug)} className="group block">
            <PieceThumbnail
              slug={piece.slug}
              alt={piece.frontMatter.title}
              sizes="(min-width: 1056px) 496px, (min-width: 640px) 50vw, 100vw"
            />
            <h2 className="font-title text-xl font-bold mt-3 group-hover:text-blue-600">
              {piece.frontMatter.title}
            </h2>
            <time
              dateTime={piece.frontMatter.date}
              className="block text-sm text-gray-500 dark:text-gray-400 mt-1"
            >
              {formatPieceDate(piece.frontMatter.date)}
            </time>
          </Link>
        ))}
      </div>
    </div>
  );
}
