import type { Mock } from "vitest";
import type { Assertion } from "../../types/index.js";
import { checkEquality } from "../../utils/checkEquality.js";
import { checkMockedHandler } from "../../utils/checkMockedHandler.js";
import { formatMockCalls } from "../../utils/formatMockCalls.js";

declare module "msw" {
  interface HttpHandler {
    headersAssertion?: Mock;
  }
  interface GraphQLHandler {
    headersAssertion?: Mock;
  }
}

export const toHaveBeenRequestedWithHeaders: Assertion = {
  name: "toHaveBeenRequestedWithHeaders",
  interceptHttp:
    (mockFn, original) =>
    (path, resolver, options, ...rest) => {
      const headersAssertion = mockFn();
      headersAssertion.mockName(
        typeof path === "string"
          ? path
          : path instanceof RegExp
            ? path.source
            : path.name,
      );

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
    const assertion = received.headersAssertion;
    if (!assertion) throw new Error("No headers assertion found");

    const name = assertion.getMockName();
    const calls = assertion.mock.calls;

    const { isNot } = this;
    return {
      pass: calls.some((call) => checkEquality(call[0], expected)),
      message: () =>
        formatMockCalls(
          name,
          calls,
          `Expected ${name} to${isNot ? " not" : ""} have been requested with headers ${this.utils.printExpected(JSON.stringify(expected))}`,
        ),
    };
  },
};
