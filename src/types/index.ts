import type { GraphQLRequestHandler, HttpRequestHandler } from 'msw';
import type { expect, Mock } from 'vitest';

export type AssertFn = Parameters<typeof expect.extend>[0][string];

export type Assertion = {
  name: string;
  interceptHttp?: (
    mockFn: () => Mock,
    original: HttpRequestHandler,
  ) => HttpRequestHandler;
  interceptGql?: (
    mockFn: () => Mock,
    original: GraphQLRequestHandler,
  ) => GraphQLRequestHandler;
  assert: AssertFn;
};
