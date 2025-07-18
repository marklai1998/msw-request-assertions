import type { expect } from "vitest";

export type AssertFn = Parameters<typeof expect.extend>[0][string];
