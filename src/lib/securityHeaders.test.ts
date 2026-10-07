import {
  contentSecurityPolicy,
  PIECE_FILE_SOURCE,
  securityHeaderRules,
  type HeaderRule,
} from '@/lib/securityHeaders';

// Copied from the live response on 2026-10-06: curl -sI https://www.waynewen.com/
const LIVE_CSP =
  "default-src 'self'; script-src 'self' 'unsafe-inline' https://*.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https://*.google-analytics.com https://*.googletagmanager.com; font-src 'self'; connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests;";

function header(rule: HeaderRule, key: string): string | undefined {
  return rule.headers.find((h) => h.key === key)?.value;
}

describe('contentSecurityPolicy', () => {
  it('reproduces the live production policy', () => {
    expect(contentSecurityPolicy({ isDev: false, frameAncestors: "'none'" })).toBe(LIVE_CSP);
  });

  it('allows eval and drops the https upgrade in development', () => {
    const csp = contentSecurityPolicy({ isDev: true, frameAncestors: "'none'" });
    expect(csp).toContain("script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googletagmanager.com;");
    expect(csp).not.toContain('upgrade-insecure-requests');
  });

  it('differs from the site policy only in frame-ancestors', () => {
    expect(contentSecurityPolicy({ isDev: false, frameAncestors: "'self'" })).toBe(
      LIVE_CSP.replace("frame-ancestors 'none'", "frame-ancestors 'self'"),
    );
  });
});

describe('securityHeaderRules', () => {
  const [site, piece] = securityHeaderRules(false);

  it('keeps the site-wide rule exactly as it was', () => {
    expect(site).toEqual({
      source: '/(.*)',
      headers: [
        { key: 'Content-Security-Policy', value: LIVE_CSP },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
        { key: 'X-DNS-Prefetch-Control', value: 'on' },
      ],
    });
  });

  it('lets only piece files be framed, and comes after the site-wide rule', () => {
    expect(PIECE_FILE_SOURCE).toBe('/design/:slug/index.html');
    expect(piece.source).toBe(PIECE_FILE_SOURCE);
    expect(header(piece, 'X-Frame-Options')).toBe('SAMEORIGIN');
    expect(header(piece, 'Content-Security-Policy')).toContain("frame-ancestors 'self'");
    expect(header(piece, 'X-Robots-Tag')).toBe('noindex, indexifembedded');
  });
});
