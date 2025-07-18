import type { Assertion } from "../../types";
import { checkEquality } from "../../utils";
import { checkMockedHandler } from "../../utils/checkMockedHandler";

export const toHaveBeenNthRequestedWithQueryString: Assertion = {
  name: "toHaveBeenNthRequestedWithQueryString",
  interceptHttp: (original) => original,
  interceptGql: (original) => original,
  assert: function (received, time, expected) {
    checkMockedHandler(received);

    const calls = received.queryStringAssertion.mock.calls;
    const actualQuery = calls[time - 1]?.[0];

    const { isNot } = this;
    return {
      pass: checkEquality(actualQuery, expected),
      message: () =>
        `Expected ${received.queryStringAssertion.getMockName()} to${isNot ? " not" : ""} have been called the ${time}${time === 1 ? "st" : time === 2 ? "nd" : time === 3 ? "rd" : "th"} time with query string ${this.utils.printExpected(expected)}, but it was called with ${this.utils.printReceived(actualQuery)}`,
    };
  },
};
