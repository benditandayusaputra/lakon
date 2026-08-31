import type { Metadata } from 'next'
import { ServiceWorkerRegister } from '@/components/service-worker-register'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lakon',
  description: 'Belajar bahasa isyarat Indonesia lewat skenario transaksi nyata.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="bg-halaman text-teks min-h-dvh antialiased">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
