import Image from 'next/image';
import Link from 'next/link';
import type { ImageProps } from 'next/image';
import Mermaid from './Mermaid';

const MDXComponents = {
  // Custom link component
  a: ({ href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    if (href?.startsWith('/')) {
      return <Link href={href} {...props} />;
    }
    if (href?.startsWith('#')) {
      return <a href={href} {...props} />;
    }
    return <a target="_blank" rel="noopener noreferrer" href={href} {...props} />;
  },

  // Custom image component
  img: ({
    src,
    alt,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement>) => {
    if (!src || typeof src !== 'string') return null;

    return (
      <div className="relative w-full h-96 my-8">
        <Image
          src={src}
          alt={alt || ''}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover rounded-lg"
          {...(props as Partial<ImageProps>)}
        />
      </div>
    );
  },

  // Add custom heading components with anchor links
  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
    const id = typeof children === 'string'
      ? children.toLowerCase().replace(/\s+/g, '-')
      : '';

    return (
      <h2 id={id} {...props}>
        <a href={`#${id}`} className="no-underline">
          {children}
        </a>
      </h2>
    );
  },

  // Custom pre component to handle mermaid code blocks
  pre: ({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) => {
    // Check if this is a mermaid code block
    const childElement = children as React.ReactElement<{
      className?: string;
      children?: string;
    }>;
    
    if (
      childElement?.props?.className?.includes('language-mermaid') ||
      childElement?.props?.className?.includes('mermaid')
    ) {
      const chart = childElement?.props?.children || '';
      return <Mermaid chart={String(chart).trim()} />;
    }

    // Default pre rendering
    return <pre {...props}>{children}</pre>;
  },
};

export default MDXComponents;
