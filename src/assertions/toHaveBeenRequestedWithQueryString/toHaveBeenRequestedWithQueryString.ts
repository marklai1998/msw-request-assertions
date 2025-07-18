import type { Mock } from "vitest";
import type { Assertion } from "../../types/index.js";
import { checkMockedHandler } from "../../utils/checkMockedHandler.js";
import { checkEquality } from "../../utils/index.js";

declare module "msw" {
  interface HttpHandler {
    queryStringAssertion?: Mock;
  }
  interface GraphQLHandler {
    queryStringAssertion?: Mock;
  }
}

export const toHaveBeenRequestedWithQueryString: Assertion = {
  name: "toHaveBeenRequestedWithQueryString",
  interceptHttp:
    (mockFn, original) =>
    (path, resolver, options, ...rest) => {
      const queryStringAssertion = mockFn();
      queryStringAssertion.mockName(
        typeof path === "string" ? path : path.source,
      );

      const newResolver: typeof resolver = (info, ...args) => {
        const { request } = info;
        const clone = request.clone();
        const search = new URL(clone.url).search;

        queryStringAssertion(search);

        return resolver(info, ...args);
      };

      const handler = original(path, newResolver, options, ...rest);

      handler.queryStringAssertion = queryStringAssertion;

      return handler;
    },
  interceptGql:
    (mockFn, original) =>
    (operationName, resolver, options, ...rest) => {
      const queryStringAssertion = mockFn();
      queryStringAssertion.mockName(
        typeof operationName === "string"
          ? operationName
          : operationName.toString(),
      );

      const newResolver: typeof resolver = (info, ...args) => {
        const { request } = info;
        const clone = request.clone();
        const search = new URL(clone.url).search;

        queryStringAssertion(search);

        return resolver(info, ...args);
      };

      const handler = original(operationName, newResolver, options, ...rest);

      handler.queryStringAssertion = queryStringAssertion;

      return handler;
    },
  assert: function (received, expected) {
    checkMockedHandler(received);
    if (!received.queryStringAssertion)
      throw new Error("No query string assertion found");

    const calls = received.queryStringAssertion.mock.calls;

    const { isNot } = this;
    return {
      pass: calls.some((call) => checkEquality(call[0], expected)),
      message: () =>
        `Expected ${received.queryStringAssertion?.getMockName()} to${isNot ? " not" : ""} have been requested with query string ${this.utils.printExpected(expected)}`,
    };
  },
};
