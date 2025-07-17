import { HttpHandler, type HttpRequestHandler } from "msw";
import { equals } from "ramda";
import type { Mock } from "vitest";
import type { assertFn } from "../types/index.js";

declare module "msw" {
  interface HttpHandler {
    headersAssertion: Mock;
  }
}

export const initToHaveBeenRequestedWithHeader =
  (original: HttpRequestHandler): HttpRequestHandler =>
  (path, resolver, options, ...rest) => {
    const headersAssertion = vi.fn();

    const newResolver: typeof resolver = async (info, ...args) => {
      const { request } = info;
      const clone = request.clone();

      headersAssertion(Object.fromEntries(clone.headers.entries()));

      return resolver(info, ...args);
    };

    const handler = original(path, newResolver, options, ...rest);

    handler.headersAssertion = headersAssertion;

    return handler;
  };

export const toHaveBeenRequestedWithHeaders: assertFn = function (
  received,
  expected,
) {
  if (!(received instanceof HttpHandler)) {
    throw new Error("Expected a HttpHandler");
  }
  if (!received.headersAssertion)
    throw new Error("HttpHandler is not intercepted");

  const calls = received.headersAssertion.mock.calls;

  const { isNot } = this;
  return {
    // TODO: expect.any handling
    pass: calls.some((call) => equals(call[0], expected)),
    // TODO: message
    message: () => `${received} is${isNot ? " not" : ""} foo`,
  };
};
