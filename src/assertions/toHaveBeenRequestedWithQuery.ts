import type { Mock } from "vitest";
import type { HttpAssertion } from "../types/index.js";
import { checkMockedHttpHandler } from "../utils/checkMockedHttpHandler.js";
import { checkEquality } from "../utils/index.js";

declare module "msw" {
  interface HttpHandler {
    queryAssertion: Mock;
  }
}

export const toHaveBeenRequestedWithQuery: HttpAssertion = {
  name: "toHaveBeenRequestedWithQuery",
  intercept:
    (original) =>
    (path, resolver, options, ...rest) => {
      const queryAssertion = vi.fn();
      queryAssertion.mockName(typeof path === "string" ? path : path.source);

      const newResolver: typeof resolver = async (info, ...args) => {
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
  assert: function (received, expected) {
    checkMockedHttpHandler(received);

    const calls = received.queryAssertion.mock.calls;

    const { isNot } = this;
    return {
      pass: calls.some((call) => checkEquality(call[0], expected)),
      message: () =>
        `Expected ${received.queryAssertion.getMockName()} to${isNot ? " not" : ""} have been requested with query ${this.utils.printExpected(expected)}`,
    };
  },
};
