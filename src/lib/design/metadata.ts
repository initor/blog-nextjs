import type { Metadata } from 'next';
import { blogConfig } from '@/config/blog';
import { THUMB_HEIGHT, THUMB_WIDTH, pieceThumbUrl, pieceUrl } from './assets';
import type { Piece } from './pieces';

export const designIndexMetadata: Metadata = {
  title: ['Design', blogConfig.title].join(' | '),
  alternates: { canonical: '/design' },
};

export function pieceMetadata(piece: Piece): Metadata {
  const { title, description, date } = piece.frontMatter;
  const url = `${blogConfig.siteUrl}${pieceUrl(piece.slug)}`;
  const image = `${blogConfig.siteUrl}${pieceThumbUrl(piece.slug, 'light')}`;
  return {
    title: [title, 'Design', blogConfig.title].join(' | '),
    description,
    authors: [{ name: blogConfig.author.name }],
    alternates: { canonical: pieceUrl(piece.slug) },
    openGraph: {
      title,
      description,
      type: 'article',
      authors: [blogConfig.author.name],
      publishedTime: date,
      url,
      siteName: blogConfig.openGraph.siteName,
      locale: blogConfig.openGraph.locale,
      images: [{ url: image, width: THUMB_WIDTH, height: THUMB_HEIGHT, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: blogConfig.author.twitter,
      images: [image],
    },
  };
}
