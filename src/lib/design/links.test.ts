import { leavingUrl, type LinkClick } from '@/lib/design/links';

const location = {
  baseUrl: 'https://waynewen.com/design/request-path/index.html',
  documentUrl: 'https://waynewen.com/design/request-path/index.html',
};

function click(overrides: Partial<LinkClick> = {}): LinkClick {
  return {
    href: 'https://openfontlicense.org/',
    target: null,
    download: false,
    button: 0,
    modified: false,
    defaultPrevented: false,
    ...overrides,
  };
}

describe('leavingUrl', () => {
  it('sends a link to another site to the whole tab', () => {
    expect(leavingUrl(click(), location)).toBe('https://openfontlicense.org/');
  });

  it('sends a link to another page on the site to the whole tab', () => {
    expect(leavingUrl(click({ href: '../retry-budget/' }), location)).toBe('https://waynewen.com/design/retry-budget/');
  });

  it('treats the same file with another query as leaving', () => {
    expect(leavingUrl(click({ href: '?view=full' }), location)).toBe(
      'https://waynewen.com/design/request-path/index.html?view=full',
    );
  });

  it.each(['#call-chain', '', 'index.html#top'])('leaves the in-page link "%s" to the browser', (href) => {
    expect(leavingUrl(click({ href }), location)).toBeNull();
  });

  it.each(['_blank', '_top', '_parent', 'docs'])('leaves target="%s" to the browser', (target) => {
    expect(leavingUrl(click({ target }), location)).toBeNull();
  });

  it.each(['_self', ' _SELF '])('treats target="%s" like no target', (target) => {
    expect(leavingUrl(click({ target }), location)).toBe('https://openfontlicense.org/');
  });

  it('leaves downloads to the browser', () => {
    expect(leavingUrl(click({ download: true }), location)).toBeNull();
  });

  it.each(['mailto:me@example.com', 'javascript:void(0)', 'data:text/plain,hi'])('leaves %s to the browser', (href) => {
    expect(leavingUrl(click({ href }), location)).toBeNull();
  });

  it('leaves middle clicks and modified clicks to the browser', () => {
    expect(leavingUrl(click({ button: 1 }), location)).toBeNull();
    expect(leavingUrl(click({ modified: true }), location)).toBeNull();
  });

  it('respects a click the piece already handled', () => {
    expect(leavingUrl(click({ defaultPrevented: true }), location)).toBeNull();
  });

  it('ignores an href that is not a valid URL', () => {
    expect(leavingUrl(click({ href: 'http://[' }), location)).toBeNull();
  });

  it('resolves relative links against the base URL', () => {
    expect(leavingUrl(click({ href: 'notes.html' }), { ...location, baseUrl: 'https://waynewen.com/other/' })).toBe(
      'https://waynewen.com/other/notes.html',
    );
  });
});
