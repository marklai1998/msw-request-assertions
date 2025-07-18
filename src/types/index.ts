import type { GraphQLRequestHandler, HttpRequestHandler } from "msw";
import type { expect } from "vitest";

export type AssertFn = Parameters<typeof expect.extend>[0][string];

export type Assertion = {
  name: string;
  interceptHttp?: (original: HttpRequestHandler) => HttpRequestHandler;
  interceptGql?: (original: GraphQLRequestHandler) => GraphQLRequestHandler;
  assert: AssertFn;
};
