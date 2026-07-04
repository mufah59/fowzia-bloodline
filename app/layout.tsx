import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Providers from '@/components/Providers'

export const metadata: Metadata = {
  title:       { default: 'Fowzia Bloodline', template: '%s | Fowzia Bloodline' },
  description: 'A trusted blood donor network connecting verified donors with those in need. Built in honor of a mother\'s legacy.',
  keywords:    ['blood donation', 'blood bank', 'donor', 'Bangladesh', 'Fowzia Bloodline'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  openGraph: {
    title:       'Fowzia Bloodline',
    description: 'Connect with verified blood donors in your area. Fast, trustworthy, life-saving.',
    type:        'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { borderRadius: '12px', background: '#1A1A2E', color: '#fff', fontSize: '14px' },
              success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
              error:   { iconTheme: { primary: '#C41E3A', secondary: '#fff' } },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
