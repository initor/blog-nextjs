import { render } from '@testing-library/react';
import PieceFrame from '@/components/PieceFrame';

function frame(container: HTMLElement): HTMLIFrameElement {
  return container.querySelector('iframe[data-piece-frame]') as HTMLIFrameElement;
}

describe('PieceFrame', () => {
  it('frames the piece file unchanged, without a sandbox', () => {
    const { container } = render(
      <PieceFrame src="/design/logo/index.html" title="Rolling Update" layout="document" />,
    );
    expect(frame(container)).toHaveAttribute('src', '/design/logo/index.html');
    expect(frame(container)).toHaveAttribute('title', 'Rolling Update');
    expect(frame(container)).not.toHaveAttribute('sandbox');
  });

  it('starts a document frame at 85svh, its height without JavaScript', () => {
    const { container } = render(<PieceFrame src="/design/logo/index.html" title="Logo" layout="document" />);
    expect(frame(container).style.height).toBe('85svh');
  });

  it('tells a screen frame how far down the page it starts, so CSS fills the rest of the first screen', () => {
    // jsdom lays nothing out, so the frame's top is 0.
    const { container } = render(<PieceFrame src="/design/routing/index.html" title="Routing" layout="screen" />);
    expect(frame(container).style.getPropertyValue('--piece-frame-top')).toBe('0px');
  });

  it('measures again when the window width changes, but not when only its height does', () => {
    const { container } = render(<PieceFrame src="/design/routing/index.html" title="Routing" layout="screen" />);
    const iframe = frame(container);
    iframe.style.setProperty('--piece-frame-top', '123px');
    window.dispatchEvent(new Event('resize'));
    expect(iframe.style.getPropertyValue('--piece-frame-top')).toBe('123px');

    Object.defineProperty(window, 'innerWidth', { value: window.innerWidth - 300, configurable: true });
    window.dispatchEvent(new Event('resize'));
    expect(iframe.style.getPropertyValue('--piece-frame-top')).toBe('0px');
  });
});
