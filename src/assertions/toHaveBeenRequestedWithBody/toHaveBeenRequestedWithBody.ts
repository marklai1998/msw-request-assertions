import type { Mock } from "vitest";
import type { Assertion } from "../../types";
import { checkEquality } from "../../utils";
import { checkMockedHttpHandler } from "../../utils/checkMockedHttpHandler";

declare module "msw" {
  interface HttpHandler {
    bodyAssertion: Mock;
  }
}

export const toHaveBeenRequestedWithBody: Assertion = {
  name: "toHaveBeenRequestedWithBody",
  interceptHttp:
    (original) =>
    (path, resolver, options, ...rest) => {
      const bodyAssertion = vi.fn();
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
  assert: function (received, expected) {
    checkMockedHttpHandler(received);

    const calls = received.bodyAssertion.mock.calls;

    const { isNot } = this;
    return {
      pass: calls.some((call) => checkEquality(call[0], expected)),
      message: () =>
        `Expected ${received.bodyAssertion.getMockName()} to${isNot ? " not" : ""} have been requested with body ${this.utils.printExpected(expected)}`,
    };
  },
};
