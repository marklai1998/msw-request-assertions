import type { Assertion } from "../../types/index.js";
import { checkEquality } from "../../utils/checkEquality.js";
import { checkMockedHandler } from "../../utils/checkMockedHandler.js";

export const toHaveBeenNthRequestedWithQueryString: Assertion = {
  name: "toHaveBeenNthRequestedWithQueryString",
  interceptHttp: (_mockFn, original) => original,
  interceptGql: (_mockFn, original) => original,
  assert: function (received, time, expected) {
    checkMockedHandler(received);
    if (!received.queryStringAssertion)
      throw new Error("No query string assertion found");

    const calls = received.queryStringAssertion.mock.calls;
    const actualQuery = calls[time - 1]?.[0];

    const { isNot } = this;
    return {
      pass: checkEquality(actualQuery, expected),
      message: () =>
        `Expected ${received.queryStringAssertion?.getMockName()} to${isNot ? " not" : ""} have been requested the ${time}${time === 1 ? "st" : time === 2 ? "nd" : time === 3 ? "rd" : "th"} time with query string ${this.utils.printExpected(expected)}, but it was requested with ${this.utils.printReceived(actualQuery)}`,
    };
  },
};
