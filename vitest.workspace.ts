import { defineWorkspace } from 'vitest/config'
import path from 'path'

export default defineWorkspace([
  {
    test: {
      environment: 'jsdom',
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  },
])

