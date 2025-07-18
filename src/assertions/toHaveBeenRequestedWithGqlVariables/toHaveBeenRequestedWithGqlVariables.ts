import type { Mock } from "vitest";
import type { Assertion } from "../../types/index.js";
import { checkEquality, checkMockedGraphQLHandler } from "../../utils/index.js";

declare module "msw" {
  interface GraphQLHandler {
    variablesAssertion: Mock;
  }
}

export const toHaveBeenRequestedWithGqlVariables: Assertion = {
  name: "toHaveBeenRequestedWithGqlVariables",
  interceptGql:
    (mockFn, original) =>
    (operationName, resolver, options, ...rest) => {
      const variablesAssertion = mockFn();
      variablesAssertion.mockName(
        typeof operationName === "string"
          ? operationName
          : operationName.toString(),
      );

      const newResolver: typeof resolver = (info, ...args) => {
        const { variables } = info;
        variablesAssertion(variables);

        return resolver(info, ...args);
      };

      const handler = original(operationName, newResolver, options, ...rest);

      handler.variablesAssertion = variablesAssertion;

      return handler;
    },
  assert: function (received, expected) {
    checkMockedGraphQLHandler(received);

    const calls = received.variablesAssertion.mock.calls;

    const { isNot } = this;
    return {
      pass: calls.some((call) => checkEquality(call[0], expected)),
      message: () =>
        `Expected ${received.variablesAssertion.getMockName()} to${isNot ? " not" : ""} have been requested with GraphQL variables ${this.utils.printExpected(JSON.stringify(expected))}`,
    };
  },
};
