import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lakon',
  description: 'Belajar bahasa isyarat Indonesia lewat skenario transaksi nyata.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-dvh bg-paper text-ink antialiased">{children}</body>
    </html>
  )
}
