import type { Assertion } from "../../types/index.js";
import { checkEquality } from "../../utils/checkEquality.js";
import { checkMockedHandler } from "../../utils/checkMockedHandler.js";

export const toHaveBeenNthRequestedWithHash: Assertion = {
  name: "toHaveBeenNthRequestedWithHash",
  interceptHttp: (_mockFn, original) => original,
  interceptGql: (_mockFn, original) => original,
  assert: function (received, time, expected) {
    checkMockedHandler(received);
    if (!received.hashAssertion) throw new Error("No hash assertion found");

    const calls = received.hashAssertion.mock.calls;
    const actualHash = calls[time - 1]?.[0];

    const { isNot } = this;
    return {
      pass: checkEquality(actualHash, expected),
      message: () =>
        `Expected ${received.hashAssertion?.getMockName()} to${isNot ? " not" : ""} have been requested the ${time}${time === 1 ? "st" : time === 2 ? "nd" : time === 3 ? "rd" : "th"} time with hash ${this.utils.printExpected(expected)}, but it was requested with ${this.utils.printReceived(actualHash)}`,
    };
  },
};
