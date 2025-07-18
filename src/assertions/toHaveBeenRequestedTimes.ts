import type { HttpAssertion } from "../types/index.js";
import { checkMockedHttpHandler } from "../utils/checkMockedHttpHandler.js";

export const toHaveBeenRequestedTimes: HttpAssertion = {
  name: "toHaveBeenRequestedTimes",
  intercept: (original) => original,
  assert: function (received, expectedTimes) {
    checkMockedHttpHandler(received);

    const calls = received.requestedAssertion.mock.calls;
    const actualTimes = calls.length;

    const { isNot } = this;
    return {
      pass: actualTimes === expectedTimes,
      message: () =>
        `Expected ${received.requestedAssertion.getMockName()} to${isNot ? " not" : ""} have been requested ${expectedTimes} times, but it was requested ${actualTimes} times`,
    };
  },
};
