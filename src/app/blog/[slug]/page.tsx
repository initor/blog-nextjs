import { getPostBySlug, getAllPosts } from '@/lib/mdx/utils';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { notFound } from 'next/navigation';
import MDXComponents from '@/components/mdx/MDXComponents';
import type { Metadata } from 'next';
import { blogConfig } from '@/config/blog';

interface BlogPostPageProps {
 params: Promise<{
   slug: string;
 }>;
}

export async function generateMetadata({
 params,
}: BlogPostPageProps): Promise<Metadata> {
 const resolvedParams = await params;
 const post = await getPostBySlug(resolvedParams.slug);

 if (!post) {
   return {
     title: 'Post Not Found',
   };
 }

 const ogImage = post.frontMatter.ogImage || `${blogConfig.siteUrl}/api/og?title=${post.frontMatter.title}`;

 return {
   title: `${post.frontMatter.title} | ${blogConfig.title}`,
   description: post.frontMatter.description,
   authors: [{ name: blogConfig.author.name }],
   openGraph: {
     title: post.frontMatter.title,
     description: post.frontMatter.description,
     type: 'article',
     authors: [blogConfig.author.name],
     publishedTime: post.frontMatter.date,
     url: `${blogConfig.siteUrl}/blog/${post.slug}`,
     siteName: blogConfig.openGraph.siteName,
     locale: blogConfig.openGraph.locale,
     images: [
       {
         url: ogImage,
         width: 1200,
         height: 630,
         alt: post.frontMatter.title,
       }
     ],
   },
   twitter: {
     card: 'summary_large_image',
     title: post.frontMatter.title,
     description: post.frontMatter.description,
     creator: blogConfig.author.twitter,
   },
 };
}

export async function generateStaticParams() {
 const posts = await getAllPosts();
 return posts.map((post) => ({
   slug: post.slug,
 }));
}

export default async function BlogPostPage({
 params,
}: BlogPostPageProps) {
 const resolvedParams = await params;
 const post = await getPostBySlug(resolvedParams.slug);

 if (!post) {
   notFound();
 }

 return (
   <article className="max-w-4xl mx-auto px-4 py-8">
     <header className="mb-8">
       <h1 className="text-4xl font-bold mb-2">{post.frontMatter.title}</h1>

       <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
         <time dateTime={post.frontMatter.date}>
           {new Date(post.frontMatter.date).toLocaleDateString('en-US', {
             year: 'numeric',
             month: 'long',
             day: 'numeric'
           })}
         </time>
         <span>·</span>
         <span>{post.frontMatter.readingTime.text}</span>
       </div>

       {post.frontMatter.description && (
         <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
           {post.frontMatter.description}
         </p>
       )}

       {post.frontMatter.tags && (
         <div className="flex flex-wrap gap-2 mt-4">
           {post.frontMatter.tags.map((tag) => (
             <span
               key={tag}
               className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm"
             >
               {tag}
             </span>
           ))}
         </div>
       )}
     </header>

     <div className="prose dark:prose-invert prose-lg max-w-none">
       <MDXRemote
         source={post.content}
         components={MDXComponents}
       />
     </div>
   </article>
 );
}
