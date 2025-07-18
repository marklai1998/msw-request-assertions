import type { HttpRequestHandler } from "msw";
import type { Mock } from "vitest";
import type { AssertFn } from "../types/index.js";
import { checkMockedHttpHandler } from "../utils/checkMockedHttpHandler.js";
import { checkEquality } from "../utils/index.js";

declare module "msw" {
  interface HttpHandler {
    hashAssertion: Mock;
  }
}

export const initToHaveBeenRequestedWithHash =
  (original: HttpRequestHandler): HttpRequestHandler =>
  (path, resolver, options, ...rest) => {
    const hashAssertion = vi.fn();
    hashAssertion.mockName(typeof path === "string" ? path : path.source);

    const newResolver: typeof resolver = async (info, ...args) => {
      const { request } = info;
      const clone = request.clone();
      const hash = new URL(clone.url).hash;

      hashAssertion(hash);

      return resolver(info, ...args);
    };

    const handler = original(path, newResolver, options, ...rest);

    handler.hashAssertion = hashAssertion;

    return handler;
  };

export const toHaveBeenRequestedWithHash: AssertFn = function (
  received,
  expected,
) {
  checkMockedHttpHandler(received);

  const calls = received.hashAssertion.mock.calls;

  const { isNot } = this;
  return {
    pass: calls.some((call) => checkEquality(call[0], expected)),
    message: () =>
      `Expected ${received.hashAssertion.getMockName()} to${isNot ? " not" : ""} have been requested with hash ${this.utils.printExpected(expected)}`,
  };
};
