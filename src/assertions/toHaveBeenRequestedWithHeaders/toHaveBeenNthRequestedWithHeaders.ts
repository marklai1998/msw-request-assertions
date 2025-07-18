import type { Assertion } from "../../types/index.js";
import { checkEquality } from "../../utils/checkEquality.js";
import { checkMockedHandler } from "../../utils/checkMockedHandler.js";

export const toHaveBeenNthRequestedWithHeaders: Assertion = {
  name: "toHaveBeenNthRequestedWithHeaders",
  interceptHttp: (_mockFn, original) => original,
  interceptGql: (_mockFn, original) => original,
  assert: function (received, time, expected) {
    checkMockedHandler(received);
    if (!received.headersAssertion)
      throw new Error("No headers assertion found");

    const calls = received.headersAssertion.mock.calls;
    const actualHeaders = calls[time - 1]?.[0];

    const { isNot } = this;
    return {
      pass: checkEquality(actualHeaders, expected),
      message: () =>
        `Expected ${received.headersAssertion?.getMockName()} to${isNot ? " not" : ""} have been requested the ${time}${time === 1 ? "st" : time === 2 ? "nd" : time === 3 ? "rd" : "th"} time with headers ${this.utils.printExpected(JSON.stringify(expected))}, but it was requested with ${this.utils.printReceived(JSON.stringify(actualHeaders))}`,
    };
  },
};
