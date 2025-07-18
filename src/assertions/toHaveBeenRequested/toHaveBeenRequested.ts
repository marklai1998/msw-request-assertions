import type { Mock } from "vitest";
import type { Assertion } from "../../types/index.js";
import { checkMockedHandler } from "../../utils/checkMockedHandler.js";

declare module "msw" {
  interface HttpHandler {
    requestedAssertion: Mock;
  }

  interface GraphQLHandler {
    requestedAssertion: Mock;
  }
}

export const toHaveBeenRequested: Assertion = {
  name: "toHaveBeenRequested",
  interceptHttp:
    (mockFn, original) =>
    (path, resolver, options, ...rest) => {
      const requestedAssertion = mockFn();
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
  interceptGql:
    (mockFn, original) =>
    (path, resolver, options, ...rest) => {
      const requestedAssertion = mockFn();
      requestedAssertion.mockName(
        typeof path === "string"
          ? path
          : "source" in path
            ? path.source
            : JSON.stringify(path),
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
    checkMockedHandler(received);

    const calls = received.requestedAssertion.mock.calls;

    const { isNot } = this;
    return {
      pass: calls.length > 0,
      message: () =>
        `Expected ${received.requestedAssertion.getMockName()} to${isNot ? " not" : ""} have been requested`,
    };
  },
};
