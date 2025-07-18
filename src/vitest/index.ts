import { graphql, http } from "msw";
import { expect } from "vitest";
import { toHaveBeenCalledNthWithVariables } from "../assertions/toHaveBeenCalledWithVariables/toHaveBeenCalledNthWithVariables.js";
import { toHaveBeenCalledWithVariables } from "../assertions/toHaveBeenCalledWithVariables/toHaveBeenCalledWithVariables.js";
import { toHaveBeenRequested } from "../assertions/toHaveBeenRequested/toHaveBeenRequested";
import { toHaveBeenRequestedTimes } from "../assertions/toHaveBeenRequested/toHaveBeenRequestedTimes";
import { toHaveBeenNthRequestedWith } from "../assertions/toHaveBeenRequestedWith/toHaveBeenNthRequestedWith";
import { toHaveBeenRequestedWith } from "../assertions/toHaveBeenRequestedWith/toHaveBeenRequestedWith";
import { toHaveBeenNthRequestedWithBody } from "../assertions/toHaveBeenRequestedWithBody/toHaveBeenNthRequestedWithBody";
import { toHaveBeenRequestedWithBody } from "../assertions/toHaveBeenRequestedWithBody/toHaveBeenRequestedWithBody";
import { toHaveBeenNthRequestedWithHash } from "../assertions/toHaveBeenRequestedWithHash/toHaveBeenNthRequestedWithHash";
import { toHaveBeenRequestedWithHash } from "../assertions/toHaveBeenRequestedWithHash/toHaveBeenRequestedWithHash";
import { toHaveBeenNthRequestedWithHeaders } from "../assertions/toHaveBeenRequestedWithHeaders/toHaveBeenNthRequestedWithHeaders";
import { toHaveBeenRequestedWithHeaders } from "../assertions/toHaveBeenRequestedWithHeaders/toHaveBeenRequestedWithHeaders";
import { toHaveBeenNthRequestedWithJsonBody } from "../assertions/toHaveBeenRequestedWithJsonBody/toHaveBeenNthRequestedWithJsonBody";
import { toHaveBeenRequestedWithJsonBody } from "../assertions/toHaveBeenRequestedWithJsonBody/toHaveBeenRequestedWithJsonBody";
import { toHaveBeenNthRequestedWithQuery } from "../assertions/toHaveBeenRequestedWithQuery/toHaveBeenNthRequestedWithQuery.js";
import { toHaveBeenRequestedWithQuery } from "../assertions/toHaveBeenRequestedWithQuery/toHaveBeenRequestedWithQuery.js";
import type { AssertFn } from "../types";

const httpOnlyAssertions = [
  toHaveBeenRequestedWithBody,
  toHaveBeenNthRequestedWithBody,
  toHaveBeenRequestedWithJsonBody,
  toHaveBeenNthRequestedWithJsonBody,
  toHaveBeenRequestedWithHeaders,
  toHaveBeenNthRequestedWithHeaders,
  toHaveBeenNthRequestedWithQuery,
  toHaveBeenRequestedWithQuery,
  toHaveBeenRequestedWithHash,
  toHaveBeenNthRequestedWithHash,
];

const graphqlOnlyAssertions = [
  toHaveBeenCalledWithVariables,
  toHaveBeenCalledNthWithVariables,
];

const hybridAssertions = [
  toHaveBeenRequested,
  toHaveBeenRequestedTimes,
  toHaveBeenRequestedWith,
  toHaveBeenNthRequestedWith,
];

const httpAssertions = [...httpOnlyAssertions, ...hybridAssertions];
const graphqlAssertions = [...graphqlOnlyAssertions, ...hybridAssertions];

for (const key in http) {
  const original = http[key as keyof typeof http];
  http[key as keyof typeof http] = httpAssertions.reduce(
    (fn, { interceptHttp }) => (interceptHttp ? interceptHttp(fn) : fn),
    original,
  );
}

const originalQuery = graphql.query;
const originalMutation = graphql.mutation;

graphql.query = graphqlAssertions.reduce(
  (fn, { interceptGql }) => (interceptGql ? interceptGql(fn) : fn),
  originalQuery,
);

graphql.mutation = graphqlAssertions.reduce(
  (fn, { interceptGql }) => (interceptGql ? interceptGql(fn) : fn),
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
