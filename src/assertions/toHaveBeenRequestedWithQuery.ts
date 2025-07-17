import { HttpHandler, type HttpRequestHandler } from "msw";
import { equals } from "ramda";
import type { Mock } from "vitest";
import type { assertFn } from "../types/index.js";

declare module "msw" {
  interface HttpHandler {
    queryAssertion: Mock;
  }
}

export const initToHaveBeenRequestedWithQuery =
  (original: HttpRequestHandler): HttpRequestHandler =>
  (path, resolver, options, ...rest) => {
    const queryAssertion = vi.fn();

    const newResolver: typeof resolver = async (info, ...args) => {
      const { request } = info;
      const clone = request.clone();
      const search = new URL(clone.url).search;

      queryAssertion(search);

      return resolver(info, ...args);
    };

    const handler = original(path, newResolver, options, ...rest);

    handler.queryAssertion = queryAssertion;

    return handler;
  };

export const toHaveBeenRequestedWithQuery: assertFn = function (
  received,
  expected,
) {
  if (!(received instanceof HttpHandler)) {
    throw new Error("Expected a HttpHandler");
  }
  if (!received.queryAssertion) {
    throw new Error("HttpHandler is not intercepted");
  }

  const calls = received.queryAssertion.mock.calls;

  const { isNot } = this;
  return {
    // TODO: expect.any handling
    pass: calls.some((call) => equals(call[0], expected)),
    // TODO: message
    message: () => `${received} is${isNot ? " not" : ""} foo`,
  };
};
