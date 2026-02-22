import type { HttpRequestHandler } from 'msw';
import type { Mock } from 'vitest';
import type { Assertion } from '../../types/index.js';
import { checkEquality } from '../../utils/checkEquality.js';
import { checkMockedHandler } from '../../utils/checkMockedHandler.js';
import { formatMockCalls } from '../../utils/formatMockCalls.js';

declare module 'msw' {
  interface HttpHandler {
    jsonBodyAssertion?: Mock;
  }
  interface GraphQLHandler {
    jsonBodyAssertion?: Mock;
  }
}

export const toHaveBeenRequestedWithJsonBody: Assertion = {
  name: 'toHaveBeenRequestedWithJsonBody',
  interceptHttp:
    (mockFn, original: HttpRequestHandler): HttpRequestHandler =>
    (path, resolver, options, ...rest) => {
      const jsonBodyAssertion = mockFn();
      jsonBodyAssertion.mockName(
        typeof path === 'string'
          ? path
          : path instanceof RegExp
            ? path.source
            : path.name,
      );

      const newResolver: typeof resolver = async (info, ...args) => {
        const { request } = info;
        const clone = request.clone();
        try {
          const payload = await clone.json();
          jsonBodyAssertion(payload);
        } catch {
          jsonBodyAssertion(undefined);
        }

        return resolver(info, ...args);
      };

      const handler = original(path, newResolver, options, ...rest);

      handler.jsonBodyAssertion = jsonBodyAssertion;

      return handler;
    },
  interceptGql:
    (mockFn, original) =>
    (operationName, resolver, options, ...rest) => {
      const jsonBodyAssertion = mockFn();
      jsonBodyAssertion.mockName(
        typeof operationName === 'string'
          ? operationName
          : operationName.toString(),
      );

      const newResolver: typeof resolver = async (info, ...args) => {
        const { request } = info;
        const clone = request.clone();
        try {
          const payload = await clone.json();
          jsonBodyAssertion(payload);
        } catch {
          jsonBodyAssertion(undefined);
        }

        return resolver(info, ...args);
      };

      const handler = original(operationName, newResolver, options, ...rest);

      handler.jsonBodyAssertion = jsonBodyAssertion;

      return handler;
    },
  assert: function (received, expected) {
    checkMockedHandler(received);
    const assertion = received.jsonBodyAssertion;
    if (!assertion) throw new Error('No JSON body assertion found');

    const name = assertion.getMockName();
    const calls = assertion.mock.calls;

    const { isNot } = this;
    return {
      pass: calls.some((call) => checkEquality(call[0], expected)),
      message: () =>
        formatMockCalls(
          name,
          calls,
          `Expected ${name} to${isNot ? ' not' : ''} have been requested with JSON body ${this.utils.printExpected(JSON.stringify(expected))}`,
        ),
    };
  },
};
