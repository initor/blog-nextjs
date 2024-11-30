import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import readingTime, { ReadTimeResults } from 'reading-time';

const POSTS_PATH = path.join(process.cwd(), 'src/content/blog');

export interface PostFrontMatter {
  title: string;
  date: string;
  readingTime: ReadTimeResults;
  description?: string;
  tags?: string[];
  category?: string;
  ogImage?: string;
}

export interface Post {
  frontMatter: PostFrontMatter;
  slug: string;
  content: string;
}

export async function getAllPosts(): Promise<Post[]> {
  // Get all files in the posts directory
  const files = await fs.readdir(POSTS_PATH);

  // Get the posts with async map
  const posts = await Promise.all(
    files
      .filter((path) => /\.mdx?$/.test(path))
      .map(async (fileName): Promise<Post> => {
        const source = await fs.readFile(
          path.join(POSTS_PATH, fileName),
          'utf8'
        );
        const { data, content } = matter(source);

        return {
          frontMatter: {
            ...(data as Omit<PostFrontMatter, 'readingTime'>),
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

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  try {
    const fullPath = path.join(POSTS_PATH, `${slug}.mdx`);
    const source = await fs.readFile(fullPath, 'utf8');
    const { data, content } = matter(source);

    return {
      frontMatter: {
        ...(data as Omit<PostFrontMatter, 'readingTime'>),
        readingTime: readingTime(content),
      },
      slug,
      content,
    };
  } catch (error) {
    console.error(error);
    return undefined;
  }
}
