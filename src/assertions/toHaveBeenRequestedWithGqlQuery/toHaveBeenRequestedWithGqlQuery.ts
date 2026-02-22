import type { Mock } from 'vitest';
import type { Assertion } from '../../types/index.js';
import { checkEquality } from '../../utils/checkEquality.js';
import { checkMockedGraphQLHandler } from '../../utils/checkMockedGraphQLHandler.js';
import { formatMockCalls } from '../../utils/formatMockCalls.js';

declare module 'msw' {
  interface GraphQLHandler {
    gqlQueryAssertion?: Mock;
  }
}

export const toHaveBeenRequestedWithGqlQuery: Assertion = {
  name: 'toHaveBeenRequestedWithGqlQuery',
  interceptGql:
    (mockFn, original) =>
    (operationName, resolver, options, ...rest) => {
      const gqlQueryAssertion = mockFn();
      gqlQueryAssertion.mockName(
        typeof operationName === 'string'
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
    const assertion = received.gqlQueryAssertion;
    if (!assertion) throw new Error('No GraphQL query assertion found');

    const name = assertion.getMockName();
    const calls = assertion.mock.calls;

    const { isNot } = this;
    return {
      pass: calls.some((call) => checkEquality(call[0], expected)),
      message: () =>
        formatMockCalls(
          name,
          calls,
          `Expected ${assertion?.getMockName()} to${isNot ? ' not' : ''} have been requested with GraphQL query ${this.utils.printExpected(expected)}`,
        ),
    };
  },
};
