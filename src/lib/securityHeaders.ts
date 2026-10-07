/**
 * Response headers for every route, plus the one exception the design section needs:
 * piece files may be framed by the site's own pages. Consumed by next.config.ts, so
 * this file must not use the @/ path alias.
 */

export interface HeaderRule {
  source: string;
  headers: { key: string; value: string }[];
}

/** The only paths the site's own pages may frame. */
export const PIECE_FILE_SOURCE = '/design/:slug/index.html';

export function contentSecurityPolicy(options: {
  isDev: boolean;
  frameAncestors: "'none'" | "'self'";
}): string {
  const { isDev, frameAncestors } = options;
  return `
    default-src 'self';
    script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://*.googletagmanager.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://*.google-analytics.com https://*.googletagmanager.com;
    font-src 'self';
    connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors ${frameAncestors};
    ${isDev ? '' : 'upgrade-insecure-requests;'}
  `
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function securityHeaderRules(isDev: boolean): HeaderRule[] {
  return [
    {
      source: '/(.*)',
      headers: [
        { key: 'Content-Security-Policy', value: contentSecurityPolicy({ isDev, frameAncestors: "'none'" }) },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
        { key: 'X-DNS-Prefetch-Control', value: 'on' },
      ],
    },
    // After the site-wide rule on purpose: Next applies every matching rule in order,
    // and for the same header the later value wins.
    {
      source: PIECE_FILE_SOURCE,
      headers: [
        { key: 'Content-Security-Policy', value: contentSecurityPolicy({ isDev, frameAncestors: "'self'" }) },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'X-Robots-Tag', value: 'noindex, indexifembedded' },
      ],
    },
  ];
}
