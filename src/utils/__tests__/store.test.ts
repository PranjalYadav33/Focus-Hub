import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getJSON, setJSON, cas, updateList, subscribe, type StoreEvent } from '../store'

class MemoryStorage {
  private m = new Map<string, string>()
  getItem(k: string) { return this.m.has(k) ? this.m.get(k)! : null }
  setItem(k: string, v: string) { this.m.set(k, v) }
  removeItem(k: string) { this.m.delete(k) }
  clear() { this.m.clear() }
}

class FakeBC {
  listeners: Array<(e: MessageEvent<StoreEvent>) => void> = []
  postMessage = vi.fn((data: StoreEvent) => {
    const evt = { data } as MessageEvent<StoreEvent>
    this.listeners.forEach(l => l(evt))
  })
  addEventListener(_: 'message', cb: (e: MessageEvent<StoreEvent>) => void) { this.listeners.push(cb) }
  removeEventListener(_: 'message', cb: (e: MessageEvent<StoreEvent>) => void) { this.listeners = this.listeners.filter(x => x !== cb) }
}

function setup() {
  const storage = new MemoryStorage()
  // @ts-ignore
  global.window = { localStorage: storage, BroadcastChannel: FakeBC }
  // @ts-ignore
  global.localStorage = storage
}

describe('store utils', () => {
  beforeEach(() => setup())

  it('getJSON/setJSON round trips and publishes events', () => {
    const events: StoreEvent[] = []
    const unsub = subscribe(e => events.push(e))
    setJSON('k', { a: 1 })
    expect(getJSON('k', null as any)).toEqual({ a: 1 })
    expect(events.length).toBe(1)
    expect(events[0].key).toBe('k')
    unsub()
  })

  it('cas applies atomic compute and publishes once', () => {
    setJSON('sum', 1)
    const next = cas<number>('sum', (prev) => prev + 2, 0)
    expect(next).toBe(3)
    expect(getJSON('sum', 0)).toBe(3)
  })

  it('updateList caps list length', () => {
    updateList<number>('arr', () => Array.from({ length: 10 }, (_, i) => i + 1), 5)
    const arr = getJSON<number[]>('arr', [])
    expect(arr.length).toBe(5)
    expect(arr).toEqual([1,2,3,4,5])
  })

  it('BroadcastChannel fan-out works across multiple subscribers', () => {
    const events1: StoreEvent[] = []
    const events2: StoreEvent[] = []
    const unsub1 = subscribe(e => events1.push(e))
    const unsub2 = subscribe(e => events2.push(e))

    setJSON('broadcast-test', { value: 42 })

    expect(events1.length).toBe(1)
    expect(events2.length).toBe(1)
    expect(events1[0]).toEqual(events2[0])
    expect(events1[0].key).toBe('broadcast-test')
    expect(events1[0].value).toEqual({ value: 42 })

    unsub1()
    unsub2()
  })

  it('cas handles concurrent updates correctly', () => {
    setJSON('counter', 0)

    // Simulate concurrent CAS operations
    const result1 = cas<number>('counter', (prev) => prev + 1, 0)
    const result2 = cas<number>('counter', (prev) => prev + 10, 0)

    expect(result1).toBe(1)
    expect(result2).toBe(11) // Should see the updated value from first CAS
    expect(getJSON('counter', 0)).toBe(11)
  })

  it('updateList preserves order and handles empty arrays', () => {
    // Test with empty initial state
    updateList<string>('empty-list', (prev) => [...prev, 'first'], 10)
    expect(getJSON<string[]>('empty-list', [])).toEqual(['first'])

    // Test order preservation
    updateList<string>('empty-list', (prev) => ['second', ...prev], 10)
    expect(getJSON<string[]>('empty-list', [])).toEqual(['second', 'first'])

    // Test capping with order
    updateList<number>('capped', () => [1, 2, 3, 4, 5], 3)
    expect(getJSON<number[]>('capped', [])).toEqual([1, 2, 3])
  })

  it('handles corrupted JSON gracefully', () => {
    // Manually corrupt localStorage
    const storage = (global as any).localStorage as MemoryStorage
    storage.setItem('corrupted', '{invalid json}')

    // Should return fallback without throwing
    expect(getJSON('corrupted', 'fallback')).toBe('fallback')

    // Should not crash on setJSON after corruption
    expect(() => setJSON('corrupted', 'fixed')).not.toThrow()
    expect(getJSON('corrupted', 'fallback')).toBe('fixed')
  })
})

