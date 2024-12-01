import { blogConfig } from './blog'

export const siteConfig = {
  // Inherit base settings from blog config
  ...blogConfig,

  // Homepage specific configuration
  home: {
    title: "Wayne Wen",
    subtitle: "Software Engineer",
    introduction: "Building distributed systems and sharing my learnings.",

    // Social links with display preferences
    socialLinks: {
      github: {
        url: `https://github.com/${blogConfig.author.github}`,
        show: false,
        priority: 1,
      },
      twitter: {
        url: `https://twitter.com/${blogConfig.author.twitter}`,
        show: true,
        priority: 2,
      },
      bluesky: {
        url: `https://bsky.app/profile/${blogConfig.author.bluesky}`,
        show: true,
        priority: 3,
      },
      linkedin: {
        url: `https://linkedin.com/in/${blogConfig.author.linkedin}`,
        show: true,
        priority: 4,
      },
      discord: {
        url: `https://discord.gg/TCNdj3ahPz`,
        show: true,
        priority: 5,
      },
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
