import { render, screen } from '@testing-library/react';

const mockGetPieceBySlug = vi.fn();
const mockGetAllPieces = vi.fn();
vi.mock('@/lib/design/pieces', () => ({
  getPieceBySlug: (slug: string) => mockGetPieceBySlug(slug),
  getAllPieces: () => mockGetAllPieces(),
}));

vi.mock('next-mdx-remote/rsc', () => ({
  MDXRemote: ({ source }: { source: string }) => <div data-testid="note-body">{source}</div>,
}));
vi.mock('@/components/mdx/MDXComponents', () => ({ default: {} }));
vi.mock('remark-gfm', () => ({ default: {} }));
vi.mock('rehype-highlight', () => ({ default: {} }));

const mockNotFound = vi.fn();
vi.mock('next/navigation', () => ({
  notFound: () => {
    mockNotFound();
    throw new Error('NEXT_NOT_FOUND');
  },
}));

vi.mock('@/components/PieceFrame', () => ({
  default: ({ src, title, layout }: { src: string; title: string; layout: string }) => (
    <div data-testid="piece-frame" data-src={src} data-title={title} data-layout={layout} />
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

import PiecePage, { generateMetadata, generateStaticParams } from '@/app/design/[slug]/page';

const logo = {
  slug: 'rolling-update',
  frontMatter: { title: 'Rolling Update', date: '2026-10-06', layout: 'document' as const },
  note: 'Why one pod at a time.',
};

async function renderPage(slug = 'rolling-update') {
  return render(await PiecePage({ params: Promise.resolve({ slug }) }));
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetPieceBySlug.mockImplementation(async (slug: string) => (slug === logo.slug ? logo : undefined));
  mockGetAllPieces.mockResolvedValue([logo]);
});

describe('piece page', () => {
  it('shows the title and the date', async () => {
    await renderPage();
    expect(screen.getByRole('heading', { level: 1, name: 'Rolling Update' })).toBeInTheDocument();
    expect(screen.getByText('October 6, 2026')).toHaveAttribute('datetime', '2026-10-06');
  });

  it('frames the piece file with its layout', async () => {
    await renderPage();
    const frame = screen.getByTestId('piece-frame');
    expect(frame).toHaveAttribute('data-src', '/design/rolling-update/index.html');
    expect(frame).toHaveAttribute('data-title', 'Rolling Update');
    expect(frame).toHaveAttribute('data-layout', 'document');
  });

  it('links to the raw file for full screen, in the same tab', async () => {
    await renderPage();
    const link = screen.getByRole('link', { name: 'Full screen ↗' });
    expect(link).toHaveAttribute('href', '/design/rolling-update/index.html');
    expect(link).not.toHaveAttribute('target');
  });

  it('renders the note after the frame, with a link to it', async () => {
    await renderPage();
    expect(screen.getByRole('link', { name: 'Note ↓' })).toHaveAttribute('href', '#note');
    expect(screen.getByRole('heading', { level: 2, name: 'Note' })).toBeInTheDocument();
    expect(screen.getByTestId('note-body')).toHaveTextContent('Why one pod at a time.');
  });

  it('leaves out the note section and its link when there is no note', async () => {
    mockGetPieceBySlug.mockResolvedValue({ ...logo, note: '' });
    await renderPage();
    expect(screen.queryByRole('link', { name: 'Note ↓' })).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 2, name: 'Note' })).not.toBeInTheDocument();
  });

  it('is a 404 for an unknown slug', async () => {
    await expect(renderPage('missing')).rejects.toThrow('NEXT_NOT_FOUND');
    expect(mockNotFound).toHaveBeenCalled();
  });

  it('prerenders every piece', async () => {
    await expect(generateStaticParams()).resolves.toEqual([{ slug: 'rolling-update' }]);
  });

  it('titles the page "<title> | Design | initial"', async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'rolling-update' }) });
    expect(metadata.title).toBe('Rolling Update | Design | initial');
  });
});
