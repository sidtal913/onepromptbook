import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { Navigation } from '@/components/ui/navigation'
import { Toaster } from 'sonner'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'OnePromptBook - Create Amazing Children\'s Books with AI',
  description: 'Transform a single prompt into a complete, illustrated children\'s book. AI-powered storytelling with professional-quality artwork, ready for publishing.',
  keywords: 'children\'s books, AI, book creation, illustrations, publishing, KDP, stories',
  authors: [{ name: 'OnePromptBook Team' }],
  creator: 'OnePromptBook',
  publisher: 'OnePromptBook',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://onepromptbook.com'),
  openGraph: {
    title: 'OnePromptBook - Create Amazing Children\'s Books with AI',
    description: 'Transform a single prompt into a complete, illustrated children\'s book. AI-powered storytelling with professional-quality artwork.',
    url: 'https://onepromptbook.com',
    siteName: 'OnePromptBook',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'OnePromptBook - AI-Powered Children\'s Book Creation',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OnePromptBook - Create Amazing Children\'s Books with AI',
    description: 'Transform a single prompt into a complete, illustrated children\'s book.',
    images: ['/og-image.jpg'],
    creator: '@onepromptbook',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className={`${inter.className} antialiased`}>
        <Navigation />
        <main>{children}</main>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'white',
              color: 'black',
              border: '1px solid #e5e7eb',
            },
          }}
        />
      </body>
    </html>
  )
}