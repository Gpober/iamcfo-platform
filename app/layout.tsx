import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'I AM CFO - Real-Time Financial Intelligence',
  description: 'AI-powered dashboards for businesses doing $2M-$25M in revenue. See exactly where every dollar goes with real-time QuickBooks sync.',
  keywords: ['CFO', 'financial intelligence', 'QuickBooks', 'cash flow', 'property P&L', 'multi-unit business'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
