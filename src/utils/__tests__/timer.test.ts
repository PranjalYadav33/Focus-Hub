import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as timer from '../timer'

// Simple in-memory localStorage polyfill
class MemoryStorage {
  private m = new Map<string, string>()
  getItem(k: string) { return this.m.has(k) ? this.m.get(k)! : null }
  setItem(k: string, v: string) { this.m.set(k, v) }
  removeItem(k: string) { this.m.delete(k) }
  clear() { this.m.clear() }
}

function setupGlobals() {
  const storage = new MemoryStorage()
  // @ts-ignore
  global.window = { localStorage: storage }
  // @ts-ignore
  global.localStorage = storage
}

const base = new Date('2025-01-01T00:00:00Z')

describe('timer state machine', () => {
  beforeEach(() => {
    setupGlobals()
    vi.useFakeTimers()
    vi.setSystemTime(base)
  })

  it('starts running and counts down', () => {
    const s = timer.start(60) // 60 sec minimum
    let r = timer.computeRemaining(s)
    expect(r.status).toBe('running')
    expect(r.remainingSec).toBe(60)

    vi.advanceTimersByTime(3000)
    r = timer.computeRemaining(timer.readState())
    expect(r.remainingSec).toBe(57)
  })

  it('emits completion when time elapses', () => {
    timer.start(60)
    vi.advanceTimersByTime(61000)
    // Trigger read to finalize and then consume one-shot completion event
    timer.readState()
    const ev = timer.consumeCompletion()
    expect(ev).toBeTruthy()
    expect(ev!.completed).toBe(true)
    expect(ev!.durationSec).toBe(60)
    const s3 = timer.readState()
    const r3 = timer.computeRemaining(s3)
    expect(r3.status).toBe('idle')
  })

  it('pause and resume preserves progress', () => {
    timer.start(60)
    vi.advanceTimersByTime(5000)
    timer.pause()
    let r = timer.computeRemaining(timer.readState())
    expect(r.remainingSec).toBe(55)
    timer.resume()
    vi.advanceTimersByTime(2000)
    r = timer.computeRemaining(timer.readState())
    expect(r.remainingSec).toBe(53)
  })

  it('reset with partial=true emits incomplete session when progress made', () => {
    timer.start(60)
    vi.advanceTimersByTime(7000)
    timer.pause()
    timer.reset(true)
    const ev = timer.consumeCompletion()
    expect(ev).toBeTruthy()
    expect(ev!.completed).toBe(false)
    expect(ev!.durationSec).toBeGreaterThanOrEqual(7)
  })

  it('handles multiple pause/resume cycles correctly', () => {
    timer.start(120) // 2 minutes

    // Run for 30s, pause
    vi.advanceTimersByTime(30000)
    timer.pause()
    let r = timer.computeRemaining(timer.readState())
    expect(r.remainingSec).toBe(90)
    expect(r.status).toBe('paused')

    // Resume, run for 20s, pause again
    timer.resume()
    vi.advanceTimersByTime(20000)
    timer.pause()
    r = timer.computeRemaining(timer.readState())
    expect(r.remainingSec).toBe(70)

    // Final resume and completion
    timer.resume()
    vi.advanceTimersByTime(70000)
    const s = timer.readState()
    const ev = timer.consumeCompletion()
    expect(ev?.completed).toBe(true)
    expect(ev?.durationSec).toBe(120)
  })

  it('handles system time jumps gracefully', () => {
    timer.start(60)
    vi.advanceTimersByTime(10000) // 10s elapsed

    // Test that timer doesn't go negative on backward time jump
    vi.setSystemTime(new Date(Date.now() - 30000)) // Jump back 30s
    let r = timer.computeRemaining(timer.readState())
    expect(r.remainingSec).toBeGreaterThanOrEqual(0) // Should not go negative

    // Test that timer handles time jumps without breaking
    expect(r.status).toBe('running') // Should still be running
    expect(typeof r.remainingSec).toBe('number') // Should return valid number
  })

  it('setDurationSec adjusts running timer correctly', () => {
    timer.start(60)
    vi.advanceTimersByTime(20000) // 20s elapsed, 40s remaining

    // Extend duration while running
    timer.setDurationSec(120) // Change to 2 minutes
    let r = timer.computeRemaining(timer.readState())
    expect(r.remainingSec).toBe(100) // Should be 120 - 20 = 100s remaining
    expect(r.status).toBe('running')

    // Shorten duration while running
    timer.setDurationSec(90) // Change to 1.5 minutes
    r = timer.computeRemaining(timer.readState())
    expect(r.remainingSec).toBe(70) // Should be 90 - 20 = 70s remaining
  })

  it('prevents double completion events', () => {
    timer.start(60)
    vi.advanceTimersByTime(61000)

    // First read should emit completion
    timer.readState()
    const ev1 = timer.consumeCompletion()
    expect(ev1?.completed).toBe(true)

    // Second consumption should return null
    const ev2 = timer.consumeCompletion()
    expect(ev2).toBeNull()

    // Third read should not emit another completion
    timer.readState()
    const ev3 = timer.consumeCompletion()
    expect(ev3).toBeNull()
  })
})

