import { graphql, http } from 'msw';
import { expect } from 'vitest';
import { graphqlAssertions, httpAssertions } from '../assertions/index.js';
import type { AssertFn } from '../types/index.js';
import './vitest.d.ts';

for (const key in http) {
  const original = http[key as keyof typeof http];
  http[key as keyof typeof http] = httpAssertions.reduce(
    (fn, { interceptHttp }) => (interceptHttp ? interceptHttp(vi.fn, fn) : fn),
    original,
  );
}

const originalQuery = graphql.query;
const originalMutation = graphql.mutation;

graphql.query = graphqlAssertions.reduce(
  (fn, { interceptGql }) => (interceptGql ? interceptGql(vi.fn, fn) : fn),
  originalQuery,
);

graphql.mutation = graphqlAssertions.reduce(
  (fn, { interceptGql }) => (interceptGql ? interceptGql(vi.fn, fn) : fn),
  originalMutation,
);

expect.extend(
  [...httpAssertions, ...graphqlAssertions].reduce<Record<string, AssertFn>>(
    (acc, { name, assert }) => {
      acc[name] = assert;
      return acc;
    },
    {},
  ),
);
