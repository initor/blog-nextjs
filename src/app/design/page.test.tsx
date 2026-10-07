import type { ReactNode } from 'react';
import { render, screen, within } from '@testing-library/react';

const mockGetAllPieces = vi.fn();
vi.mock('@/lib/design/pieces', () => ({ getAllPieces: () => mockGetAllPieces() }));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/config/blog', () => ({
  blogConfig: {
    title: 'initial',
    siteUrl: 'https://waynewen.com',
    author: { name: 'Wayne Wen', twitter: '@w3ewen' },
    openGraph: { siteName: 'initial', locale: 'en_US' },
  },
}));

import DesignIndexPage from '@/app/design/page';

describe('design index', () => {
  beforeEach(() => {
    mockGetAllPieces.mockResolvedValue([
      { slug: 'rolling-update', frontMatter: { title: 'Rolling Update', date: '2026-10-05', layout: 'document' }, note: '' },
      { slug: 'leader-election', frontMatter: { title: 'Leader Election, Step by Step', date: '2026-04-11', layout: 'screen' }, note: '' },
    ]);
  });

  it('lists every piece in loader order, each card linking to its page', async () => {
    render(await DesignIndexPage());
    expect(screen.getByRole('heading', { level: 1, name: 'Design' })).toBeInTheDocument();

    const cards = screen.getAllByRole('link');
    expect(cards.map((card) => card.getAttribute('href'))).toEqual([
      '/design/rolling-update',
      '/design/leader-election',
    ]);
    expect(within(cards[0]).getByRole('heading', { level: 2 })).toHaveTextContent('Rolling Update');
    expect(within(cards[0]).getByText('October 5, 2026')).toBeInTheDocument();
    expect(within(cards[1]).getByRole('img', { name: 'Leader Election, Step by Step' })).toBeInTheDocument();
  });
});
