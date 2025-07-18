import type { GraphQLRequestHandler, HttpRequestHandler } from "msw";
import type { expect } from "vitest";

export type AssertFn = Parameters<typeof expect.extend>[0][string];

export type HttpAssertion = {
  name: string;
  intercept: (original: HttpRequestHandler) => HttpRequestHandler;
  assert: AssertFn;
};

export type GraphQLAssertion = {
  name: string;
  intercept: (original: GraphQLRequestHandler) => GraphQLRequestHandler;
  assert: AssertFn;
};
