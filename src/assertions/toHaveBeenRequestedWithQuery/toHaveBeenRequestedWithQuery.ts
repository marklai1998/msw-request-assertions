import type { Mock } from "vitest";
import type { Assertion } from "../../types";
import { checkEquality } from "../../utils";
import { checkMockedHandler } from "../../utils/checkMockedHandler";

declare module "msw" {
  interface HttpHandler {
    queryAssertion: Mock;
  }
  interface GraphQLHandler {
    queryAssertion: Mock;
  }
}

export const toHaveBeenRequestedWithQuery: Assertion = {
  name: "toHaveBeenRequestedWithQuery",
  interceptHttp:
    (original) =>
    (path, resolver, options, ...rest) => {
      const queryAssertion = vi.fn();
      queryAssertion.mockName(typeof path === "string" ? path : path.source);

      const newResolver: typeof resolver = (info, ...args) => {
        const { request } = info;
        const clone = request.clone();
        const search = new URL(clone.url).search;

        queryAssertion(search);

        return resolver(info, ...args);
      };

      const handler = original(path, newResolver, options, ...rest);

      handler.queryAssertion = queryAssertion;

      return handler;
    },
  interceptGql:
    (original) =>
    (operationName, resolver, options, ...rest) => {
      const queryAssertion = vi.fn();
      queryAssertion.mockName(
        typeof operationName === "string"
          ? operationName
          : operationName.toString(),
      );

      const newResolver: typeof resolver = (info, ...args) => {
        const { request } = info;
        const clone = request.clone();
        const search = new URL(clone.url).search;

        queryAssertion(search);

        return resolver(info, ...args);
      };

      const handler = original(operationName, newResolver, options, ...rest);

      handler.queryAssertion = queryAssertion;

      return handler;
    },
  assert: function (received, expected) {
    checkMockedHandler(received);

    const calls = received.queryAssertion.mock.calls;

    const { isNot } = this;
    return {
      pass: calls.some((call) => checkEquality(call[0], expected)),
      message: () =>
        `Expected ${received.queryAssertion.getMockName()} to${isNot ? " not" : ""} have been requested with query ${this.utils.printExpected(expected)}`,
    };
  },
};
