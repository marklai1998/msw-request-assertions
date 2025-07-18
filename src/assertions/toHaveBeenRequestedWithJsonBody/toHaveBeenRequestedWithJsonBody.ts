import type { HttpRequestHandler } from "msw";
import type { Mock } from "vitest";
import type { Assertion } from "../../types/index.js";
import { checkEquality } from "../../utils/checkEquality.js";
import { checkMockedHandler } from "../../utils/checkMockedHandler.js";

declare module "msw" {
  interface HttpHandler {
    jsonBodyAssertion?: Mock;
  }
  interface GraphQLHandler {
    jsonBodyAssertion?: Mock;
  }
}

export const toHaveBeenRequestedWithJsonBody: Assertion = {
  name: "toHaveBeenRequestedWithJsonBody",
  interceptHttp:
    (mockFn, original: HttpRequestHandler): HttpRequestHandler =>
    (path, resolver, options, ...rest) => {
      const jsonBodyAssertion = mockFn();
      jsonBodyAssertion.mockName(typeof path === "string" ? path : path.source);

      const newResolver: typeof resolver = async (info, ...args) => {
        const { request } = info;
        const clone = request.clone();
        try {
          const payload = await clone.json();
          jsonBodyAssertion(payload);
        } catch {
          jsonBodyAssertion(undefined);
        }

        return resolver(info, ...args);
      };

      const handler = original(path, newResolver, options, ...rest);

      handler.jsonBodyAssertion = jsonBodyAssertion;

      return handler;
    },
  interceptGql:
    (mockFn, original) =>
    (operationName, resolver, options, ...rest) => {
      const jsonBodyAssertion = mockFn();
      jsonBodyAssertion.mockName(
        typeof operationName === "string"
          ? operationName
          : operationName.toString(),
      );

      const newResolver: typeof resolver = async (info, ...args) => {
        const { request } = info;
        const clone = request.clone();
        try {
          const payload = await clone.json();
          jsonBodyAssertion(payload);
        } catch {
          jsonBodyAssertion(undefined);
        }

        return resolver(info, ...args);
      };

      const handler = original(operationName, newResolver, options, ...rest);

      handler.jsonBodyAssertion = jsonBodyAssertion;

      return handler;
    },
  assert: function (received, expected) {
    checkMockedHandler(received);
    if (!received.jsonBodyAssertion)
      throw new Error("No JSON body assertion found");

    const calls = received.jsonBodyAssertion.mock.calls;

    const { isNot } = this;
    return {
      pass: calls.some((call) => checkEquality(call[0], expected)),
      message: () =>
        `Expected ${received.jsonBodyAssertion?.getMockName()} to${isNot ? " not" : ""} have been requested with JSON body ${this.utils.printExpected(JSON.stringify(expected))}`,
    };
  },
};
