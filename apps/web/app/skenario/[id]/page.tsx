import { Suspense } from 'react'
import type { Metadata } from 'next'
import { ScenarioFlow } from '@/components/scenario-flow'

export const metadata: Metadata = { title: 'Skenario | Lakon' }

export default async function ScenarioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <Suspense fallback={<p className="p-10">Memuat…</p>}>
      <ScenarioFlow scenarioId={id} />
    </Suspense>
  )
}
