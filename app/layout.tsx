import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'JoCruit AI - Revolutionary AI Interview Platform',
  description: 'Advanced AI-powered interview platform with real-time emotion detection and cheating prevention',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-black antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
