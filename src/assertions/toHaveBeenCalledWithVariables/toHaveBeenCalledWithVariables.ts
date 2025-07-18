import type { Mock } from "vitest";
import type { Assertion } from "../../types";
import { checkEquality, checkMockedGraphQLHandler } from "../../utils";

declare module "msw" {
  interface GraphQLHandler {
    variablesAssertion: Mock;
  }
}

export const toHaveBeenCalledWithVariables: Assertion = {
  name: "toHaveBeenCalledWithVariables",
  interceptGql:
    (original) =>
    (operationName, resolver, options, ...rest) => {
      const variablesAssertion = vi.fn();
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
        `Expected ${received.variablesAssertion.getMockName()} to${isNot ? " not" : ""} have been called with variables ${this.utils.printExpected(JSON.stringify(expected))}`,
    };
  },
};
