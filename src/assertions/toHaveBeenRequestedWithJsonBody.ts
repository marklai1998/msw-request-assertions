import type { HttpRequestHandler } from "msw";
import type { Mock } from "vitest";
import type { AssertFn } from "../types/index.js";
import { checkMockedHttpHandler } from "../utils/checkMockedHttpHandler.js";
import { checkEquality } from "../utils/index.js";

declare module "msw" {
  interface HttpHandler {
    jsonBodyAssertion: Mock;
  }
}

export const initToHaveBeenRequestedWithJsonBody =
  (original: HttpRequestHandler): HttpRequestHandler =>
  (path, resolver, options, ...rest) => {
    const jsonBodyAssertion = vi.fn();
    jsonBodyAssertion.mockName(typeof path === "string" ? path : path.source);

    const newResolver: typeof resolver = async (info, ...args) => {
      const { request } = info;
      const clone = request.clone();
      try {
        const payload = await clone.json();
        jsonBodyAssertion(payload);
      } catch {
        jsonBodyAssertion(undefined);
      }

      return resolver(info, ...args);
    };

    const handler = original(path, newResolver, options, ...rest);

    handler.jsonBodyAssertion = jsonBodyAssertion;

    return handler;
  };

export const toHaveBeenRequestedWithJsonBody: AssertFn = function (
  received,
  expected,
) {
  checkMockedHttpHandler(received);

  const calls = received.jsonBodyAssertion.mock.calls;

  const { isNot } = this;
  return {
    pass: calls.some((call) => checkEquality(call[0], expected)),
    message: () =>
      `Expected ${received.jsonBodyAssertion.getMockName()} to${isNot ? " not" : ""} have been requested with json body ${this.utils.printExpected(JSON.stringify(expected))}`,
  };
};
