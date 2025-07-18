import type { Assertion } from "../../types";
import { checkEquality, checkMockedGraphQLHandler } from "../../utils";

export const toHaveBeenNthRequestedWithGqlQuery: Assertion = {
  name: "toHaveBeenNthRequestedWithGqlQuery",
  interceptGql: (original) => original,
  assert: function (received, time, expected) {
    checkMockedGraphQLHandler(received);

    const calls = received.gqlQueryAssertion.mock.calls;
    const actualQuery = calls[time - 1]?.[0];

    const { isNot } = this;
    return {
      pass: checkEquality(actualQuery, expected),
      message: () =>
        `Expected ${received.gqlQueryAssertion.getMockName()} to${isNot ? " not" : ""} have been requested the ${time}${time === 1 ? "st" : time === 2 ? "nd" : time === 3 ? "rd" : "th"} time with GraphQL query ${this.utils.printExpected(expected)}, but it was requested with ${this.utils.printReceived(actualQuery)}`,
    };
  },
};
