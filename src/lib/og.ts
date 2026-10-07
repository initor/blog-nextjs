import type { ContentType } from '@/lib/mdx/utils';

/** Social preview cards are 1200 by 630, the size Open Graph and X expect. */
export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

/** Where a post's preview card is served. The route prerenders one card per post at build time. */
export function ogImagePath(contentType: ContentType, slug: string): string {
  return `/og/${contentType}/${slug}`;
}

/** The domain printed on the card, without the www the site is served from. */
export function ogHostLabel(siteUrl: string): string {
  return new URL(siteUrl).host.replace(/^www\./, '');
}

/** Long titles get a smaller size, so they stay within three lines of the card. */
export function ogTitleSize(title: string): number {
  if (title.length <= 32) return 76;
  if (title.length <= 56) return 64;
  return 52;
}
