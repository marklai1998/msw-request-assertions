import type { Assertion } from "../../types/index.js";
import { checkEquality } from "../../utils/checkEquality.js";
import { checkMockedHandler } from "../../utils/checkMockedHandler.js";
import { formatMockCalls, ordinalOf } from "../../utils/formatMockCalls.js";

export const toHaveBeenNthRequestedWithQueryString: Assertion = {
  name: "toHaveBeenNthRequestedWithQueryString",
  interceptHttp: (_mockFn, original) => original,
  interceptGql: (_mockFn, original) => original,
  assert: function (received, time, expected) {
    checkMockedHandler(received);
    const assertion = received.queryStringAssertion;
    if (!assertion) throw new Error("No query string assertion found");

    const calls = assertion.mock.calls;
    const nthCall = calls[time - 1]?.[0];

    const { isNot } = this;
    return {
      pass: checkEquality(nthCall, expected),
      message: () =>
        formatMockCalls(
          assertion.getMockName(),
          calls,
          `Expected ${assertion.getMockName()} to${isNot ? " not" : ""} have been requested the ${ordinalOf(time)} time with query string ${this.utils.printExpected(expected)}, but it was requested with ${this.utils.printReceived(nthCall)}`,
        ),
    };
  },
};
