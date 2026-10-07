vi.mock('@/config/blog', () => ({
  blogConfig: {
    title: 'initial',
    siteUrl: 'https://waynewen.com',
    author: { name: 'Wayne Wen', twitter: '@w3ewen' },
    openGraph: { siteName: 'initial', locale: 'en_US' },
  },
}));

import { designIndexMetadata, pieceMetadata } from '@/lib/design/metadata';
import type { Piece } from '@/lib/design/pieces';

const piece: Piece = {
  slug: 'rolling-update',
  frontMatter: { title: 'Rolling Update', date: '2026-10-06', layout: 'document', description: 'Pods replaced one at a time.' },
  note: '',
};

describe('pieceMetadata', () => {
  const metadata = pieceMetadata(piece);

  it('titles the page and points the canonical URL at the piece page', () => {
    expect(metadata.title).toBe('Rolling Update | Design | initial');
    expect(metadata.description).toBe('Pods replaced one at a time.');
    expect(metadata.alternates?.canonical).toBe('/design/rolling-update');
  });

  it('uses the light thumbnail as the link preview image', () => {
    const image = 'https://waynewen.com/design/rolling-update/thumb-light.png';
    expect(metadata.openGraph?.images).toEqual([{ url: image, width: 2048, height: 1280, alt: 'Rolling Update' }]);
    expect(metadata.twitter?.images).toEqual([image]);
  });

  it('describes the piece as an article published on its date', () => {
    expect(metadata.openGraph).toMatchObject({
      type: 'article',
      publishedTime: '2026-10-06',
      url: 'https://waynewen.com/design/rolling-update',
    });
  });
});

describe('designIndexMetadata', () => {
  it('titles the index "Design | initial"', () => {
    expect(designIndexMetadata.title).toBe('Design | initial');
    expect(designIndexMetadata.alternates?.canonical).toBe('/design');
  });
});
