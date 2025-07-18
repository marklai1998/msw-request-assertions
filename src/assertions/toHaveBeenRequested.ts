import { HttpHandler, type HttpRequestHandler } from "msw";
import type { Mock } from "vitest";
import type { assertFn } from "../types/index.js";

declare module "msw" {
  interface HttpHandler {
    requestedAssertion: Mock;
  }
}

export const initToHaveBeenRequested =
  (original: HttpRequestHandler): HttpRequestHandler =>
  (path, resolver, options, ...rest) => {
    const requestedAssertion = vi.fn();
    requestedAssertion.mockName(typeof path === "string" ? path : path.source);

    const newResolver: typeof resolver = async (info, ...args) => {
      requestedAssertion();

      return resolver(info, ...args);
    };

    const handler = original(path, newResolver, options, ...rest);

    handler.requestedAssertion = requestedAssertion;

    return handler;
  };

export const toHaveBeenRequested: assertFn = function (received) {
  if (!(received instanceof HttpHandler)) {
    throw new Error("Expected a HttpHandler");
  }
  if (!received.requestedAssertion) {
    throw new Error("HttpHandler is not intercepted");
  }

  const calls = received.requestedAssertion.mock.calls;

  const { isNot } = this;
  return {
    pass: calls.length > 0,
    message: () =>
      `Expected ${received.requestedAssertion.getMockName()} to${isNot ? " not" : ""} have been requested`,
  };
};
