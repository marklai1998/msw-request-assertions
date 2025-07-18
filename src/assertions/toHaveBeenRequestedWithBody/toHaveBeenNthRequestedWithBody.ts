import type { Assertion } from "../../types/index.js";
import { checkMockedHandler } from "../../utils/checkMockedHandler.js";
import { checkEquality } from "../../utils/index.js";

export const toHaveBeenNthRequestedWithBody: Assertion = {
  name: "toHaveBeenNthRequestedWithBody",
  interceptHttp: (_mockFn, original) => original,
  interceptGql: (_mockFn, original) => original,
  assert: function (received, time, expected) {
    checkMockedHandler(received);
    if (!received.bodyAssertion) throw new Error("No body assertion found");

    const calls = received.bodyAssertion.mock.calls;
    const actualBody = calls[time - 1]?.[0];

    const { isNot } = this;
    return {
      pass: checkEquality(actualBody, expected),
      message: () =>
        `Expected ${received.bodyAssertion?.getMockName()} to${isNot ? " not" : ""} have been called the ${time}${time === 1 ? "st" : time === 2 ? "nd" : time === 3 ? "rd" : "th"} time with body ${this.utils.printExpected(expected)}, but it was called with ${this.utils.printReceived(actualBody)}`,
    };
  },
};
