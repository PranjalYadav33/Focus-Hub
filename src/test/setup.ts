import '@testing-library/jest-dom'

// Extend expect with jest-dom matchers
expect.extend({
  toBeInTheDocument: (received) => {
    const pass = received && received.ownerDocument && received.ownerDocument.contains(received)
    return {
      pass,
      message: () => pass
        ? `Expected element not to be in the document`
        : `Expected element to be in the document`
    }
  }
})

// Ensure crypto.randomUUID exists in test env
if (typeof globalThis.crypto === 'undefined') {
  // @ts-ignore
  globalThis.crypto = {} as any
}
if (typeof (globalThis.crypto as any).randomUUID !== 'function') {
  ;(globalThis.crypto as any).randomUUID = () => '00000000-0000-4000-8000-000000000000'
}

// Mock BroadcastChannel for tests
global.BroadcastChannel = class MockBroadcastChannel {
  name: string
  onmessage: ((event: MessageEvent) => void) | null = null

  constructor(name: string) {
    this.name = name
  }

  postMessage(data: any) {
    // In tests, we can simulate message passing if needed
  }

  addEventListener(type: string, listener: (event: MessageEvent) => void) {
    if (type === 'message') {
      this.onmessage = listener
    }
  }

  removeEventListener(type: string, listener: (event: MessageEvent) => void) {
    if (type === 'message') {
      this.onmessage = null
    }
  }

  close() {}
}

