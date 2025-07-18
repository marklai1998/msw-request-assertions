import "vitest";

interface CustomMatchers<R = unknown> {
  toHaveBeenRequested: () => R;
  toHaveBeenRequestedTimes: (times: number) => R;
  toHaveBeenRequestedWith: (payload: unknown) => R;
  toHaveBeenNthRequestedWith: (nthCall: number, payload: unknown) => R;
  toHaveBeenRequestedWithBody: (body: string) => R;
  toHaveBeenNthRequestedWithBody: (nthCall: number, body: string) => R;
  toHaveBeenRequestedWithHash: (hash: string) => R;
  toHaveBeenNthRequestedWithHash: (nthCall: number, hash: string) => R;
  toHaveBeenRequestedWithHeaders: (headers: unknown) => R;
  toHaveBeenNthRequestedWithHeaders: (nthCall: number, headers: unknown) => R;
  toHaveBeenRequestedWithJsonBody: (body: unknown) => R;
  toHaveBeenNthRequestedWithJsonBody: (nthCall: number, body: unknown) => R;
  toHaveBeenRequestedWithQueryString: (queryString: string) => R;
  toHaveBeenNthRequestedWithQueryString: (
    nthCall: number,
    queryString: string,
  ) => R;
  toHaveBeenRequestedWithGqlVariables: (variables: unknown) => R;
  toHaveBeenNthRequestedWithGqlVariables: (
    nthCall: number,
    variables: unknown,
  ) => R;
  toHaveBeenRequestedWithGqlQuery: (query: string) => R;
  toHaveBeenNthRequestedWithGqlQuery: (nthCall: number, query: string) => R;
  toHaveBeenRequestedWithPathParameters: (params: unknown) => R;
  toHaveBeenNthRequestedWithPathParameters: (
    nthCall: number,
    params: unknown,
  ) => R;
}

declare module "vitest" {
  interface Matchers<T = unknown> extends CustomMatchers<T> {}
}
