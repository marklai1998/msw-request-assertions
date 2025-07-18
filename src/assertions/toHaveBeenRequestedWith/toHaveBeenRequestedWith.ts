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

    const calls = bodyAssertionCalls.map((bodyAssertionCall, idx) => ({
      bodyAssertionCall: bodyAssertionCall?.[0],
      queryStringAssertionCall: queryStringAssertionCalls[idx]?.[0],
      jsonBodyAssertionCall: jsonBodyAssertionCalls[idx]?.[0],
      headersAssertionCall: headersAssertionCalls[idx]?.[0],
      hashAssertionCall: hashAssertionCalls[idx]?.[0],
      pathParametersAssertionCall: pathParametersAssertionCalls[idx]?.[0],
      gqlVariablesAssertionCall: gqlVariablesAssertionCalls[idx]?.[0],
      gqlQueryAssertionCall: gqlQueryAssertionCalls[idx]?.[0],
    }));

    const name = received.requestedAssertion.getMockName();

    return {
      pass: calls.some((call) => {
        let isBodyMatch = true;
        let isJsonBodyMatch = true;
        let isQueryStringMatch = true;
        let isHeadersMatch = true;
        let isHashMatch = true;
        let isPathParametersMatch = true;
        let isGqlVariablesMatch = true;
        let isGqlQueryMatch = true;

        if ("jsonBody" in expected) {
          isJsonBodyMatch = checkEquality(
            expected.jsonBody,
            call.jsonBodyAssertionCall,
          );
        }

        if ("body" in expected) {
          isBodyMatch = checkEquality(expected.body, call.bodyAssertionCall);
        }

        if ("queryString" in expected) {
          isQueryStringMatch = checkEquality(
            expected.queryString,
            call.queryStringAssertionCall,
          );
        }

        if ("headers" in expected) {
          isHeadersMatch = checkEquality(
            expected.headers,
            call.headersAssertionCall,
          );
        }

        if ("hash" in expected) {
          isHashMatch = checkEquality(expected.hash, call.hashAssertionCall);
        }

        if ("pathParameters" in expected) {
          isPathParametersMatch = checkEquality(
            expected.pathParameters,
            call.pathParametersAssertionCall,
          );
        }

        if ("gqlVariables" in expected) {
          isGqlVariablesMatch = checkEquality(
            expected.gqlVariables,
            call.gqlVariablesAssertionCall,
          );
        }

        if ("gqlQuery" in expected) {
          isGqlQueryMatch = checkEquality(
            expected.gqlQuery,
            call.gqlQueryAssertionCall,
          );
        }

        return (
          isBodyMatch &&
          isJsonBodyMatch &&
          isQueryStringMatch &&
          isHeadersMatch &&
          isHashMatch &&
          isPathParametersMatch &&
          isGqlVariablesMatch &&
          isGqlQueryMatch
        );
      }),
      message: () =>
        formatMockCalls(
          name,
          // TODO: filter
          calls.map((call) => [call]),
          `Expected ${name} to${isNot ? " not" : ""} have been requested with body ${this.utils.printExpected(JSON.stringify(expected))}`,
        ),
    };
  },
};
