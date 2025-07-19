import { expect, jest } from "@jest/globals";
import { graphql, http } from "msw";
import { graphqlAssertions, httpAssertions } from "../assertions/index.js";
import type { AssertFn } from "../types/index.js";
import "./jest.d.ts";

for (const key in http) {
  const original = http[key as keyof typeof http];
  http[key as keyof typeof http] = httpAssertions.reduce(
    (fn, { interceptHttp }) =>
      interceptHttp ? interceptHttp(jest.fn as any, fn) : fn,
    original,
  );
}

const originalQuery = graphql.query;
const originalMutation = graphql.mutation;

graphql.query = graphqlAssertions.reduce(
  (fn, { interceptGql }) =>
    interceptGql ? interceptGql(jest.fn as any, fn) : fn,
  originalQuery,
);

graphql.mutation = graphqlAssertions.reduce(
  (fn, { interceptGql }) =>
    interceptGql ? interceptGql(jest.fn as any, fn) : fn,
  originalMutation,
);

expect.extend(
  [...httpAssertions, ...graphqlAssertions].reduce<Record<string, AssertFn>>(
    (acc, { name, assert }) => {
      acc[name] = assert;
      return acc;
    },
    {},
  ) as any,
);
