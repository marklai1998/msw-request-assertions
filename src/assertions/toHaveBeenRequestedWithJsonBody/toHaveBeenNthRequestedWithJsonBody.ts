import type { HttpAssertion } from "../../types";
import { checkEquality } from "../../utils";
import { checkMockedHttpHandler } from "../../utils/checkMockedHttpHandler";

export const toHaveBeenNthRequestedWithJsonBody: HttpAssertion = {
  name: "toHaveBeenNthRequestedWithJsonBody",
  intercept: (original) => original,
  assert: function (received, time, expected) {
    checkMockedHttpHandler(received);

    const calls = received.jsonBodyAssertion.mock.calls;
    const actualJsonBody = calls[time - 1]?.[0];

    const { isNot } = this;
    return {
      pass: checkEquality(actualJsonBody, expected),
      message: () =>
        `Expected ${received.jsonBodyAssertion.getMockName()} to${isNot ? " not" : ""} have been called the ${time}${time === 1 ? "st" : time === 2 ? "nd" : time === 3 ? "rd" : "th"} time with json body ${this.utils.printExpected(JSON.stringify(expected))}, but it was called with ${this.utils.printReceived(JSON.stringify(actualJsonBody))}`,
    };
  },
};
