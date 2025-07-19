import copy from "rollup-plugin-copy";
import { dts } from "rollup-plugin-dts";
import esbuild from "rollup-plugin-esbuild";
import { nodeExternals } from "rollup-plugin-node-externals";
import peerDepsExternal from "rollup-plugin-peer-deps-external";

const input = {
  index: "src/index.ts",
  "vitest/index": "src/vitest/index.ts",
  "jest/index": "src/jest/index.ts",
};

export default [
  {
    input,
    plugins: [
      nodeExternals(),
      peerDepsExternal(),
      esbuild(),
      copy({
        targets: [
          {
            src: "src/vitest/vitest.d.ts",
            dest: "dist/esm/vitest",
            rename: "vitest.d.ts",
          },
          {
            src: "src/vitest/vitest.d.ts",
            dest: "dist/cjs/vitest",
            rename: "vitest.d.cts",
          },
          {
            src: "src/jest/jest.d.ts",
            dest: "dist/esm/jest",
            rename: "jest.d.ts",
          },
          {
            src: "src/jest/jest.d.ts",
            dest: "dist/cjs/jest",
            rename: "jest.d.cts",
          },
        ],
      }),
    ],
    output: [
      {
        dir: "dist/esm",
        format: "es",
        sourcemap: true,
        entryFileNames: "[name].mjs",
        chunkFileNames: "[name]-[hash].mjs",
      },
      {
        dir: "dist/cjs",
        format: "cjs",
        interop: "auto",
        sourcemap: true,
        entryFileNames: "[name].cjs",
        chunkFileNames: "[name]-[hash].cjs",
      },
    ],
  },
];
