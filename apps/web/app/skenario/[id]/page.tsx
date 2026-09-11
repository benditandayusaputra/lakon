import { Suspense } from 'react'
import type { Metadata } from 'next'
import { Caveat } from 'next/font/google'
import { KameraSesi } from '@/components/kamera-sesi'
import { ScenarioFlow } from '@/components/scenario-flow'
import { KedaiKopiFlow } from '@/components/scenes/kedai-kopi/flow'
import { PuskesmasFlow } from '@/components/scenes/puskesmas/flow'
import { TransportasiFlow } from '@/components/scenes/transportasi/flow'
import { WawancaraKerjaFlow } from '@/components/scenes/wawancara-kerja/flow'
import { DaruratFlow } from '@/components/scenes/darurat/flow'

const caveat = Caveat({ subsets: ['latin'], variable: '--font-kapur' })

export const metadata: Metadata = { title: 'Skenario | Lakon' }

export default async function ScenarioDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (
    id === 'kedai-kopi' ||
    id === 'puskesmas' ||
    id === 'transportasi' ||
    id === 'wawancara-kerja' ||
    id === 'darurat'
  ) {
    return (
      <div className={caveat.variable}>
        <KameraSesi />
        <Suspense fallback={<p className="p-10">Memuat…</p>}>
          {id === 'kedai-kopi' ? (
            <KedaiKopiFlow />
          ) : id === 'puskesmas' ? (
            <PuskesmasFlow />
          ) : id === 'transportasi' ? (
            <TransportasiFlow />
          ) : id === 'wawancara-kerja' ? (
            <WawancaraKerjaFlow />
          ) : (
            <DaruratFlow />
          )}
        </Suspense>
      </div>
    )
  }
  return (
    <>
      <KameraSesi />
      <Suspense fallback={<p className="p-10">Memuat…</p>}>
        <ScenarioFlow scenarioId={id} />
      </Suspense>
    </>
  )
}
