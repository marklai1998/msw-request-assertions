import type { Assertion } from "../../types";
import { checkMockedHandler } from "../../utils/checkMockedHandler";

export const toHaveBeenRequestedTimes: Assertion = {
  name: "toHaveBeenRequestedTimes",
  interceptHttp: (original) => original,
  interceptGql: (original) => original,
  assert: function (received, expectedTimes) {
    checkMockedHandler(received);
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
