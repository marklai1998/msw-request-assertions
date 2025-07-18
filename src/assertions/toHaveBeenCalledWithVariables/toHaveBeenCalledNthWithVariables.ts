import type { GraphQLAssertion } from "../../types";
import { checkEquality, checkMockedGraphQLHandler } from "../../utils";

export const toHaveBeenCalledNthWithVariables: GraphQLAssertion = {
  name: "toHaveBeenCalledNthWithVariables",
  intercept: (original) => original,
  assert: function (received, time, expected) {
    checkMockedGraphQLHandler(received);

    const calls = received.variablesAssertion.mock.calls;
    const nthCall = calls[time - 1];

    const isMatch = checkEquality(nthCall?.[0], expected);

    const { isNot } = this;
    return {
      pass: isMatch,
      message: () =>
        `Expected ${received.variablesAssertion.getMockName()} to${isNot ? " not" : ""} have been called the ${time}${time === 1 ? "st" : time === 2 ? "nd" : time === 3 ? "rd" : "th"} time with variables ${this.utils.printExpected(JSON.stringify(expected))}, but it was called with ${this.utils.printReceived(JSON.stringify(nthCall?.[0]))}`,
    };
  },
};
