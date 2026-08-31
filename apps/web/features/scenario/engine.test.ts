import { describe, expect, it } from 'vitest'
import { parseScenario, type Scenario } from '@lakon/sign-schema'
import { createScenarioEngine, summarizeRun } from './engine'
import { createLearningPhase, ESCAPE_AFTER_FAILURES, learningOrder } from './learning'

const scenario = (): Scenario =>
  parseScenario({
    id: 'uji',
    title: { id: 'Uji', en: 'Test' },
    sdg: [10],
    vocab: ['halo', 'kopi', 'terima-kasih'],
    estimatedMinutes: 5,
    nodes: [
      {
        id: 'sapa',
        actor: 'barista',
        line: { id: 'Halo!' },
        task: {
          deaf: { type: 'produce', sign: 'halo' },
          service: { type: 'receptive', sign: 'halo', options: ['halo', 'kopi'] },
        },
        next: 'pesan',
        onFail: 'repair-sapa',
      },
      {
        id: 'repair-sapa',
        actor: 'barista',
        line: { id: 'Bisa diulang?' },
        hint: 'Mulai dari sapaan.',
        next: 'sapa',
      },
      {
        id: 'pesan',
        actor: 'barista',
        line: { id: 'Mau apa?' },
        task: {
          deaf: { type: 'produce', sign: 'kopi' },
          service: { type: 'receptive', sign: 'kopi', options: ['kopi', 'halo'] },
        },
        next: 'tutup',
      },
      {
        id: 'tutup',
        actor: 'barista',
        line: { id: 'Terima kasih!' },
        task: {
          deaf: { type: 'produce', sign: 'terima-kasih' },
          service: {
            type: 'receptive',
            sign: 'terima-kasih',
            options: ['terima-kasih', 'halo'],
          },
        },
        next: null,
      },
    ],
  })

describe('createScenarioEngine', () => {
  it('berjalan simpul demi simpul sampai selesai', () => {
    const engine = createScenarioEngine(scenario(), 'deaf', () => 0)
    expect(engine.current()?.id).toBe('sapa')
    expect(engine.currentTask()).toEqual({ type: 'produce', sign: 'halo' })

    expect(engine.answer('benar')).toBe('next')
    expect(engine.current()?.id).toBe('pesan')
    expect(engine.answer('benar')).toBe('next')
    expect(engine.answer('benar')).toBe('selesai')
    expect(engine.isDone()).toBe(true)
    expect(engine.path()).toEqual(['sapa', 'pesan', 'tutup'])
  })

  it('jawaban salah membawa ke simpul perbaikan lalu kembali', () => {
    const engine = createScenarioEngine(scenario(), 'deaf', () => 0)
    expect(engine.answer('salah')).toBe('onFail')
    expect(engine.current()?.id).toBe('repair-sapa')
    expect(engine.currentTask()).toBeNull()
    expect(engine.continueNode()).toBe('next')
    expect(engine.current()?.id).toBe('sapa')
    expect(engine.attemptsAtCurrent()).toBe(1)
  })

  it('tugas mengikuti arah pengguna', () => {
    const engine = createScenarioEngine(scenario(), 'service', () => 0)
    const task = engine.currentTask()
    expect(task?.type).toBe('receptive')
    if (task?.type === 'receptive') expect(task.options).toContain('halo')
  })

  it('salah tanpa onFail tidak buntu: tetap di simpul dan bisa dilewati', () => {
    const engine = createScenarioEngine(scenario(), 'deaf', () => 0)
    engine.answer('benar')
    expect(engine.answer('salah')).toBe('stay')
    expect(engine.current()?.id).toBe('pesan')
    expect(engine.attemptsAtCurrent()).toBe(1)
    expect(engine.skip()).toBe('next')
    expect(engine.current()?.id).toBe('tutup')
  })

  it('ringkasan memisahkan isyarat dikuasai dan perlu diulang tanpa skor kompetitif', () => {
    const engine = createScenarioEngine(scenario(), 'deaf', () => 0)
    engine.answer('salah')
    engine.continueNode()
    engine.answer('benar')
    engine.answer('benar')
    engine.answer('benar')
    const summary = summarizeRun(engine, 0, 90000)
    expect(summary.completed).toBe(true)
    expect(summary.mastered.sort()).toEqual(['kopi', 'terima-kasih'])
    expect(summary.needsRepeat).toEqual(['halo'])
    expect(summary.durationMs).toBe(90000)
    expect(summary.path[0]).toBe('sapa')
    expect(Object.keys(summary)).not.toContain('score')
  })
})

describe('createLearningPhase', () => {
  it('mengurutkan isyarat sesuai kemunculan di skenario', () => {
    expect(learningOrder(scenario())).toEqual(['halo', 'kopi', 'terima-kasih'])
  })

  it('melacak penguasaan per isyarat', () => {
    const learning = createLearningPhase(scenario())
    expect(learning.next()).toBe('halo')
    learning.recordResult('halo', true)
    expect(learning.progressFor('halo')?.status).toBe('dikuasai')
    expect(learning.next()).toBe('kopi')
    expect(learning.isComplete()).toBe(false)
  })

  it('tiga kegagalan membuka jalan keluar penilaian sendiri', () => {
    const learning = createLearningPhase(scenario())
    for (let i = 0; i < ESCAPE_AFTER_FAILURES; i++) {
      learning.recordResult('halo', false)
    }
    const progress = learning.progressFor('halo')!
    expect(progress.escapeAvailable).toBe(true)
    expect(progress.status).toBe('berlatih')

    learning.selfAssessPass('halo')
    expect(learning.progressFor('halo')?.status).toBe('dinilai-sendiri')
    expect(learning.next()).toBe('kopi')
  })

  it('alur selalu bisa selesai', () => {
    const learning = createLearningPhase(scenario())
    for (const sign of learning.order()) {
      for (let i = 0; i < ESCAPE_AFTER_FAILURES; i++) learning.recordResult(sign, false)
      learning.selfAssessPass(sign)
    }
    expect(learning.isComplete()).toBe(true)
  })
})
