import { HttpHandler, type HttpRequestHandler } from "msw";
import { equals } from "ramda";
import type { Mock } from "vitest";
import type { assertFn } from "../types/index.js";

declare module "msw" {
  interface HttpHandler {
    hashAssertion: Mock;
  }
}

export const initToHaveBeenRequestedWithHash =
  (original: HttpRequestHandler): HttpRequestHandler =>
  (path, resolver, options, ...rest) => {
    const hashAssertion = vi.fn();

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

export const toHaveBeenRequestedWithHash: assertFn = function (
  received,
  expected,
) {
  if (!(received instanceof HttpHandler)) {
    throw new Error("Expected a HttpHandler");
  }
  if (!received.hashAssertion) {
    throw new Error("HttpHandler is not intercepted");
  }

  const calls = received.hashAssertion.mock.calls;

  const { isNot } = this;
  return {
    // TODO: expect.any handling
    pass: calls.some((call) => equals(call[0], expected)),
    // TODO: message
    message: () => `${received} is${isNot ? " not" : ""} foo`,
  };
};
