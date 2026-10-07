/// <reference path="./jest.d.ts" />
import { expect, jest } from '@jest/globals';
import { http } from 'msw';
import { graphql } from 'msw/graphql';
import { graphqlAssertions, httpAssertions } from '../assertions/index.js';
import type { AssertFn } from '../types/index.js';

for (const key in http) {
  const original = http[key as keyof typeof http];
  http[key as keyof typeof http] = httpAssertions.reduce(
    (fn, { interceptHttp }) =>
      interceptHttp ? interceptHttp(jest.fn as any, fn) : fn,
    original,
  );
}

const originalLink = graphql.link.bind(graphql);
graphql.link = (url) => {
  const api = originalLink(url);

  api.query = graphqlAssertions.reduce(
    (fn, { interceptGql }) =>
      interceptGql ? interceptGql(jest.fn as any, fn) : fn,
    api.query,
  );

  api.mutation = graphqlAssertions.reduce(
    (fn, { interceptGql }) =>
      interceptGql ? interceptGql(jest.fn as any, fn) : fn,
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
  ) as any,
);
