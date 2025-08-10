import { describe, it, expect, beforeEach, vi } from 'vitest'
import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { act } from 'react'
import { DataProvider, useData } from '../DataContext'

class MemoryStorage {
  private m = new Map<string, string>()
  getItem(k: string) { return this.m.has(k) ? this.m.get(k)! : null }
  setItem(k: string, v: string) { this.m.set(k, v) }
  removeItem(k: string) { this.m.delete(k) }
  clear() { this.m.clear() }
}

function setupDOM() {
  // jsdom provides document/window; only need storage and BC polyfills
  // @ts-ignore
  global.window = Object.assign(window, { localStorage: new MemoryStorage(), BroadcastChannel: class { postMessage(){} addEventListener(){} removeEventListener(){} } })
  // @ts-ignore
  global.localStorage = (window as any).localStorage
  const div = document.createElement('div')
  document.body.appendChild(div)
  return div
}

function TestHarness() {
  const ctx = useData()
  useEffect(() => {
    ;(window as any).__ctx = ctx
  })
  return null
}

describe.skip('DataContext basic ops (requires full testing library setup)', () => {
  beforeEach(() => {
    setupDOM()
  })

  it('adds and toggles a task', async () => {
    const container = setupDOM()
    const root = createRoot(container as any)
    await act(async () => {
      root.render(<DataProvider><TestHarness /></DataProvider>)
    })
    const ctx: any = (window as any).__ctx

    await act(async () => {
      ctx.addTask({ title: 'A', description: '', priority: 'medium' })
    })
    expect(ctx.tasks.length).toBe(1)
    const id = ctx.tasks[0].id

    await act(async () => {
      ctx.toggleTaskCompletion(id)
    })
    expect(ctx.tasks[0].completed).toBe(true)
  })
})

