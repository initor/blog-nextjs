import { siteConfig } from '@/config/site'
import { GithubOutlined, TwitterOutlined, LinkedinOutlined } from '@ant-design/icons'

export default function HomePage() {
  const { home } = siteConfig

  // Helper function to render social icon
  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'github':
        return <GithubOutlined className="text-2xl" />
      case 'twitter':
        return <TwitterOutlined className="text-2xl" />
      case 'linkedin':
        return <LinkedinOutlined className="text-2xl" />
      default:
        return null
    }
  }

  // Filter and sort visible social links
  const visibleSocialLinks = Object.entries(home.socialLinks)
    .filter(([, config]) => config.show)
    .sort((a, b) => a[1].priority - b[1].priority)

  return (
    <div className="max-w-2xl mx-auto text-center">
      <h1 className="text-4xl font-bold mb-4 font-serif">
        {home.title}
      </h1>

      <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-8 font-sans">
        {home.introduction}
      </p>

      <div className="flex justify-center space-x-6 mb-12">
        {visibleSocialLinks.map(([platform, config]) => (
          <a
            key={platform}
            href={config.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
            aria-label={`Visit ${platform} profile`}
          >
            {getSocialIcon(platform)}
          </a>
        ))}
      </div>
    </div>
  )
}
