/// <reference types="vitest" />
/// <reference types="@vitest/expect" />

import type { HttpHandler, GraphQLHandler } from "msw";

interface CustomMatchers<R = unknown> {
  toHaveBeenRequestedWithJsonBody: (payload: unknown) => R;
  toHaveBeenNthRequestedWithJsonBody: (
    callIndex: number,
    payload: unknown,
  ) => R;
  toHaveBeenRequestedWithBody: (payload: unknown) => R;
  toHaveBeenNthRequestedWithBody: (callIndex: number, payload: unknown) => R;
  toHaveBeenRequestedWithHeaders: (payload: unknown) => R;
  toHaveBeenNthRequestedWithHeaders: (callIndex: number, payload: unknown) => R;
  toHaveBeenRequestedWithQuery: (payload: unknown) => R;
  toHaveBeenNthRequestedWithQuery: (callIndex: number, payload: unknown) => R;
  toHaveBeenRequestedWith: (payload: unknown) => R;
  toHaveBeenNthRequestedWith: (callIndex: number, payload: unknown) => R;
  toHaveBeenRequestedWithHash: (payload: unknown) => R;
  toHaveBeenNthRequestedWithHash: (callIndex: number, payload: unknown) => R;
  toHaveBeenRequested: () => R;
  toHaveBeenRequestedTimes: (times: number) => R;
  toHaveBeenCalledWithVariables: (variables: unknown) => R;
  toHaveBeenCalledNthWithVariables: (
    callIndex: number,
    variables: unknown,
  ) => R;
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
    toHaveBeenRequestedWithQuery: (query: string) => void;
    toHaveBeenNthRequestedWithQuery: (nthCall: number, query: string) => void;
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
