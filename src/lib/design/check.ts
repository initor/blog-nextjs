import { leavingUrl, type PieceLocation } from './links';

/** How far a settled document frame may be from the page's height in a window of the frame's size. */
export const HEIGHT_TOLERANCE = 0.05;

export interface DocumentFrameMeasurement {
  /** The page's own height in a window as wide as the frame and as tall as the viewport. */
  windowHeight: number;
  /** The height the document frame settled at. */
  frameHeight: number;
  /** The frame shows a scrollbar of its own. */
  ownScrollbar: boolean;
  /** The frame's runaway guard stopped fitting. */
  runaway: boolean;
}

export interface Verdict {
  pass: boolean;
  summary: string;
}

export function judgeDocumentFrame(m: DocumentFrameMeasurement): Verdict {
  const percent = `${m.frameHeight >= m.windowHeight ? '+' : ''}${Math.round((m.frameHeight / m.windowHeight - 1) * 100)}%`;
  if (m.runaway) {
    return {
      pass: false,
      summary: `runs away (${m.windowHeight}px in a window, ${m.frameHeight}px when the guard stopped it); use layout: screen`,
    };
  }
  // Compared in pixels, not as a ratio, so exactly 5% isn't lost to floating point.
  if (Math.abs(m.frameHeight - m.windowHeight) > HEIGHT_TOLERANCE * m.windowHeight) {
    return { pass: false, summary: `${percent} against the window; use layout: screen` };
  }
  if (m.ownScrollbar) {
    return { pass: false, summary: `${percent}, but the frame scrolls inside; use layout: screen` };
  }
  return { pass: true, summary: `${percent} against the window` };
}

export interface AnchorInfo {
  href: string;
  target: string | null;
  download: boolean;
}

export interface LinkReport {
  /** Links to other sites that open in the same tab; the frame sends them to the whole tab. */
  sameTabOutbound: string[];
  /** Links to /design/<slug> pieces that are not published, whatever their target. */
  unpublishedPieces: string[];
}

export function classifyLinks(
  anchors: AnchorInfo[],
  location: PieceLocation,
  published: ReadonlySet<string>,
): LinkReport {
  const origin = new URL(location.documentUrl).origin;
  const report: LinkReport = { sameTabOutbound: [], unpublishedPieces: [] };
  for (const anchor of anchors) {
    let resolved: URL;
    try {
      resolved = new URL(anchor.href, location.baseUrl);
    } catch {
      continue;
    }
    const slug = resolved.origin === origin ? resolved.pathname.match(/^\/design\/([^/]+)/)?.[1] : undefined;
    if (slug && !published.has(slug)) report.unpublishedPieces.push(resolved.href);

    const leaving = leavingUrl({ ...anchor, button: 0, modified: false, defaultPrevented: false }, location);
    if (leaving && new URL(leaving).origin !== origin) report.sameTabOutbound.push(leaving);
  }
  return report;
}

/** A note for a document piece with sticky elements: they stop sticking once its frame grows to fit. */
export function stickyNote(stickyCount: number): string | null {
  return stickyCount > 0
    ? `${stickyCount} sticky element(s) won't stick in a document frame; layout: screen keeps them`
    : null;
}

/**
 * Whether a response lets the site's own pages, and only them, frame it: X-Frame-Options is
 * SAMEORIGIN and every policy's frame-ancestors is 'self'. Browsers enforce every policy sent,
 * so a second one with 'none' still blocks the frame.
 */
export function isFrameableBySite(headers: { name: string; value: string }[]): boolean {
  const values = (name: string) =>
    headers.filter((header) => header.name.toLowerCase() === name).map((header) => header.value.trim());
  const frameOptions = values('x-frame-options');
  const ancestors = values('content-security-policy').flatMap((policy) =>
    policy
      .split(';')
      .map((directive) => directive.trim())
      .filter((directive) => directive.startsWith('frame-ancestors')),
  );
  return (
    frameOptions.length > 0 &&
    frameOptions.every((value) => value.toUpperCase() === 'SAMEORIGIN') &&
    ancestors.length > 0 &&
    ancestors.every((directive) => directive === "frame-ancestors 'self'")
  );
}
