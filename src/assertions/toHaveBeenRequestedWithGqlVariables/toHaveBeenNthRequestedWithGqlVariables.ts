import type { Assertion } from "../../types/index.js";
import { checkEquality, checkMockedGraphQLHandler } from "../../utils/index.js";

export const toHaveBeenNthRequestedWithGqlVariables: Assertion = {
  name: "toHaveBeenNthRequestedWithGqlVariables",
  interceptGql: (_mockFn, original) => original,
  assert: function (received, time, expected) {
    checkMockedGraphQLHandler(received);

    const calls = received.variablesAssertion.mock.calls;
    const nthCall = calls[time - 1];

    const isMatch = checkEquality(nthCall?.[0], expected);

    const { isNot } = this;
    return {
      pass: isMatch,
      message: () =>
        `Expected ${received.variablesAssertion.getMockName()} to${isNot ? " not" : ""} have been requested the ${time}${time === 1 ? "st" : time === 2 ? "nd" : time === 3 ? "rd" : "th"} time with GraphQL variables ${this.utils.printExpected(JSON.stringify(expected))}, but it was requested with ${this.utils.printReceived(JSON.stringify(nthCall?.[0]))}`,
    };
  },
};
