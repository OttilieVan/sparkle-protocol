import type { Metadata } from 'next'
import { Geist, Geist_Mono, Playfair_Display, Barlow_Condensed, Dancing_Script, Lobster } from 'next/font/google'
import { SparkleProvider } from './providers'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })
const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
})

// Closest Google Fonts match to Quandary — bold condensed geometric with sharp cuts
const barlow = Barlow_Condensed({
  variable: '--font-barlow',
  subsets: ['latin'],
  weight: ['700', '800', '900'],
})

// Flowing script — used in Nav wordmark
const dancing = Dancing_Script({
  variable: '--font-dancing',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

// Lobster — hero display script, dense rounded letterforms, naturally bold
const lobster = Lobster({
  variable: '--font-lobster',
  subsets: ['latin'],
  weight: ['400'],
})

export const metadata: Metadata = {
  title: 'Sparkle Protocol — Existence into Liberty',
  description:
    "The world's first AI-DePIN education protocol. Mint logic as NFTs, fuel tuition with compute, evolve with AI-Reasoning.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${barlow.variable} ${dancing.variable} ${lobster.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" style={{ background: '#F8F9FA' }}>
        <SparkleProvider>{children}</SparkleProvider>
      </body>
    </html>
  )
}
