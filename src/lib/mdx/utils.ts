import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime, { ReadTimeResults } from 'reading-time';
import { ZodError } from 'zod';
import { FrontmatterSchema, type Frontmatter } from './schemas';

// Content type definitions
export type ContentType = 'blog' | 'preview' | 'archive';

/** Type guard for Node.js filesystem errors (ENOENT, EACCES, etc.) */
function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}

const CONTENT_PATHS: Record<ContentType, string> = {
  blog: path.join(process.cwd(), 'src/content/blog'),
  preview: path.join(process.cwd(), 'src/content/preview'),
  archive: path.join(process.cwd(), 'src/content/archive'),
};

/** Full post frontmatter including computed readingTime */
export type PostFrontMatter = Frontmatter & {
  readingTime: ReadTimeResults;
};

export interface Post {
  frontMatter: PostFrontMatter;
  slug: string;
  content: string;
}

/**
 * Get all posts for a given content type
 * @param contentType - 'blog', 'preview', or 'archive' (defaults to 'blog')
 */
export async function getAllPosts(contentType: ContentType = 'blog'): Promise<Post[]> {
  const postsPath = CONTENT_PATHS[contentType];
  
  // Get all files in the posts directory
  const files = await fs.readdir(postsPath);

  // Get the posts with async map
  const posts = await Promise.all(
    files
      .filter((filePath) => /\.mdx?$/.test(filePath))
      .map(async (fileName): Promise<Post> => {
        const source = await fs.readFile(
          path.join(postsPath, fileName),
          'utf8'
        );
        const { data, content } = matter(source);

        return {
          frontMatter: {
            ...FrontmatterSchema.parse(data),
            readingTime: readingTime(content),
          },
          slug: fileName.replace(/\.mdx?$/, ''),
          content,
        };
      })
  );

  // Sort posts by date
  return posts.sort((a, b) => {
    const dateA = new Date(a.frontMatter.date).getTime();
    const dateB = new Date(b.frontMatter.date).getTime();
    return dateB - dateA;
  });
}

/**
 * Get a single post by slug for a given content type
 * @param slug - The post slug (filename without extension)
 * @param contentType - 'blog', 'preview', or 'archive' (defaults to 'blog')
 */
export async function getPostBySlug(slug: string, contentType: ContentType = 'blog'): Promise<Post | undefined> {
  const postsPath = CONTENT_PATHS[contentType];
  
  try {
    const fullPath = path.join(postsPath, `${slug}.mdx`);
    const source = await fs.readFile(fullPath, 'utf8');
    const { data, content } = matter(source);

    return {
      frontMatter: {
        ...FrontmatterSchema.parse(data),
        readingTime: readingTime(content),
      },
      slug,
      content,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      console.error(
        `[${contentType}/${slug}] Frontmatter validation failed:`,
        error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')
      );
      throw error;
    }

    if (isNodeError(error) && error.code === 'ENOENT') {
      // File not found -- expected for invalid slugs, no logging needed
      return undefined;
    }

    // Unexpected error -- log with context for debugging
    console.error(`[${contentType}/${slug}] Unexpected error loading post:`, error);
    return undefined;
  }
}
