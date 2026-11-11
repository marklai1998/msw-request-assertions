import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'vitest/index': 'src/vitest/index.ts',
    'jest/index': 'src/jest/index.ts',
  },
  platform: 'node',
  target: 'node22',
  sourcemap: true,
  dts: true,
  deps: { neverBundle: true },
  format: 'esm',
  outDir: 'dist',
  clean: true,
  outExtensions: () => ({ js: '.js', dts: '.d.ts' }),
  copy: [
    {
      from: 'src/vitest/vitest.d.ts',
      to: 'dist/vitest',
      rename: 'vitest.d.ts',
    },
    { from: 'src/jest/jest.d.ts', to: 'dist/jest', rename: 'jest.d.ts' },
  ],
});
