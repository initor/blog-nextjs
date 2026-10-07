import { readFile } from 'fs/promises';
import path from 'path';
import { ImageResponse } from 'next/og';
import { blogConfig } from '@/config/blog';
import { getAllPosts, getPostBySlug, type ContentType } from '@/lib/mdx/utils';
import { OG_HEIGHT, OG_WIDTH, ogHostLabel, ogTitleSize } from '@/lib/og';

const CONTENT_TYPES: ContentType[] = ['blog', 'preview', 'archive'];

// One card per post, rendered at build time. Unknown paths are a 404, not a render.
export const dynamic = 'force-static';
export const dynamicParams = false;

export async function generateStaticParams() {
  const perType = await Promise.all(
    CONTENT_TYPES.map(async (type) => (await getAllPosts(type)).map((post) => ({ type, slug: post.slug }))),
  );
  return perType.flat();
}

function font(file: string) {
  return readFile(path.join(process.cwd(), 'src/fonts', file));
}

export async function GET(_request: Request, { params }: { params: Promise<{ type: string; slug: string }> }) {
  const { type, slug } = await params;
  const contentType = CONTENT_TYPES.find((candidate) => candidate === type);
  const post = contentType ? await getPostBySlug(slug, contentType) : undefined;
  if (!post) return new Response('Not found', { status: 404 });

  const { title } = post.frontMatter;
  const [plexSerifBold, atkinsonRegular, atkinsonBold] = await Promise.all([
    font('IBMPlexSerif-Bold.ttf'),
    font('Atkinson-Hyperlegible-Regular-102.ttf'),
    font('Atkinson-Hyperlegible-Bold-102.ttf'),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '84px 96px',
          background: '#ffffff',
          color: '#171717',
        }}
      >
        <div style={{ width: 72, height: 6, borderRadius: 3, background: '#7287fd' }} />
        <div
          style={{
            display: 'flex',
            maxWidth: 1000,
            fontFamily: 'IBM Plex Serif',
            fontWeight: 700,
            fontSize: ogTitleSize(title),
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', fontFamily: 'Atkinson Hyperlegible', fontSize: 30, color: '#6b7280' }}>
          <span style={{ fontWeight: 700, color: '#171717' }}>{blogConfig.author.name}</span>
          <span style={{ margin: '0 16px' }}>·</span>
          <span>{ogHostLabel(blogConfig.siteUrl)}</span>
        </div>
      </div>
    ),
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      fonts: [
        { name: 'IBM Plex Serif', data: plexSerifBold, weight: 700, style: 'normal' },
        { name: 'Atkinson Hyperlegible', data: atkinsonRegular, weight: 400, style: 'normal' },
        { name: 'Atkinson Hyperlegible', data: atkinsonBold, weight: 700, style: 'normal' },
      ],
    },
  );
}
