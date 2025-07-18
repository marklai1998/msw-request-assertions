import type { Mock } from "vitest";
import type { Assertion } from "../../types";
import { checkEquality } from "../../utils";
import { checkMockedHandler } from "../../utils/checkMockedHandler";

declare module "msw" {
  interface HttpHandler {
    hashAssertion: Mock;
  }
  interface GraphQLHandler {
    hashAssertion: Mock;
  }
}

export const toHaveBeenRequestedWithHash: Assertion = {
  name: "toHaveBeenRequestedWithHash",
  interceptHttp:
    (original) =>
    (path, resolver, options, ...rest) => {
      const hashAssertion = vi.fn();
      hashAssertion.mockName(typeof path === "string" ? path : path.source);

      const newResolver: typeof resolver = (info, ...args) => {
        const { request } = info;
        const clone = request.clone();
        const hash = new URL(clone.url).hash;

        hashAssertion(hash);

        return resolver(info, ...args);
      };

      const handler = original(path, newResolver, options, ...rest);

      handler.hashAssertion = hashAssertion;

      return handler;
    },
  interceptGql:
    (original) =>
    (operationName, resolver, options, ...rest) => {
      const hashAssertion = vi.fn();
      hashAssertion.mockName(
        typeof operationName === "string"
          ? operationName
          : operationName.toString(),
      );

      const newResolver: typeof resolver = (info, ...args) => {
        const { request } = info;
        const clone = request.clone();
        const hash = new URL(clone.url).hash;

        hashAssertion(hash);

        return resolver(info, ...args);
      };

      const handler = original(operationName, newResolver, options, ...rest);

      handler.hashAssertion = hashAssertion;

      return handler;
    },
  assert: function (received, expected) {
    checkMockedHandler(received);

    const calls = received.hashAssertion.mock.calls;

    const { isNot } = this;
    return {
      pass: calls.some((call) => checkEquality(call[0], expected)),
      message: () =>
        `Expected ${received.hashAssertion.getMockName()} to${isNot ? " not" : ""} have been requested with hash ${this.utils.printExpected(expected)}`,
    };
  },
};
