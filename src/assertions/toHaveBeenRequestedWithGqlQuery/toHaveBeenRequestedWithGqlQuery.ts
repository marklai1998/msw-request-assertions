import type { Mock } from "vitest";
import type { Assertion } from "../../types";
import { checkEquality, checkMockedGraphQLHandler } from "../../utils";

declare module "msw" {
  interface GraphQLHandler {
    gqlQueryAssertion: Mock;
  }
}

export const toHaveBeenRequestedWithGqlQuery: Assertion = {
  name: "toHaveBeenRequestedWithGqlQuery",
  interceptGql:
    (original) =>
    (operationName, resolver, options, ...rest) => {
      const gqlQueryAssertion = vi.fn();
      gqlQueryAssertion.mockName(
        typeof operationName === "string"
          ? operationName
          : operationName.toString(),
      );

      const newResolver: typeof resolver = (info, ...args) => {
        const { query } = info;
        gqlQueryAssertion(query);

        return resolver(info, ...args);
      };

      const handler = original(operationName, newResolver, options, ...rest);

      handler.gqlQueryAssertion = gqlQueryAssertion;

      return handler;
    },
  assert: function (received, expected) {
    checkMockedGraphQLHandler(received);

    const calls = received.gqlQueryAssertion.mock.calls;

    const { isNot } = this;
    return {
      pass: calls.some((call) => checkEquality(call[0], expected)),
      message: () =>
        `Expected ${received.gqlQueryAssertion.getMockName()} to${isNot ? " not" : ""} have been requested with GraphQL query ${this.utils.printExpected(expected)}`,
    };
  },
};
