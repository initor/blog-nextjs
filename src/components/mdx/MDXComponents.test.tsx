import React from 'react';
import { render, screen } from '@testing-library/react';
import MDXComponents from '@/components/mdx/MDXComponents';

// Mock next/image as a plain img element
vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => <img {...props} />,
}));

// Mock next/link as a plain anchor element
vi.mock('next/link', () => ({
  default: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a {...props}>{children}</a>,
}));

// Mock the Mermaid component
vi.mock('@/components/mdx/Mermaid', () => ({
  default: ({ chart }: { chart: string }) => (
    <div data-testid="mermaid-diagram">{chart}</div>
  ),
}));

// Extract individual components from the MDX components map
const CustomLink = MDXComponents.a!;
const CustomImage = MDXComponents.img!;
const CustomH2 = MDXComponents.h2!;
const CustomCode = MDXComponents.code!;
const CustomPre = MDXComponents.pre!;

describe('CustomLink (a)', () => {
  it('renders internal links using Next Link', () => {
    render(<CustomLink href="/blog">Blog</CustomLink>);
    const link = screen.getByText('Blog');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/blog');
  });

  it('renders external links with target=_blank and rel=noopener noreferrer', () => {
    render(
      <CustomLink href="https://example.com">External</CustomLink>,
    );
    const link = screen.getByText('External').closest('a')!;
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('renders anchor links as plain anchors', () => {
    render(<CustomLink href="#section">Section</CustomLink>);
    const link = screen.getByText('Section').closest('a')!;
    expect(link).toHaveAttribute('href', '#section');
    expect(link).not.toHaveAttribute('target');
  });

  it('handles undefined href gracefully', () => {
    render(<CustomLink>No Link</CustomLink>);
    expect(screen.getByText('No Link')).toBeInTheDocument();
  });
});

describe('CustomImage (img)', () => {
  it('renders Next Image with src and alt', () => {
    render(<CustomImage src="/photo.jpg" alt="A photo" />);
    const img = screen.getByAltText('A photo');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/photo.jpg');
  });

  it('returns null when src is missing', () => {
    const { container } = render(<CustomImage alt="no src" />);
    expect(container.innerHTML).toBe('');
  });

  it('returns null when src is not a string', () => {
    const { container } = render(<CustomImage src={undefined} alt="no src" />);
    expect(container.innerHTML).toBe('');
  });

  it('uses empty string alt when alt is missing', () => {
    const { container } = render(<CustomImage src="/photo.jpg" />);
    // An img with alt="" has role "presentation" in accessibility tree,
    // so query by tag name instead of role.
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('alt', '');
  });
});

describe('CustomH2 (h2)', () => {
  it('renders with slugified ID', () => {
    render(<CustomH2>Hello World</CustomH2>);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveAttribute('id', 'hello-world');
  });

  it('renders anchor link inside heading', () => {
    render(<CustomH2>Hello World</CustomH2>);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '#hello-world');
    expect(link).toHaveTextContent('Hello World');
  });

  it('handles non-string children', () => {
    render(
      <CustomH2>
        <span>Test</span>
      </CustomH2>,
    );
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveAttribute('id', '');
    expect(heading).toBeInTheDocument();
  });
});

describe('CustomCode (code)', () => {
  it('renders with className preserved', () => {
    const { container } = render(
      <CustomCode className="language-js">const x = 1;</CustomCode>,
    );
    const code = container.querySelector('code');
    expect(code).toHaveClass('language-js');
  });

  it('renders children', () => {
    render(
      <CustomCode className="language-js">const x = 1;</CustomCode>,
    );
    expect(screen.getByText('const x = 1;')).toBeInTheDocument();
  });
});

describe('CustomPre (pre)', () => {
  it('renders normal code blocks as pre', () => {
    const { container } = render(
      <CustomPre>
        <code className="language-javascript">console.log(&apos;hi&apos;)</code>
      </CustomPre>,
    );
    expect(container.querySelector('pre')).toBeInTheDocument();
  });

  it('detects mermaid code blocks and renders Mermaid component', () => {
    render(
      <CustomPre>
        <code className="language-mermaid">graph TD; A--&gt;B;</code>
      </CustomPre>,
    );
    const mermaid = screen.getByTestId('mermaid-diagram');
    expect(mermaid).toBeInTheDocument();
    expect(mermaid).toHaveTextContent('graph TD; A-->B;');
  });

  it('detects .mermaid class and renders Mermaid component', () => {
    render(
      <CustomPre>
        <code className="mermaid">sequenceDiagram</code>
      </CustomPre>,
    );
    expect(screen.getByTestId('mermaid-diagram')).toBeInTheDocument();
  });

  it('passes through non-mermaid code blocks unchanged', () => {
    const { container } = render(
      <CustomPre>
        <code className="language-python">print(&apos;hello&apos;)</code>
      </CustomPre>,
    );
    expect(container.querySelector('pre')).toBeInTheDocument();
    expect(screen.queryByTestId('mermaid-diagram')).not.toBeInTheDocument();
  });
});
