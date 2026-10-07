/** A piece's files, by URL. The same paths sit under public/ on disk. */

export const PIECE_FILES = ['index.html', 'thumb-light.png', 'thumb-dark.png'] as const;

export type ThumbTheme = 'light' | 'dark';

/** Thumbnails are the piece's first screen at the frame's width, captured at 2x. */
export const THUMB_CSS_WIDTH = 1024;
export const THUMB_CSS_HEIGHT = 640;
export const THUMB_SCALE = 2;
export const THUMB_WIDTH = THUMB_CSS_WIDTH * THUMB_SCALE;
export const THUMB_HEIGHT = THUMB_CSS_HEIGHT * THUMB_SCALE;

export function pieceUrl(slug: string): string {
  return `/design/${slug}`;
}

export function pieceFileUrl(slug: string): string {
  return `/design/${slug}/index.html`;
}

export function pieceThumbUrl(slug: string, theme: ThumbTheme): string {
  return `/design/${slug}/thumb-${theme}.png`;
}
