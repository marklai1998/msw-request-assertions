import type { HttpRequestHandler } from "msw";
import type { Mock } from "vitest";
import type { HttpAssertion } from "../types/index.js";
import { checkMockedHttpHandler } from "../utils/checkMockedHttpHandler.js";

declare module "msw" {
  interface HttpHandler {
    requestedAssertion: Mock;
  }
}

export const toHaveBeenRequested: HttpAssertion = {
  name: "toHaveBeenRequested",
  intercept:
    (original: HttpRequestHandler): HttpRequestHandler =>
    (path, resolver, options, ...rest) => {
      const requestedAssertion = vi.fn();
      requestedAssertion.mockName(
        typeof path === "string" ? path : path.source,
      );

      const newResolver: typeof resolver = async (info, ...args) => {
        requestedAssertion();

        return resolver(info, ...args);
      };

      const handler = original(path, newResolver, options, ...rest);

      handler.requestedAssertion = requestedAssertion;

      return handler;
    },
  assert: function (received) {
    checkMockedHttpHandler(received);

    const calls = received.requestedAssertion.mock.calls;

    const { isNot } = this;
    return {
      pass: calls.length > 0,
      message: () =>
        `Expected ${received.requestedAssertion.getMockName()} to${isNot ? " not" : ""} have been requested`,
    };
  },
};
