import { env } from "@/env";

export const blogConfig = {
  title: "initial",
  description: "Weezy thoughts",
  author: {
    name: "Wayne Wen",
    twitter: "@w3ewen",
    github: "initor",
    linkedin: "w3e",
    bluesky: "waynewen.com",
    strava: "38836222",
  },
  siteUrl: "https://www.waynewen.com",
  // Atom ids must never change (RFC 4287), so the feed keeps the host it was first published under.
  feedIdBase: "https://waynewen.com",
  defaultTheme: 'system', // for dark mode settings
  // Analytics, social sharing, and SEO defaults
  analytics: {
    // e.g., Google Analytics ID
    googleAnalyticsId: env.NEXT_PUBLIC_GA_ID,
  },
  openGraph: {
    type: 'website', // default type, will be overridden with 'article' for blog posts
    locale: 'en_US',
    siteName: "initial",
  }
} as const;

// You can also export type definitions if needed
export type BlogConfig = typeof blogConfig;
