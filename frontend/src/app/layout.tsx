import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import '@rainbow-me/rainbowkit/styles.css'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'
import AppProviders from '@/components/providers/AppProviders'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'CredPlay | Where Football Opinions Become Credibility',
  description: 'Turn your World Cup takes into proof of credibility. Create predictions, make free Yes/No calls, seed markets, and build your football reputation.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen overflow-y-scroll bg-[var(--background)] text-[var(--foreground)]">
        <AppProviders>
          <div className="mx-auto flex min-h-screen max-w-[1920px]">
            <header className="sticky top-0 hidden h-screen w-[92px] flex-shrink-0 flex-col border-r border-white/10 bg-black/55 md:flex xl:w-[300px]">
              <Sidebar />
            </header>

            <main className="min-w-0 flex-1">{children}</main>
          </div>
        </AppProviders>
      </body>
    </html>
  )
}
