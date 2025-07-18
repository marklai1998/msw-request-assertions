import "vitest";

interface CustomMatchers<R = unknown> {
  toHaveBeenRequestedWithJsonBody: (payload: unknown) => R;
  toHaveBeenNthRequestedWithJsonBody: (
    callIndex: number,
    payload: unknown,
  ) => R;
  toHaveBeenRequestedWithBody: (payload: unknown) => R;
  toHaveBeenRequestedWithHeaders: (payload: unknown) => R;
  toHaveBeenRequestedWithQuery: (payload: unknown) => R;
  toHaveBeenNthRequestedWithQuery: (callIndex: number, payload: unknown) => R;
  toHaveBeenRequestedWith: (payload: unknown) => R;
  toHaveBeenRequestedWithHash: (payload: unknown) => R;
  toHaveBeenRequested: () => R;
  toHaveBeenRequestedTimes: (times: number) => R;
}

declare module "vitest" {
  interface Matchers<T = any> extends CustomMatchers<T> {}
}
