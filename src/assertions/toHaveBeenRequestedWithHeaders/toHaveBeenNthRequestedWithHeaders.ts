import type { Assertion } from "../../types/index.js";
import { checkEquality } from "../../utils/checkEquality.js";
import { checkMockedHandler } from "../../utils/checkMockedHandler.js";
import { formatMockCalls, ordinalOf } from "../../utils/formatMockCalls.js";

export const toHaveBeenNthRequestedWithHeaders: Assertion = {
  name: "toHaveBeenNthRequestedWithHeaders",
  interceptHttp: (_mockFn, original) => original,
  interceptGql: (_mockFn, original) => original,
  assert: function (received, time, expected) {
    checkMockedHandler(received);
    const assertion = received.headersAssertion;
    if (!assertion) throw new Error("No headers assertion found");

    const name = assertion.getMockName();
    const calls = assertion.mock.calls;
    const actualHeaders = calls[time - 1]?.[0];

    const { isNot } = this;
    return {
      pass: checkEquality(actualHeaders, expected),
      message: () =>
        formatMockCalls(
          name,
          calls,
          `Expected ${name} to${isNot ? " not" : ""} have been requested the ${ordinalOf(time)} time with headers ${this.utils.printExpected(JSON.stringify(expected))}, but it was requested with ${this.utils.printReceived(JSON.stringify(actualHeaders))}`,
        ),
    };
  },
};
