import localFont from 'next/font/local'
import Link from 'next/link'
import Image from 'next/image'
import { GoogleAnalytics } from '@next/third-parties/google'
import './globals.css'

const atkinson = localFont({
  src: [
    {
      path: '../fonts/Atkinson-Hyperlegible-Regular-102.woff',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/Atkinson-Hyperlegible-Bold-102.woff',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../fonts/Atkinson-Hyperlegible-Italic-102.woff',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../fonts/Atkinson-Hyperlegible-BoldItalic-102.woff',
      weight: '700',
      style: 'italic',
    },
  ],
  variable: '--font-atkinson',
})

export const metadata = {
  title: 'Wayne Wen',
  description: 'Personal blog',
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: 'any',
      },
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: [
      {
        url: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${atkinson.variable}`}>
      <body>
        <header className="border-b border-zinc-800/10 dark:border-zinc-100/10 py-4">
          <nav className="container mx-auto px-4">
            <div className="flex justify-between items-center">
              <Link
                  href="/"
                  className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
              >
                <Image
                  src="/wawen_logo.png"
                  alt="Wayne Wen Logo"
                  width={40}
                  height={40}
                  className="w-auto h-8"
                  priority
                />
              </Link>
              <div className="space-x-6 font-sans">
                <Link
                  href="/about"
                  className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                >
                  about
                </Link>
                <Link
                  href="/blog"
                  className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                >
                  blog
                </Link>
              </div>
            </div>
          </nav>
        </header>
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="border-t border-zinc-800/10 dark:border-zinc-100/10 py-4 mt-8">
          <div className="container mx-auto px-4 text-center text-zinc-600 dark:text-zinc-400">
            © {new Date().getFullYear()} Wayne Wen
          </div>
        </footer>
        <GoogleAnalytics gaId="G-P9BJ1DCTPB" />
      </body>
    </html>
  )
}
