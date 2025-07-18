import type { Assertion } from "../../types";
import { checkEquality } from "../../utils";
import { checkMockedHttpHandler } from "../../utils/checkMockedHttpHandler";

export const toHaveBeenNthRequestedWithHeaders: Assertion = {
  name: "toHaveBeenNthRequestedWithHeaders",
  interceptHttp: (original) => original,
  assert: function (received, time, expected) {
    checkMockedHttpHandler(received);

    const calls = received.headersAssertion.mock.calls;
    const actualHeaders = calls[time - 1]?.[0];

    const { isNot } = this;
    return {
      pass: checkEquality(actualHeaders, expected),
      message: () =>
        `Expected ${received.headersAssertion.getMockName()} to${isNot ? " not" : ""} have been called the ${time}${time === 1 ? "st" : time === 2 ? "nd" : time === 3 ? "rd" : "th"} time with headers ${this.utils.printExpected(JSON.stringify(expected))}, but it was called with ${this.utils.printReceived(JSON.stringify(actualHeaders))}`,
    };
  },
};
