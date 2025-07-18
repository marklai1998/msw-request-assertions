import { GraphQLHandler } from "msw";
import type { Assertion } from "../../types/index.js";
import { checkEquality } from "../../utils/checkEquality.js";
import { checkMockedHandler } from "../../utils/checkMockedHandler.js";
import { formatMockCalls } from "../../utils/formatMockCalls.js";

export const toHaveBeenRequestedWith: Assertion = {
  name: "toHaveBeenRequestedWith",
  interceptHttp: (_mockFn, original) => original,
  interceptGql: (_mockFn, original) => original,
  assert: function (received, expected) {
    checkMockedHandler(received);
    if (!received.requestedAssertion) throw new Error("No assertion found");

    const { isNot } = this;

    const bodyAssertionCalls = received.bodyAssertion?.mock.calls ?? [];
    const queryStringAssertionCalls =
      received.queryStringAssertion?.mock.calls ?? [];
    const jsonBodyAssertionCalls = received.jsonBodyAssertion?.mock.calls ?? [];
    const headersAssertionCalls = received.headersAssertion?.mock.calls ?? [];
    const hashAssertionCalls = received.hashAssertion?.mock.calls ?? [];
    const pathParametersAssertionCalls =
      received.pathParametersAssertion?.mock.calls ?? [];
    const gqlVariablesAssertionCalls =
      received instanceof GraphQLHandler
        ? (received.gqlVariablesAssertion?.mock.calls ?? [])
        : [];
    const gqlQueryAssertionCalls =
      received instanceof GraphQLHandler
        ? (received.gqlQueryAssertion?.mock.calls ?? [])
        : [];

    const calls = bodyAssertionCalls.map((bodyAssertionCall, idx) => {
      const call: { [key: string]: unknown } = {};

      if ("jsonBody" in expected) {
        call.jsonBody = jsonBodyAssertionCalls[idx]?.[0];
      }
      if ("body" in expected) {
        call.body = bodyAssertionCall?.[0];
      }
      if ("queryString" in expected) {
        call.queryString = queryStringAssertionCalls[idx]?.[0];
      }
      if ("headers" in expected) {
        call.headers = headersAssertionCalls[idx]?.[0];
      }
      if ("hash" in expected) {
        call.hash = hashAssertionCalls[idx]?.[0];
      }

      if ("pathParameters" in expected) {
        call.pathParameters = pathParametersAssertionCalls[idx]?.[0];
      }

      if ("gqlVariables" in expected) {
        call.gqlVariables = gqlVariablesAssertionCalls[idx]?.[0];
      }

      if ("gqlQuery" in expected) {
        call.gqlQuery = gqlQueryAssertionCalls[idx]?.[0];
      }

      return call;
    });

    const name = received.requestedAssertion.getMockName();

    return {
      pass: calls.some((call) => checkEquality(expected, call)),
      message: () =>
        formatMockCalls(
          name,
          calls.map((call) => [call]),
          `Expected ${name} to${isNot ? " not" : ""} have been requested with body ${this.utils.printExpected(JSON.stringify(expected))}`,
        ),
    };
  },
};
