import type { Assertion } from "../../types";
import { checkEquality } from "../../utils";
import { checkMockedHandler } from "../../utils/checkMockedHandler";

export const toHaveBeenNthRequestedWithHash: Assertion = {
  name: "toHaveBeenNthRequestedWithHash",
  interceptHttp: (original) => original,
  interceptGql: (original) => original,
  assert: function (received, time, expected) {
    checkMockedHandler(received);

    const calls = received.hashAssertion.mock.calls;
    const actualHash = calls[time - 1]?.[0];

    const { isNot } = this;
    return {
      pass: checkEquality(actualHash, expected),
      message: () =>
        `Expected ${received.hashAssertion.getMockName()} to${isNot ? " not" : ""} have been called the ${time}${time === 1 ? "st" : time === 2 ? "nd" : time === 3 ? "rd" : "th"} time with hash ${this.utils.printExpected(expected)}, but it was called with ${this.utils.printReceived(actualHash)}`,
    };
  },
};
