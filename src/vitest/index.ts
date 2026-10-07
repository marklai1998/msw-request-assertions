/// <reference path="./vitest.d.ts" />
import { http } from 'msw';
import { graphql } from 'msw/graphql';
import { expect } from 'vitest';
import { graphqlAssertions, httpAssertions } from '../assertions/index.js';
import type { AssertFn } from '../types/index.js';
import { installRequestHashCapture } from '../utils/captureRequestHash.js';

installRequestHashCapture();

for (const key in http) {
  const original = http[key as keyof typeof http];
  http[key as keyof typeof http] = httpAssertions.reduce(
    (fn, { interceptHttp }) => (interceptHttp ? interceptHttp(vi.fn, fn) : fn),
    original,
  );
}

const originalLink = graphql.link.bind(graphql);
graphql.link = (url) => {
  const api = originalLink(url);

  api.query = graphqlAssertions.reduce(
    (fn, { interceptGql }) => (interceptGql ? interceptGql(vi.fn, fn) : fn),
    api.query,
  );

  api.mutation = graphqlAssertions.reduce(
    (fn, { interceptGql }) => (interceptGql ? interceptGql(vi.fn, fn) : fn),
    api.mutation,
  );

  return api;
};

expect.extend(
  [...httpAssertions, ...graphqlAssertions].reduce<Record<string, AssertFn>>(
    (acc, { name, assert }) => {
      acc[name] = assert;
      return acc;
    },
    {},
  ),
);
