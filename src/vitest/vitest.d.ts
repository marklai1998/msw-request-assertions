/// <reference types="vitest" />
/// <reference types="@vitest/expect" />

import type { HttpHandler, GraphQLHandler } from "msw";

interface CustomMatchers<R = unknown> {
  toHaveBeenRequested: () => R;
  toHaveBeenRequestedTimes: (times: number) => R;
  toHaveBeenRequestedWith: (options: Record<string, any>) => R;
  toHaveBeenNthRequestedWith: (
    nthCall: number,
    options: Record<string, any>,
  ) => R;
  toHaveBeenRequestedWithBody: (body: any) => R;
  toHaveBeenNthRequestedWithBody: (nthCall: number, body: any) => R;
  toHaveBeenRequestedWithHash: (hash: string) => R;
  toHaveBeenNthRequestedWithHash: (nthCall: number, hash: string) => R;
  toHaveBeenRequestedWithHeaders: (headers: Record<string, any>) => R;
  toHaveBeenNthRequestedWithHeaders: (
    nthCall: number,
    headers: Record<string, any>,
  ) => R;
  toHaveBeenRequestedWithJsonBody: (body: any) => R;
  toHaveBeenNthRequestedWithJsonBody: (nthCall: number, body: any) => R;
  toHaveBeenRequestedWithQueryString: (queryString: string) => R;
  toHaveBeenNthRequestedWithQueryString: (
    nthCall: number,
    queryString: string,
  ) => R;
  toHaveBeenCalledWithVariables: (variables: Record<string, any>) => R;
  toHaveBeenCalledNthWithVariables: (
    nthCall: number,
    variables: Record<string, any>,
  ) => R;
  toHaveBeenCalledWithQuery: (query: string) => R;
  toHaveBeenCalledNthWithQuery: (nthCall: number, query: string) => R;
}

declare module "vitest" {
  interface Matchers<T = unknown> extends CustomMatchers<T> {}

  interface Assertion<T = any> {
    toHaveBeenRequested: () => void;
    toHaveBeenRequestedTimes: (times: number) => void;
    toHaveBeenRequestedWith: (options: Record<string, any>) => void;
    toHaveBeenNthRequestedWith: (
      nthCall: number,
      options: Record<string, any>,
    ) => void;
    toHaveBeenRequestedWithBody: (body: any) => void;
    toHaveBeenNthRequestedWithBody: (nthCall: number, body: any) => void;
    toHaveBeenRequestedWithHash: (hash: string) => void;
    toHaveBeenNthRequestedWithHash: (nthCall: number, hash: string) => void;
    toHaveBeenRequestedWithHeaders: (headers: Record<string, any>) => void;
    toHaveBeenNthRequestedWithHeaders: (
      nthCall: number,
      headers: Record<string, any>,
    ) => void;
    toHaveBeenRequestedWithJsonBody: (body: any) => void;
    toHaveBeenNthRequestedWithJsonBody: (nthCall: number, body: any) => void;
    toHaveBeenRequestedWithQueryString: (queryString: string) => void;
    toHaveBeenNthRequestedWithQueryString: (
      nthCall: number,
      queryString: string,
    ) => void;
  }

  interface Assertion<GraphQLHandler> {
    toHaveBeenCalledWithVariables: (variables: Record<string, any>) => void;
    toHaveBeenCalledNthWithVariables: (
      nthCall: number,
      variables: Record<string, any>,
    ) => void;
    toHaveBeenCalledWithQuery: (query: string) => void;
    toHaveBeenCalledNthWithQuery: (nthCall: number, query: string) => void;
  }
}
