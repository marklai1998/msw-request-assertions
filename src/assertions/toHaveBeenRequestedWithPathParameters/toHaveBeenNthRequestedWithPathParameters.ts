import type { Assertion } from "../../types/index.js";
import { checkMockedHandler } from "../../utils/checkMockedHandler.js";
import { checkEquality } from "../../utils/index.js";

export const toHaveBeenNthRequestedWithPathParameters: Assertion = {
  name: "toHaveBeenNthRequestedWithPathParameters",
  interceptHttp: (_mockFn, original) => original,
  interceptGql: (_mockFn, original) => original,
  assert: function (received, time, expected) {
    checkMockedHandler(received);
    if (!received.pathParametersAssertion)
      throw new Error("No path parameters assertion found");

    const calls = received.pathParametersAssertion.mock.calls;

    const nthCall = calls[time - 1];
    const actualParams = nthCall?.[0];

    const { isNot } = this;
    return {
      pass: checkEquality(actualParams, expected),
      message: () =>
        `Expected ${received.pathParametersAssertion?.getMockName()} to${isNot ? " not" : ""} have been called the ${time}${time === 1 ? "st" : time === 2 ? "nd" : time === 3 ? "rd" : "th"} time with path parameters ${this.utils.printExpected(JSON.stringify(expected))}, but it was called with ${this.utils.printReceived(JSON.stringify(actualParams))}`,
    };
  },
};
