import type { Assertion } from "../../types/index.js";
import { checkMockedHandler } from "../../utils/checkMockedHandler.js";
import { checkEquality } from "../../utils/index.js";

export const toHaveBeenNthRequestedWithJsonBody: Assertion = {
  name: "toHaveBeenNthRequestedWithJsonBody",
  interceptHttp: (_mockFn, original) => original,
  interceptGql: (_mockFn, original) => original,
  assert: function (received, time, expected) {
    checkMockedHandler(received);
    if (!received.jsonBodyAssertion)
      throw new Error("No JSON body assertion found");

    const calls = received.jsonBodyAssertion.mock.calls;
    const actualJsonBody = calls[time - 1]?.[0];

    const { isNot } = this;
    return {
      pass: checkEquality(actualJsonBody, expected),
      message: () =>
        `Expected ${received.jsonBodyAssertion?.getMockName()} to${isNot ? " not" : ""} have been requested the ${time}${time === 1 ? "st" : time === 2 ? "nd" : time === 3 ? "rd" : "th"} time with JSON body ${this.utils.printExpected(JSON.stringify(expected))}, but it was requested with ${this.utils.printReceived(JSON.stringify(actualJsonBody))}`,
    };
  },
};
