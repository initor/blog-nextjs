/** What the frame knows about a click on a link inside a piece. */
export interface LinkClick {
  /** The anchor's href attribute, as written. */
  href: string;
  /** The anchor's target attribute, or null when it has none. */
  target: string | null;
  /** Whether the anchor has a download attribute. */
  download: boolean;
  /** MouseEvent.button; 0 is the primary button. */
  button: number;
  /** Whether meta, ctrl, shift or alt was held. */
  modified: boolean;
  /** Whether the piece's own script already handled the click. */
  defaultPrevented: boolean;
}

/** The piece's document: baseUrl resolves relative links, documentUrl identifies the page itself. */
export interface PieceLocation {
  baseUrl: string;
  documentUrl: string;
}

/**
 * The URL to open in the whole tab, or null to leave the click to the browser.
 *
 * Inside a frame, a plain link would load its target into the frame, and most sites
 * refuse to be framed. Opening it in the tab is what the same click does when the file
 * is opened on its own. Every other kind of click keeps its native behavior.
 */
export function leavingUrl(click: LinkClick, location: PieceLocation): string | null {
  if (click.defaultPrevented || click.button !== 0 || click.modified || click.download) return null;

  const target = (click.target ?? '').trim().toLowerCase();
  if (target !== '' && target !== '_self') return null;

  let url: URL;
  try {
    url = new URL(click.href, location.baseUrl);
  } catch {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;

  const page = new URL(location.documentUrl);
  const samePage = url.origin === page.origin && url.pathname === page.pathname && url.search === page.search;
  return samePage ? null : url.href;
}
