import localFont from 'next/font/local'
import {
  IBM_Plex_Sans,
  IBM_Plex_Serif,
  IBM_Plex_Mono,
} from 'next/font/google'
import Link from 'next/link'
import Image from 'next/image'
import { Analytics } from "@vercel/analytics/next"
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

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-ibm-plex-sans',
  display: 'swap',
})

const ibmPlexSerif = IBM_Plex_Serif({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-ibm-plex-serif',
  display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
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
    <html
      lang="en"
      className={`${atkinson.variable} ${ibmPlexSans.variable} ${ibmPlexSerif.variable} ${ibmPlexMono.variable}`}
    >
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
              <div className="flex items-center gap-6 font-sans">
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
        <Analytics />
      </body>
    </html>
  )
}
