import type { Mock } from "vitest";
import type { Assertion } from "../../types";
import { checkMockedHandler } from "../../utils/checkMockedHandler";

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
  interceptGql:
    (original) =>
    (path, resolver, options, ...rest) => {
      const requestedAssertion = vi.fn();
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
