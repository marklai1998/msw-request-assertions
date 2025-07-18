import type { Mock } from "vitest";
import type { HttpAssertion } from "../../types";
import { checkEquality } from "../../utils";
import { checkMockedHttpHandler } from "../../utils/checkMockedHttpHandler";

declare module "msw" {
  interface HttpHandler {
    hashAssertion: Mock;
  }
}

export const toHaveBeenRequestedWithHash: HttpAssertion = {
  name: "toHaveBeenRequestedWithHash",
  intercept:
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
  assert: function (received, expected) {
    checkMockedHttpHandler(received);

    const calls = received.hashAssertion.mock.calls;

    const { isNot } = this;
    return {
      pass: calls.some((call) => checkEquality(call[0], expected)),
      message: () =>
        `Expected ${received.hashAssertion.getMockName()} to${isNot ? " not" : ""} have been requested with hash ${this.utils.printExpected(expected)}`,
    };
  },
};
