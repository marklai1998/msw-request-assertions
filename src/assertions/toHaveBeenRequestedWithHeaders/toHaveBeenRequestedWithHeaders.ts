import type { Mock } from "vitest";
import type { Assertion } from "../../types/index.js";
import { checkMockedHandler } from "../../utils/checkMockedHandler.js";
import { checkEquality } from "../../utils/index.js";

declare module "msw" {
  interface HttpHandler {
    headersAssertion: Mock;
  }
  interface GraphQLHandler {
    headersAssertion: Mock;
  }
}

export const toHaveBeenRequestedWithHeaders: Assertion = {
  name: "toHaveBeenRequestedWithHeaders",
  interceptHttp:
    (mockFn, original) =>
    (path, resolver, options, ...rest) => {
      const headersAssertion = mockFn();
      headersAssertion.mockName(typeof path === "string" ? path : path.source);

      const newResolver: typeof resolver = (info, ...args) => {
        const { request } = info;
        const clone = request.clone();

        headersAssertion(Object.fromEntries(clone.headers.entries()));

        return resolver(info, ...args);
      };

      const handler = original(path, newResolver, options, ...rest);

      handler.headersAssertion = headersAssertion;

      return handler;
    },
  interceptGql:
    (mockFn, original) =>
    (operationName, resolver, options, ...rest) => {
      const headersAssertion = mockFn();
      headersAssertion.mockName(
        typeof operationName === "string"
          ? operationName
          : operationName.toString(),
      );

      const newResolver: typeof resolver = (info, ...args) => {
        const { request } = info;
        const clone = request.clone();

        headersAssertion(Object.fromEntries(clone.headers.entries()));

        return resolver(info, ...args);
      };

      const handler = original(operationName, newResolver, options, ...rest);

      handler.headersAssertion = headersAssertion;

      return handler;
    },
  assert: function (received, expected) {
    checkMockedHandler(received);

    const calls = received.headersAssertion.mock.calls;

    const { isNot } = this;
    return {
      pass: calls.some((call) => checkEquality(call[0], expected)),
      message: () =>
        `Expected ${received.headersAssertion.getMockName()} to${isNot ? " not" : ""} have been requested with headers ${this.utils.printExpected(JSON.stringify(expected))}`,
    };
  },
};
