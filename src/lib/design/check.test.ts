import { classifyLinks, isFrameableBySite, judgeDocumentFrame, stickyNote } from '@/lib/design/check';

describe('judgeDocumentFrame', () => {
  const fits = { windowHeight: 4256, frameHeight: 4256, ownScrollbar: false, runaway: false };

  it('passes a frame that matches the page in a window', () => {
    expect(judgeDocumentFrame(fits)).toEqual({ pass: true, summary: '+0% against the window' });
  });

  it('passes a small difference, like a hero capped at a fixed height', () => {
    expect(judgeDocumentFrame({ ...fits, frameHeight: 4340 }).pass).toBe(true);
  });

  it('passes exactly at 5% and fails just past it, in either direction', () => {
    expect(judgeDocumentFrame({ ...fits, windowHeight: 1000, frameHeight: 1050 }).pass).toBe(true);
    expect(judgeDocumentFrame({ ...fits, windowHeight: 1000, frameHeight: 1051 }).pass).toBe(false);
    expect(judgeDocumentFrame({ ...fits, windowHeight: 1000, frameHeight: 949 }).pass).toBe(false);
  });

  it('fails a frame that scrolls inside and says what fixes it', () => {
    expect(judgeDocumentFrame({ ...fits, ownScrollbar: true })).toEqual({
      pass: false,
      summary: '+0%, but the frame scrolls inside; use layout: screen',
    });
  });

  it('fails a frame whose runaway guard fired', () => {
    const verdict = judgeDocumentFrame({ windowHeight: 11298, frameHeight: 42357, ownScrollbar: true, runaway: true });
    expect(verdict.pass).toBe(false);
    expect(verdict.summary).toContain('runs away');
  });
});

describe('classifyLinks', () => {
  const location = {
    baseUrl: 'http://127.0.0.1:4000/design/request-path/index.html',
    documentUrl: 'http://127.0.0.1:4000/design/request-path/index.html',
  };
  const published = new Set(['request-path', 'retry-budget']);
  const anchor = (href: string, target: string | null = null) => ({ href, target, download: false });

  it('counts links to other sites that open in the same tab', () => {
    const report = classifyLinks(
      [anchor('https://openfontlicense.org/'), anchor('https://github.com/', '_blank')],
      location,
      published,
    );
    expect(report.sameTabOutbound).toEqual(['https://openfontlicense.org/']);
  });

  it('flags links to pieces that are not published, whatever their target', () => {
    const report = classifyLinks(
      [anchor('../retry-budget/'), anchor('../draft-sketch/'), anchor('/design/old-diagram/index.html', '_blank')],
      location,
      published,
    );
    expect(report.unpublishedPieces).toEqual([
      'http://127.0.0.1:4000/design/draft-sketch/',
      'http://127.0.0.1:4000/design/old-diagram/index.html',
    ]);
  });

  it('ignores in-page anchors, mail links and malformed hrefs', () => {
    const report = classifyLinks([anchor('#top'), anchor('mailto:me@example.com'), anchor('http://[')], location, published);
    expect(report).toEqual({ sameTabOutbound: [], unpublishedPieces: [] });
  });
});

describe('stickyNote', () => {
  it('says nothing when the piece has no sticky elements', () => {
    expect(stickyNote(0)).toBeNull();
  });

  it('warns that sticky elements stop sticking in a document frame', () => {
    expect(stickyNote(3)).toBe("3 sticky element(s) won't stick in a document frame; layout: screen keeps them");
  });
});

describe('isFrameableBySite', () => {
  const policy = (ancestors: string) => ({
    name: 'Content-Security-Policy',
    value: `default-src 'self'; frame-ancestors ${ancestors}; upgrade-insecure-requests;`,
  });
  const frameOptions = (value: string) => ({ name: 'X-Frame-Options', value });

  it("accepts SAMEORIGIN with frame-ancestors 'self'", () => {
    expect(isFrameableBySite([frameOptions('SAMEORIGIN'), policy("'self'")])).toBe(true);
  });

  it('rejects DENY', () => {
    expect(isFrameableBySite([frameOptions('DENY'), policy("'self'")])).toBe(false);
  });

  it("rejects a second policy that still says frame-ancestors 'none', because browsers enforce both", () => {
    expect(isFrameableBySite([frameOptions('SAMEORIGIN'), policy("'self'"), policy("'none'")])).toBe(false);
  });

  it('rejects a response missing either header', () => {
    expect(isFrameableBySite([frameOptions('SAMEORIGIN'), { name: 'Content-Security-Policy', value: "default-src 'self'" }])).toBe(false);
    expect(isFrameableBySite([policy("'self'")])).toBe(false);
  });

  it('reads header names and the X-Frame-Options value without regard to case', () => {
    expect(
      isFrameableBySite([
        { name: 'x-frame-options', value: 'sameorigin' },
        { name: 'content-security-policy', value: "frame-ancestors 'self'" },
      ]),
    ).toBe(true);
  });
});
