import type { Assertion } from "../../types";
import { checkEquality } from "../../utils";
import { checkMockedHttpHandler } from "../../utils/checkMockedHttpHandler";

export const toHaveBeenNthRequestedWithQuery: Assertion = {
  name: "toHaveBeenNthRequestedWithQuery",
  interceptHttp: (original) => original,
  assert: function (received, time, expected) {
    checkMockedHttpHandler(received);

    const calls = received.queryAssertion.mock.calls;
    const actualQuery = calls[time - 1]?.[0];

    const { isNot } = this;
    return {
      pass: checkEquality(actualQuery, expected),
      message: () =>
        `Expected ${received.queryAssertion.getMockName()} to${isNot ? " not" : ""} have been called the ${time}${time === 1 ? "st" : time === 2 ? "nd" : time === 3 ? "rd" : "th"} time with query ${this.utils.printExpected(expected)}, but it was called with ${this.utils.printReceived(actualQuery)}`,
    };
  },
};
