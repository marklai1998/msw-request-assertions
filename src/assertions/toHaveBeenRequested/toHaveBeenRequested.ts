import type { Mock } from "vitest";
import type { HttpAssertion } from "../../types";
import { checkMockedHttpHandler } from "../../utils/checkMockedHttpHandler";

declare module "msw" {
  interface HttpHandler {
    requestedAssertion: Mock;
  }
}

export const toHaveBeenRequested: HttpAssertion = {
  name: "toHaveBeenRequested",
  intercept:
    (original) =>
    (path, resolver, options, ...rest) => {
      const requestedAssertion = vi.fn();
      requestedAssertion.mockName(
        typeof path === "string" ? path : path.source,
      );

      const newResolver: typeof resolver = (info, ...args) => {
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
