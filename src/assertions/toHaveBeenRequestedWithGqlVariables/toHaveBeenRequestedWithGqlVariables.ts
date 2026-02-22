import type { Mock } from 'vitest';
import type { Assertion } from '../../types/index.js';
import { checkEquality } from '../../utils/checkEquality.js';
import { checkMockedGraphQLHandler } from '../../utils/checkMockedGraphQLHandler.js';
import { formatMockCalls } from '../../utils/formatMockCalls.js';

declare module 'msw' {
  interface GraphQLHandler {
    gqlVariablesAssertion?: Mock;
  }
}

export const toHaveBeenRequestedWithGqlVariables: Assertion = {
  name: 'toHaveBeenRequestedWithGqlVariables',
  interceptGql:
    (mockFn, original) =>
    (operationName, resolver, options, ...rest) => {
      const gqlVariablesAssertion = mockFn();
      gqlVariablesAssertion.mockName(
        typeof operationName === 'string'
          ? operationName
          : operationName.toString(),
      );

      const newResolver: typeof resolver = (info, ...args) => {
        const { variables } = info;
        gqlVariablesAssertion(variables);

        return resolver(info, ...args);
      };

      const handler = original(operationName, newResolver, options, ...rest);

      handler.gqlVariablesAssertion = gqlVariablesAssertion;

      return handler;
    },
  assert: function (received, expected) {
    checkMockedGraphQLHandler(received);
    const assertion = received.gqlVariablesAssertion;
    if (!assertion) throw new Error('No GraphQL variables assertion found');

    const name = assertion.getMockName();
    const calls = assertion.mock.calls;

    const { isNot } = this;
    return {
      pass: calls.some((call) => checkEquality(call[0], expected)),
      message: () =>
        formatMockCalls(
          name,
          calls,
          `Expected ${received.gqlVariablesAssertion?.getMockName()} to${isNot ? ' not' : ''} have been requested with GraphQL variables ${this.utils.printExpected(JSON.stringify(expected))}`,
        ),
    };
  },
};
