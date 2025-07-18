import type { HttpRequestHandler } from "msw";
import type { expect } from "vitest";

export type AssertFn = Parameters<typeof expect.extend>[0][string];

export type HttpAssertion = {
  name: string;
  intercept: (original: HttpRequestHandler) => HttpRequestHandler;
  assert: AssertFn;
};
