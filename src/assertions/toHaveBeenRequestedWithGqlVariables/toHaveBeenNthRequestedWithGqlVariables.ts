import type { Assertion } from '../../types/index.js';
import { checkEquality } from '../../utils/checkEquality.js';
import { checkMockedGraphQLHandler } from '../../utils/checkMockedGraphQLHandler.js';
import { formatMockCalls, ordinalOf } from '../../utils/formatMockCalls.js';

export const toHaveBeenNthRequestedWithGqlVariables: Assertion = {
  name: 'toHaveBeenNthRequestedWithGqlVariables',
  interceptGql: (_mockFn, original) => original,
  assert: function (received, time, expected) {
    checkMockedGraphQLHandler(received);
    const assertion = received.gqlVariablesAssertion;
    if (!assertion) throw new Error('No GraphQL variables assertion found');

    const name = assertion.getMockName();
    const calls = assertion.mock.calls;
    const nthCall = calls[time - 1];

    const isMatch = checkEquality(nthCall?.[0], expected);

    const { isNot } = this;
    return {
      pass: isMatch,
      message: () =>
        formatMockCalls(
          name,
          calls,
          `Expected ${name} to${isNot ? ' not' : ''} have been requested the ${ordinalOf(time)} time with GraphQL variables ${this.utils.printExpected(JSON.stringify(expected))}, but it was requested with ${this.utils.printReceived(JSON.stringify(nthCall?.[0]))}`,
        ),
    };
  },
};
