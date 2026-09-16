import { defineConfig } from 'tsdown';

const entry = {
  index: 'src/index.ts',
  'vitest/index': 'src/vitest/index.ts',
  'jest/index': 'src/jest/index.ts',
};

const shared = {
  entry,
  platform: 'node' as const,
  target: 'node18',
  sourcemap: true,
  dts: true,
  deps: { neverBundle: true as const },
};

export default defineConfig([
  {
    ...shared,
    format: 'esm',
    outDir: 'dist/esm',
    clean: true,
    outExtensions: () => ({ js: '.mjs', dts: '.d.ts' }),
    copy: [
      {
        from: 'src/vitest/vitest.d.ts',
        to: 'dist/esm/vitest',
        rename: 'vitest.d.ts',
      },
      {
        from: 'src/jest/jest.d.ts',
        to: 'dist/esm/jest',
        rename: 'jest.d.ts',
      },
    ],
  },
  {
    ...shared,
    format: 'cjs',
    outDir: 'dist/cjs',
    clean: false,
    outExtensions: () => ({ js: '.cjs', dts: '.d.cts' }),
    copy: [
      {
        from: 'src/vitest/vitest.d.ts',
        to: 'dist/cjs/vitest',
        rename: 'vitest.d.cts',
      },
      {
        from: 'src/jest/jest.d.ts',
        to: 'dist/cjs/jest',
        rename: 'jest.d.cts',
      },
    ],
  },
]);
