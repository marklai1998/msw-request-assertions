import type { Mock } from "vitest";
import type { Assertion } from "../../types/index.js";
import { checkEquality } from "../../utils/checkEquality.js";
import { checkMockedHandler } from "../../utils/checkMockedHandler.js";

declare module "msw" {
  interface HttpHandler {
    bodyAssertion?: Mock;
  }
  interface GraphQLHandler {
    bodyAssertion?: Mock;
  }
}

export const toHaveBeenRequestedWithBody: Assertion = {
  name: "toHaveBeenRequestedWithBody",
  interceptHttp:
    (mockFn, original) =>
    (path, resolver, options, ...rest) => {
      const bodyAssertion = mockFn();
      bodyAssertion.mockName(typeof path === "string" ? path : path.source);

      const newResolver: typeof resolver = async (info, ...args) => {
        const { request } = info;
        const clone = request.clone();
        const payload = await clone.text();

        bodyAssertion(payload);

        return resolver(info, ...args);
      };

      const handler = original(path, newResolver, options, ...rest);

      handler.bodyAssertion = bodyAssertion;

      return handler;
    },
  interceptGql:
    (mockFn, original) =>
    (operationName, resolver, options, ...rest) => {
      const bodyAssertion = mockFn();
      bodyAssertion.mockName(
        typeof operationName === "string"
          ? operationName
          : operationName.toString(),
      );

      const newResolver: typeof resolver = async (info, ...args) => {
        const { request } = info;
        const clone = request.clone();
        const payload = await clone.text();

        bodyAssertion(payload);

        return resolver(info, ...args);
      };

      const handler = original(operationName, newResolver, options, ...rest);

      handler.bodyAssertion = bodyAssertion;

      return handler;
    },
  assert: function (received, expected) {
    checkMockedHandler(received);
    if (!received.bodyAssertion) throw new Error("No body assertion found");

    const calls = received.bodyAssertion.mock.calls;

    const { isNot } = this;
    return {
      pass: calls.some((call) => checkEquality(call[0], expected)),
      message: () =>
        `Expected ${received.bodyAssertion?.getMockName()} to${isNot ? " not" : ""} have been requested with body ${this.utils.printExpected(expected)}`,
    };
  },
};
