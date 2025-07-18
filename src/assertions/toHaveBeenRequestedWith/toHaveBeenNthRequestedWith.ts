import type { Assertion } from "../../types/index.js";
import { checkEquality } from "../../utils/checkEquality.js";
import { checkMockedHandler } from "../../utils/checkMockedHandler.js";
import { formatMockCalls, ordinalOf } from "../../utils/formatMockCalls.js";
import { getCalls } from "./getCalls.js";

export const toHaveBeenNthRequestedWith: Assertion = {
  name: "toHaveBeenNthRequestedWith",
  interceptHttp: (_mockFn, original) => original,
  interceptGql: (_mockFn, original) => original,
  assert: function (received, time, expected) {
    checkMockedHandler(received);
    if (!received.requestedAssertion) throw new Error("No assertion found");

    const calls = getCalls(received, expected);
    const nthCall = calls[time - 1];

    const { isNot } = this;
    const name = received.requestedAssertion.getMockName();

    return {
      pass: checkEquality(expected, nthCall),
      message: () =>
        formatMockCalls(
          name,
          calls.map((call) => [call]),
          `Expected ${name} to${isNot ? " not" : ""} have been requested the ${ordinalOf(time)} time with request matching ${this.utils.printExpected(JSON.stringify(expected))}, but it was requested with ${this.utils.printReceived(JSON.stringify(nthCall))}`,
        ),
    };
  },
};
