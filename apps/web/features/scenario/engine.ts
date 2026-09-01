import type { Scenario, ScenarioNode, ScenarioTask } from '@lakon/sign-schema'

export type Direction = 'deaf' | 'service'

export type StepOutcome = 'benar' | 'salah'

export type ScenarioEvent = {
  nodeId: string
  sign: string | null
  outcome: StepOutcome | 'lanjut' | 'lewati'
  at: number
}

export type AdvanceResult = 'next' | 'onFail' | 'stay' | 'selesai'

export type ScenarioEngine = {
  current: () => ScenarioNode | null
  currentTask: () => ScenarioTask | null
  attemptsAtCurrent: () => number
  isDone: () => boolean
  path: () => readonly string[]
  events: () => readonly ScenarioEvent[]
  answer: (outcome: StepOutcome, at?: number) => AdvanceResult
  continueNode: (at?: number) => AdvanceResult
  skip: (at?: number) => AdvanceResult
  reset: () => void
}

export const createScenarioEngine = (
  scenario: Scenario,
  direction: Direction,
  now: () => number = () => Date.now(),
): ScenarioEngine => {
  const nodesById = new Map(scenario.nodes.map((node) => [node.id, node]))
  const startId = scenario.nodes[0]?.id ?? null

  let currentId: string | null = startId
  let failuresByNode = new Map<string, number>()
  let path: string[] = startId ? [startId] : []
  let events: ScenarioEvent[] = []

  const node = (): ScenarioNode | null => (currentId ? (nodesById.get(currentId) ?? null) : null)

  const moveTo = (nextId: string | null): AdvanceResult => {
    currentId = nextId
    if (nextId === null) return 'selesai'
    path.push(nextId)
    return 'next'
  }

  const record = (outcome: ScenarioEvent['outcome'], at: number) => {
    const active = node()
    if (!active) return
    const task = active.task ? active.task[direction] : null
    events.push({
      nodeId: active.id,
      sign: task && task.type !== 'point' ? task.sign : null,
      outcome,
      at,
    })
  }

  return {
    current: node,
    currentTask: () => {
      const active = node()
      return active?.task ? active.task[direction] : null
    },
    attemptsAtCurrent: () => (currentId ? (failuresByNode.get(currentId) ?? 0) : 0),
    isDone: () => currentId === null,
    path: () => path,
    events: () => events,
    answer(outcome, at = now()) {
      const active = node()
      if (!active) return 'selesai'
      record(outcome, at)
      if (outcome === 'benar') {
        failuresByNode.set(active.id, 0)
        return moveTo(active.next)
      }
      failuresByNode.set(active.id, (failuresByNode.get(active.id) ?? 0) + 1)
      if (active.onFail && nodesById.has(active.onFail)) {
        currentId = active.onFail
        path.push(active.onFail)
        return 'onFail'
      }
      return 'stay'
    },
    continueNode(at = now()) {
      const active = node()
      if (!active) return 'selesai'
      record('lanjut', at)
      return moveTo(active.next)
    },
    skip(at = now()) {
      const active = node()
      if (!active) return 'selesai'
      record('lewati', at)
      return moveTo(active.next)
    },
    reset() {
      currentId = startId
      failuresByNode = new Map()
      path = startId ? [startId] : []
      events = []
    },
  }
}

export type ScenarioSummary = {
  mastered: string[]
  needsRepeat: string[]
  durationMs: number
  path: string[]
  completed: boolean
}

export const summarizeRun = (
  engine: Pick<ScenarioEngine, 'events' | 'path' | 'isDone'>,
  startedAt: number,
  endedAt: number,
): ScenarioSummary => {
  const failures = new Set<string>()
  const seen = new Set<string>()
  for (const event of engine.events()) {
    if (!event.sign) continue
    seen.add(event.sign)
    if (event.outcome === 'salah' || event.outcome === 'lewati') failures.add(event.sign)
  }
  const mastered = [...seen].filter((sign) => !failures.has(sign))
  return {
    mastered,
    needsRepeat: [...failures],
    durationMs: Math.max(0, endedAt - startedAt),
    path: [...engine.path()],
    completed: engine.isDone(),
  }
}
