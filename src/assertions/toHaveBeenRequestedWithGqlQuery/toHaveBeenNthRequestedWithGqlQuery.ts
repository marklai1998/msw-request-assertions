import type { Assertion } from "../../types/index.js";
import { checkEquality } from "../../utils/checkEquality.js";
import { checkMockedGraphQLHandler } from "../../utils/checkMockedGraphQLHandler.js";
import { formatMockCalls, ordinalOf } from "../../utils/formatMockCalls.js";

export const toHaveBeenNthRequestedWithGqlQuery: Assertion = {
  name: "toHaveBeenNthRequestedWithGqlQuery",
  interceptGql: (_mockFn, original) => original,
  assert: function (received, time, expected) {
    checkMockedGraphQLHandler(received);
    const assertion = received.gqlQueryAssertion;
    if (!assertion) throw new Error("No GraphQL query assertion found");

    const name = assertion.getMockName();
    const calls = assertion.mock.calls;
    const actualQuery = calls[time - 1]?.[0];

    const { isNot } = this;
    return {
      pass: checkEquality(actualQuery, expected),
      message: () =>
        formatMockCalls(
          name,
          calls,
          `Expected ${assertion?.getMockName()} to${isNot ? " not" : ""} have been requested the ${ordinalOf(time)} time with GraphQL query ${this.utils.printExpected(expected)}, but it was requested with ${this.utils.printReceived(actualQuery)}`,
        ),
    };
  },
};
