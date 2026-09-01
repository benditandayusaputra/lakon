import { Suspense } from 'react'
import type { Metadata } from 'next'
import { Caveat } from 'next/font/google'
import { ScenarioFlow } from '@/components/scenario-flow'
import { KedaiKopiFlow } from '@/components/kedai-kopi-flow'

const caveat = Caveat({ subsets: ['latin'], variable: '--font-kapur' })

export const metadata: Metadata = { title: 'Skenario | Lakon' }

export default async function ScenarioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (id === 'kedai-kopi') {
    return (
      <div className={caveat.variable}>
        <Suspense fallback={<p className="p-10">Memuat…</p>}>
          <KedaiKopiFlow />
        </Suspense>
      </div>
    )
  }
  return (
    <Suspense fallback={<p className="p-10">Memuat…</p>}>
      <ScenarioFlow scenarioId={id} />
    </Suspense>
  )
}
