/// <reference types="vitest" />
/// <reference types="@vitest/expect" />

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
  toHaveBeenRequestedWithGqlVariables: (variables: Record<string, any>) => R;
  toHaveBeenNthRequestedWithGqlVariables: (
    nthCall: number,
    variables: Record<string, any>,
  ) => R;
  toHaveBeenRequestedWithGqlQuery: (query: string) => R;
  toHaveBeenNthRequestedWithGqlQuery: (nthCall: number, query: string) => R;
}

declare module "vitest" {
  interface Matchers<T = unknown> extends CustomMatchers<T> {}

  interface Assertion<_T = any> {
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

  interface Assertion<_GraphQLHandler> {
    toHaveBeenRequestedWithGqlVariables: (
      variables: Record<string, any>,
    ) => void;
    toHaveBeenNthRequestedWithGqlVariables: (
      nthCall: number,
      variables: Record<string, any>,
    ) => void;
    toHaveBeenRequestedWithGqlQuery: (query: string) => void;
    toHaveBeenNthRequestedWithGqlQuery: (
      nthCall: number,
      query: string,
    ) => void;
  }
}
