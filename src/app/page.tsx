import { siteConfig } from '@/config/site'

export default function HomePage() {
  const { home } = siteConfig

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

      <div className="flex justify-center items-center gap-4 mb-12 font-sans">
        {visibleSocialLinks.map(([platform, config], index) => (
          <div key={platform} className="flex items-center">
            <a
              href={config.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
              aria-label={`Visit ${platform} profile`}
            >
              {platform.toLowerCase()}
            </a>
            {index < visibleSocialLinks.length - 1 && (
              <span className="ml-4 text-zinc-300 dark:text-zinc-600">/</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
