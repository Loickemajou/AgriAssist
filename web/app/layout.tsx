import './globals.css'
import type { Metadata } from 'next'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'Gemination - AI Agricultural Assistant',
  description: 'Your intelligent farming companion powered by Google Gemini',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gemini-dark text-white">
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
        <Toaster position="top-center" />
      </body>
    </html>
  )
}
