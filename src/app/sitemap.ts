import type { MetadataRoute } from 'next'
import { blogConfig } from '@/config/blog'
import { getAllPosts } from '@/lib/mdx/utils'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = blogConfig.siteUrl

  const blogPosts = await getAllPosts('blog')
  const archivePosts = await getAllPosts('archive')

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date() },
    { url: `${siteUrl}/about`, lastModified: new Date() },
    { url: `${siteUrl}/blog`, lastModified: new Date() },
    { url: `${siteUrl}/archive`, lastModified: new Date() },
  ]

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: new Date(post.frontMatter.date),
  }))

  const archiveEntries: MetadataRoute.Sitemap = archivePosts.map((post) => ({
    url: `${siteUrl}/archive/${post.slug}`,
    lastModified: new Date(post.frontMatter.date),
  }))

  return [...staticPages, ...blogEntries, ...archiveEntries]
}
