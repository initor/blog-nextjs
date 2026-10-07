import { render } from '@testing-library/react';
import PieceThumbnail from '@/components/PieceThumbnail';

function renderThumbnail(): HTMLElement {
  return render(
    <PieceThumbnail slug="rolling-update" alt="Rolling Update" sizes="(min-width: 640px) 50vw, 100vw" />,
  ).container;
}

const encoded = (theme: 'light' | 'dark') => encodeURIComponent(`/design/rolling-update/thumb-${theme}.png`);

describe('PieceThumbnail', () => {
  it('switches to the dark thumbnail when the reader prefers dark', () => {
    const source = renderThumbnail().querySelector('source[media="(prefers-color-scheme: dark)"]');
    expect(source?.getAttribute('srcset')).toContain(encoded('dark'));
  });

  it('uses the light thumbnail otherwise', () => {
    const container = renderThumbnail();
    const source = container.querySelector('source[media="(prefers-color-scheme: light)"]');
    expect(source?.getAttribute('srcset')).toContain(encoded('light'));
    expect(container.querySelector('img')?.getAttribute('src')).toContain(encoded('light'));
  });

  it('describes the image and reserves its 16:10 box', () => {
    const img = renderThumbnail().querySelector('img');
    expect(img).toHaveAttribute('alt', 'Rolling Update');
    expect(img).toHaveAttribute('width', '2048');
    expect(img).toHaveAttribute('height', '1280');
  });
});
