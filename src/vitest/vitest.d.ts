import "vitest";

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
}

declare module "vitest" {
  interface Matchers<T = unknown> extends CustomMatchers<T> {}
}
