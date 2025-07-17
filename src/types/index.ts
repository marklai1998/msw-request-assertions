import type { expect } from "vitest";

export type assertFn = Parameters<typeof expect.extend>[0][string];
