import { blogConfig } from './blog'

export const siteConfig = {
  // Inherit base settings from blog config
  ...blogConfig,

  // Homepage specific configuration
  home: {
    title: "Wayne Wen",
    subtitle: "Software Engineer",
    introduction: "I'm a software engineer passionate about distributed systems infrastructure and sharing what I learn along the way.",

    // Social links with display preferences
    socialLinks: {
      github: {
        url: `https://github.com/${blogConfig.author.github}`,
        show: true,
        priority: 1,
      },
      twitter: {
        url: `https://twitter.com/${blogConfig.author.twitter}`,
        show: true,
        priority: 2,
      },
      linkedin: {
        url: `https://linkedin.com/in/${blogConfig.author.linkedin}`,
        show: true,
        priority: 3,
      },
      bluesky: {
        url: `https://bsky.app/profile/${blogConfig.author.bluesky}`,
        show: true,
        priority: 4,
      }
    },

    // Featured sections
    featuredSections: {
      showLatestPosts: true,
      showProjects: false,
      postsToShow: 3,
    },

    // Call to action
    primaryCTA: {
      text: "blog",
      link: "/blog",
      show: true,
    }
  },

  // Navigation configuration
  navigation: {
    main: [
      { name: 'about', href: '/' },
      { name: 'blog', href: '/blog' },
    ],
    // Optional footer links
    footer: [
      // Add any footer links you want
    ]
  }
} as const;

export type SiteConfig = typeof siteConfig;
