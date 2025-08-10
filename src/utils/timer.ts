import { APP_CONFIG } from '@/utils/constants'
import { cas, getJSON, setJSON, subscribe, type StoreEvent } from '@/utils/store'

export type TimerStatus = 'idle' | 'running' | 'paused'

export interface TimerCompletionEvent {
  startTimeIso: string
  durationSec: number
  completed: boolean
}

export interface TimerState {
  status: TimerStatus
  durationSec: number
  // When session first started (authoritative session start)
  sessionStartMs: number | null
  // Last time the timer was resumed (used to compute running elapsed)
  lastResumeMs: number | null
  // Seconds consumed before the last resume
  consumedBeforeResumeSec: number
  lastUpdateMs: number
  // Optional one-shot completion event to be consumed by UI
  completion?: TimerCompletionEvent | null
}

const K = APP_CONFIG.STORAGE_KEYS.TIMER_STATE

const nowMs = () => Date.now()

export function readState(): TimerState {
  const s = getJSON<TimerState>(K, {
    status: 'idle',
    durationSec: 25 * 60,
    sessionStartMs: null,
    lastResumeMs: null,
    consumedBeforeResumeSec: 0,
    lastUpdateMs: nowMs(),
    completion: null,
  })

  // Normalize: ensure non-negative values
  if (s.consumedBeforeResumeSec < 0) s.consumedBeforeResumeSec = 0
  if (s.durationSec <= 0) s.durationSec = 25 * 60

  // Compute derived remaining and possibly finalize completion
  const { remainingSec, status } = computeRemaining(s)
  if (status === 'running' && remainingSec <= 0) {
    // Session finished — transition to idle and emit completion
    const completed: TimerCompletionEvent = {
      startTimeIso: new Date(s.sessionStartMs ?? nowMs()).toISOString(),
      durationSec: s.durationSec,
      completed: true,
    }
    const next: TimerState = {
      status: 'idle',
      durationSec: s.durationSec,
      sessionStartMs: null,
      lastResumeMs: null,
      consumedBeforeResumeSec: 0,
      lastUpdateMs: nowMs(),
      completion: completed,
    }
    setJSON(K, next)
    return next
  }

  return s
}

export function computeRemaining(s: TimerState): { remainingSec: number; status: TimerStatus } {
  if (s.status === 'idle') return { remainingSec: s.durationSec, status: 'idle' }
  if (s.status === 'paused') return { remainingSec: Math.max(0, s.durationSec - s.consumedBeforeResumeSec), status: 'paused' }
  const lr = s.lastResumeMs ?? s.lastUpdateMs
  const elapsedRunning = Math.floor((nowMs() - lr) / 1000)
  const consumed = s.consumedBeforeResumeSec + Math.max(0, elapsedRunning)
  const remaining = Math.max(0, s.durationSec - consumed)
  return { remainingSec: remaining, status: 'running' }
}

export function start(durationSec: number): TimerState {
  const start = nowMs()
  const next: TimerState = {
    status: 'running',
    durationSec: Math.max(60, Math.floor(durationSec)),
    sessionStartMs: start,
    lastResumeMs: start,
    consumedBeforeResumeSec: 0,
    lastUpdateMs: start,
    completion: null,
  }
  setJSON(K, next)
  return next
}

export function pause(): TimerState {
  return cas<TimerState>(K, (prev) => {
    if (prev.status !== 'running') return prev
    const { remainingSec } = computeRemaining(prev)
    const consumed = Math.max(0, prev.durationSec - remainingSec)
    return {
      ...prev,
      status: 'paused',
      lastResumeMs: null,
      consumedBeforeResumeSec: consumed,
      lastUpdateMs: nowMs(),
    }
  }, readState())
}

export function resume(): TimerState {
  return cas<TimerState>(K, (prev) => {
    if (prev.status !== 'paused') return prev
    return {
      ...prev,
      status: 'running',
      lastResumeMs: nowMs(),
      lastUpdateMs: nowMs(),
    }
  }, readState())
}

export function reset(recordPartial = true): TimerState {
  return cas<TimerState>(K, (prev) => {
    if (!recordPartial) {
      return {
        status: 'idle',
        durationSec: prev.durationSec,
        sessionStartMs: null,
        lastResumeMs: null,
        consumedBeforeResumeSec: 0,
        lastUpdateMs: nowMs(),
        completion: null,
      }
    }
    // If there was progress, emit partial event
    const { remainingSec } = computeRemaining(prev)
    const consumed = Math.max(0, prev.durationSec - remainingSec)
    const hadProgress = prev.status !== 'idle' && consumed > 0 && prev.sessionStartMs
    const completion = hadProgress
      ? { startTimeIso: new Date(prev.sessionStartMs!).toISOString(), durationSec: consumed, completed: false }
      : null
    return {
      status: 'idle',
      durationSec: prev.durationSec,
      sessionStartMs: null,
      lastResumeMs: null,
      consumedBeforeResumeSec: 0,
      lastUpdateMs: nowMs(),
      completion,
    }
  }, readState())
}

export function setDurationSec(nextDuration: number): TimerState {
  return cas<TimerState>(K, (prev) => {
    const durationSec = Math.max(60, Math.floor(nextDuration))
    if (prev.status === 'idle') {
      return { ...prev, durationSec, lastUpdateMs: nowMs() }
    }
    if (prev.status === 'paused') {
      // Adjust consumed to the new duration bounds
      const remaining = Math.max(0, durationSec - prev.consumedBeforeResumeSec)
      return { ...prev, durationSec, lastUpdateMs: nowMs(), consumedBeforeResumeSec: Math.max(0, durationSec - remaining) }
    }
    // running: leave running; remaining will be computed relative to the new duration
    return { ...prev, durationSec, lastUpdateMs: nowMs() }
  }, readState())
}

export function consumeCompletion(): TimerCompletionEvent | null {
  let event: TimerCompletionEvent | null = null
  cas<TimerState>(K, (prev) => {
    event = prev.completion ?? null
    if (!event) return prev
    return { ...prev, completion: null, lastUpdateMs: nowMs() }
  }, readState())
  return event
}

export function onStoreChange(cb: (state: TimerState, ev?: TimerCompletionEvent | null) => void) {
  return subscribe((e: StoreEvent) => {
    if (e.key !== K) return
    const state = e.value as TimerState
    cb(state, state.completion ?? null)
  })
}

export function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds))
  const mins = Math.floor(s / 60).toString().padStart(2, '0')
  const secs = (s % 60).toString().padStart(2, '0')
  return `${mins}:${secs}`
}

