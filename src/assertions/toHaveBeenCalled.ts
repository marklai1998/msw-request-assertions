import { HttpHandler, type HttpRequestHandler } from "msw";
import type { Mock } from "vitest";
import type { assertFn } from "../types/index.js";

declare module "msw" {
  interface HttpHandler {
    calledAssertion: Mock;
  }
}

export const initToHaveBeenCalled =
  (original: HttpRequestHandler): HttpRequestHandler =>
  (path, resolver, options, ...rest) => {
    const calledAssertion = vi.fn();
    calledAssertion.mockName(typeof path === "string" ? path : path.source);

    const newResolver: typeof resolver = async (info, ...args) => {
      calledAssertion();

      return resolver(info, ...args);
    };

    const handler = original(path, newResolver, options, ...rest);

    handler.calledAssertion = calledAssertion;

    return handler;
  };

export const toHaveBeenCalled: assertFn = function (received) {
  if (!(received instanceof HttpHandler)) {
    throw new Error("Expected a HttpHandler");
  }
  if (!received.calledAssertion) {
    throw new Error("HttpHandler is not intercepted");
  }

  const calls = received.calledAssertion.mock.calls;

  const { isNot } = this;
  return {
    pass: calls.length > 0,
    message: () =>
      `Expected ${received.calledAssertion.getMockName()} to${isNot ? " not" : ""} have been called`,
  };
};
