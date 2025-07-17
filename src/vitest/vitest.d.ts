import "vitest";

interface CustomMatchers<R = unknown> {
  toHaveBeenRequestedWithJsonBody: (payload: unknown) => R;
  toHaveBeenRequestedWithBody: (payload: unknown) => R;
  toHaveBeenRequestedWithHeaders: (payload: unknown) => R;
  toHaveBeenRequestedWithQuery: (payload: unknown) => R;
  toHaveBeenRequestedWith: (payload: unknown) => R;
}

declare module "vitest" {
  interface Matchers<T = any> extends CustomMatchers<T> {}
}
