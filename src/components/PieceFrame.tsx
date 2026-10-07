'use client';

import { useEffect, useRef } from 'react';
import {
  createFrameFitter,
  DOCUMENT_INITIAL_HEIGHT,
  SCREEN_HEIGHT,
  type FrameFitter,
} from '@/lib/design/frameFit';
import { leavingUrl } from '@/lib/design/links';
import type { PieceLayout } from '@/lib/design/schema';

interface PieceFrameProps {
  /** The piece file: /design/<slug>/index.html. */
  src: string;
  title: string;
  layout: PieceLayout;
}

/**
 * Shows a piece file unchanged in a same-origin iframe. The page around it only reads
 * the piece's height (document layout) and sends links that would leave the piece to
 * the whole tab, which is where they go when the file is opened on its own.
 */
export default function PieceFrame({ src, title, layout }: PieceFrameProps) {
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = ref.current;
    if (!iframe) return;
    let detach: (() => void) | undefined;

    const attach = () => {
      const doc = iframe.contentDocument;
      const win = iframe.contentWindow as (Window & typeof globalThis) | null;
      if (!doc || !win || doc.URL === 'about:blank') return;
      detach?.();

      const onClick = (event: MouseEvent) => {
        const anchor = (event.target as Element | null)?.closest?.('a[href]');
        if (!anchor) return;
        const url = leavingUrl(
          {
            href: anchor.getAttribute('href') ?? '',
            target: anchor.getAttribute('target'),
            download: anchor.hasAttribute('download'),
            button: event.button,
            modified: event.metaKey || event.ctrlKey || event.shiftKey || event.altKey,
            defaultPrevented: event.defaultPrevented,
          },
          { baseUrl: doc.baseURI, documentUrl: doc.URL },
        );
        if (!url) return;
        event.preventDefault();
        window.location.assign(url);
      };
      doc.addEventListener('click', onClick);

      let observer: ResizeObserver | undefined;
      let fitter: FrameFitter | undefined;
      if (layout === 'document') {
        fitter = createFrameFitter(iframe.offsetHeight, {
          contentHeight: () => doc.documentElement.getBoundingClientRect().height,
          setFrameHeight: (px) => {
            iframe.style.height = `${px}px`;
          },
          now: () => performance.now(),
          schedule: (fn, ms) => {
            const id = window.setTimeout(fn, ms);
            return () => window.clearTimeout(id);
          },
          warn: (reason) => console.warn(`[design] ${src}: ${reason}`),
        });
        // Created from the piece's own window, so it observes the piece's document. It keeps
        // observing after a stop, because a stopped frame still follows shrinks.
        observer = new win.ResizeObserver(() => fitter?.onResize());
        observer.observe(doc.documentElement);
      }

      detach = () => {
        doc.removeEventListener('click', onClick);
        observer?.disconnect();
        fitter?.dispose();
      };
    };

    let placedAtWidth = -1;
    const placeScreenFrame = () => {
      // Phone toolbars change the window's height while the reader scrolls; only a width change
      // can move the frame, so only a width change measures again.
      if (window.innerWidth === placedAtWidth) return;
      placedAtWidth = window.innerWidth;
      const top = iframe.getBoundingClientRect().top + window.scrollY;
      iframe.style.setProperty('--piece-frame-top', `${Math.round(top)}px`);
    };

    iframe.addEventListener('load', attach);
    // The iframe is server-rendered and can finish loading before hydration.
    if (iframe.contentDocument?.readyState === 'complete') attach();
    if (layout === 'screen') {
      placeScreenFrame();
      window.addEventListener('resize', placeScreenFrame);
    }

    return () => {
      iframe.removeEventListener('load', attach);
      window.removeEventListener('resize', placeScreenFrame);
      detach?.();
    };
  }, [layout, src]);

  return (
    <div className="max-w-5xl mx-auto overflow-hidden rounded-xl border border-[color:var(--code-border)]">
      <iframe
        ref={ref}
        src={src}
        title={title}
        data-piece-frame=""
        className="block w-full border-0"
        style={{ height: layout === 'document' ? DOCUMENT_INITIAL_HEIGHT : SCREEN_HEIGHT }}
      />
    </div>
  );
}
