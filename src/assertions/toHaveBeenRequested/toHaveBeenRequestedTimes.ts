import type { Assertion } from "../../types/index.js";
import { checkMockedHandler } from "../../utils/checkMockedHandler.js";

export const toHaveBeenRequestedTimes: Assertion = {
  name: "toHaveBeenRequestedTimes",
  interceptHttp: (_mockFn, original) => original,
  interceptGql: (_mockFn, original) => original,
  assert: function (received, expectedTimes) {
    checkMockedHandler(received);
    if (!received.requestedAssertion)
      throw new Error("No request assertion found");

    const calls = received.requestedAssertion.mock.calls;
    const actualTimes = calls.length;

    const { isNot } = this;
    return {
      pass: actualTimes === expectedTimes,
      message: () =>
        `Expected ${received.requestedAssertion?.getMockName()} to${isNot ? " not" : ""} have been requested ${expectedTimes} times, but it was requested ${actualTimes} times`,
    };
  },
};
