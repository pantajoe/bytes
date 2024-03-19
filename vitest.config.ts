import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    clearMocks: true,
    globals: true,
    restoreMocks: true,
    watch: false,
  },
})
