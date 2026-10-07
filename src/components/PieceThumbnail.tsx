import { getImageProps } from 'next/image';
import { THUMB_HEIGHT, THUMB_WIDTH, pieceThumbUrl } from '@/lib/design/assets';

interface PieceThumbnailProps {
  slug: string;
  alt: string;
  /** The width the card takes up, so the browser picks the right srcset candidate. */
  sizes: string;
}

/** A piece's first screen, light or dark to match the reader's theme. */
export default function PieceThumbnail({ slug, alt, sizes }: PieceThumbnailProps) {
  const common = { alt, width: THUMB_WIDTH, height: THUMB_HEIGHT, sizes };
  const {
    props: { srcSet: dark },
  } = getImageProps({ ...common, src: pieceThumbUrl(slug, 'dark') });
  const {
    props: { srcSet: light, ...rest },
  } = getImageProps({ ...common, src: pieceThumbUrl(slug, 'light') });

  return (
    <picture>
      <source media="(prefers-color-scheme: dark)" srcSet={dark} sizes={sizes} />
      <source media="(prefers-color-scheme: light)" srcSet={light} sizes={sizes} />
      {/* eslint-disable-next-line @next/next/no-img-element -- the fallback img of a getImageProps picture */}
      <img
        {...rest}
        alt={alt}
        className="block w-full h-auto rounded-lg border border-zinc-800/10 dark:border-zinc-100/10"
      />
    </picture>
  );
}
