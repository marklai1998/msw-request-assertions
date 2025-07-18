import type { Assertion } from "../../types/index.js";
import { checkEquality } from "../../utils/checkEquality.js";
import { checkMockedHandler } from "../../utils/checkMockedHandler.js";
import { formatMockCalls } from "../../utils/formatMockCalls.js";
import { getCalls } from "./getCalls.js";

export const toHaveBeenRequestedWith: Assertion = {
  name: "toHaveBeenRequestedWith",
  interceptHttp: (_mockFn, original) => original,
  interceptGql: (_mockFn, original) => original,
  assert: function (received, expected) {
    checkMockedHandler(received);
    if (!received.requestedAssertion) throw new Error("No assertion found");

    const calls = getCalls(received, expected);

    const { isNot } = this;
    const name = received.requestedAssertion.getMockName();

    return {
      pass: calls.some((call) => checkEquality(expected, call)),
      message: () =>
        formatMockCalls(
          name,
          calls.map((call) => [call]),
          `Expected ${name} to${isNot ? " not" : ""} have been requested with body ${this.utils.printExpected(JSON.stringify(expected))}`,
        ),
    };
  },
};
