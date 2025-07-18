import { GraphQLHandler } from "msw";
import type { Assertion } from "../../types/index.js";
import { checkMockedHandler } from "../../utils/checkMockedHandler.js";
import { checkEquality } from "../../utils/index.js";

export const toHaveBeenRequestedWith: Assertion = {
  name: "toHaveBeenRequestedWith",
  interceptHttp: (_mockFn, original) => original,
  interceptGql: (_mockFn, original) => original,
  assert: function (received, expected) {
    checkMockedHandler(received);

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
      bodyAssertionCall,
      queryStringAssertionCall: queryStringAssertionCalls[idx],
      jsonBodyAssertionCall: jsonBodyAssertionCalls[idx],
      headersAssertionCall: headersAssertionCalls[idx],
      hashAssertionCall: hashAssertionCalls[idx],
      pathParametersAssertionCall: pathParametersAssertionCalls[idx],
      gqlVariablesAssertionCall: gqlVariablesAssertionCalls[idx],
      gqlQueryAssertionCall: gqlQueryAssertionCalls[idx],
    }));

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
            call.jsonBodyAssertionCall[0],
          );
        }

        if ("body" in expected) {
          isBodyMatch = checkEquality(expected.body, call.bodyAssertionCall[0]);
        }

        if ("queryString" in expected) {
          isQueryStringMatch = checkEquality(
            expected.queryString,
            call.queryStringAssertionCall[0],
          );
        }

        if ("headers" in expected) {
          isHeadersMatch = checkEquality(
            expected.headers,
            call.headersAssertionCall[0],
          );
        }

        if ("hash" in expected) {
          isHashMatch = checkEquality(expected.hash, call.hashAssertionCall[0]);
        }

        if ("pathParameters" in expected) {
          isPathParametersMatch = checkEquality(
            expected.pathParameters,
            call.pathParametersAssertionCall[0],
          );
        }

        if ("gqlVariables" in expected) {
          isGqlVariablesMatch = checkEquality(
            expected.gqlVariables,
            call.gqlVariablesAssertionCall[0],
          );
        }

        if ("gqlQuery" in expected) {
          isGqlQueryMatch = checkEquality(
            expected.gqlQuery,
            call.gqlQueryAssertionCall[0],
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
        `Expected ${received.bodyAssertion?.getMockName()} to${isNot ? " not" : ""} have been requested with body ${this.utils.printExpected(JSON.stringify(expected))}`,
    };
  },
};
