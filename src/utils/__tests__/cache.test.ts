import { describe, it, expect, beforeEach, vi } from 'vitest'
import { cleanupImageCache, getCacheSize, clearAllCaches, preloadCriticalResources } from '../cache'

// Mock caches API
const mockCache = {
  keys: vi.fn(),
  match: vi.fn(),
  delete: vi.fn(),
}

const mockCaches = {
  open: vi.fn().mockResolvedValue(mockCache),
  keys: vi.fn(),
  delete: vi.fn(),
}

// @ts-ignore
global.caches = mockCaches

// Mock navigator.storage
const mockStorage = {
  estimate: vi.fn().mockResolvedValue({ usage: 1024 * 1024 }) // 1MB
}

Object.defineProperty(navigator, 'storage', {
  writable: true,
  value: mockStorage,
})

describe('cache utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.head.innerHTML = '' // Clear any preloaded links
  })

  it('cleanupImageCache removes oldest entries when over limit', async () => {
    const mockRequests = Array.from({ length: 60 }, (_, i) => ({ url: `image-${i}.jpg` }))
    const mockResponses = mockRequests.map((req, i) => ({
      headers: {
        get: vi.fn().mockReturnValue(new Date(Date.now() - (60 - i) * 1000).toISOString()) // Older = smaller index
      }
    }))

    mockCache.keys.mockResolvedValue(mockRequests)
    mockCache.match.mockImplementation((req: any) => {
      const index = mockRequests.findIndex(r => r.url === req.url)
      return Promise.resolve(mockResponses[index])
    })

    await cleanupImageCache()

    // Should delete 10 oldest entries (60 - 50 limit)
    expect(mockCache.delete).toHaveBeenCalledTimes(10)
  })

  it('cleanupImageCache does nothing when under limit', async () => {
    const mockRequests = Array.from({ length: 30 }, (_, i) => ({ url: `image-${i}.jpg` }))
    mockCache.keys.mockResolvedValue(mockRequests)

    await cleanupImageCache()

    expect(mockCache.delete).not.toHaveBeenCalled()
  })

  it('getCacheSize returns storage estimate', async () => {
    const size = await getCacheSize()
    expect(size).toBe(1024 * 1024)
    expect(mockStorage.estimate).toHaveBeenCalled()
  })

  it('getCacheSize handles missing storage API', async () => {
    Object.defineProperty(navigator, 'storage', { writable: true, value: undefined })
    
    const size = await getCacheSize()
    expect(size).toBe(0)
  })

  it('clearAllCaches removes focus-hub caches', async () => {
    mockCaches.keys.mockResolvedValue([
      'focus-hub-v1',
      'focus-hub-images',
      'other-app-cache',
      'focus-hub-data'
    ])

    await clearAllCaches()

    expect(mockCaches.delete).toHaveBeenCalledTimes(3) // Only focus-hub caches
    expect(mockCaches.delete).toHaveBeenCalledWith('focus-hub-v1')
    expect(mockCaches.delete).toHaveBeenCalledWith('focus-hub-images')
    expect(mockCaches.delete).toHaveBeenCalledWith('focus-hub-data')
    expect(mockCaches.delete).not.toHaveBeenCalledWith('other-app-cache')
  })

  it('preloadCriticalResources adds preload links', () => {
    preloadCriticalResources()

    const preloadLinks = document.head.querySelectorAll('link[rel="preload"]')
    expect(preloadLinks.length).toBeGreaterThan(0)
    
    const iconLink = Array.from(preloadLinks).find(link => 
      (link as HTMLLinkElement).href.includes('app-icon.svg')
    ) as HTMLLinkElement
    
    expect(iconLink).toBeTruthy()
    expect(iconLink.as).toBe('image')
  })

  it('handles cache API errors gracefully', async () => {
    mockCaches.open.mockRejectedValue(new Error('Cache API not available'))

    // Should not throw
    await expect(cleanupImageCache()).resolves.toBeUndefined()
    await expect(clearAllCaches()).resolves.toBeUndefined()
  })
})
