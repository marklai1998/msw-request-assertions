import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    mockReset: true,
    coverage: {
      provider: 'v8',
      reporter: ['lcov', 'text'],
      include: ['src'],
      exclude: ['**/tests/**', '**/*.d.ts'],
    },
    setupFiles: ['./testHelpers/testSetup.js'],
  },
});
