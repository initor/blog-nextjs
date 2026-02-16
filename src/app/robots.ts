import type { MetadataRoute } from 'next'
import { blogConfig } from '@/config/blog'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/preview/', '/_next/', '/api/'],
    },
    sitemap: `${blogConfig.siteUrl}/sitemap.xml`,
  }
}
