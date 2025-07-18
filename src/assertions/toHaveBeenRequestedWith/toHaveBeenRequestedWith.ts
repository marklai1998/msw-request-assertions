import { GraphQLHandler } from "msw";
import type { Assertion } from "../../types";
import { checkEquality } from "../../utils";
import { checkMockedHandler } from "../../utils/checkMockedHandler";

export const toHaveBeenRequestedWith: Assertion = {
  name: "toHaveBeenRequestedWith",
  interceptHttp: (original) => original,
  interceptGql: (original) => original,
  assert: function (received, expected) {
    checkMockedHandler(received);

    const { isNot } = this;

    const bodyAssertionCalls = received.bodyAssertion.mock.calls;
    const queryAssertionCalls = received.queryAssertion.mock.calls;
    const jsonBodyAssertionCalls = received.jsonBodyAssertion.mock.calls;
    const headersAssertionCalls = received.headersAssertion.mock.calls;
    const hashAssertionCalls = received.hashAssertion.mock.calls;
    const variablesAssertionCalls =
      received instanceof GraphQLHandler
        ? received.variablesAssertion.mock.calls
        : [];

    const calls = bodyAssertionCalls.map((bodyAssertionCall, idx) => ({
      bodyAssertionCall,
      queryAssertionCall: queryAssertionCalls[idx],
      jsonBodyAssertionCall: jsonBodyAssertionCalls[idx],
      headersAssertionCall: headersAssertionCalls[idx],
      hashAssertionCall: hashAssertionCalls[idx],
      variablesAssertionCall: variablesAssertionCalls[idx],
    }));

    return {
      pass: calls.some((call) => {
        let isBodyMatch = true;
        let isJsonBodyMatch = true;
        let isQueryMatch = true;
        let isHeadersMatch = true;
        let isHashMatch = true;
        let isVariablesMatch = true;

        if ("jsonBody" in expected) {
          isJsonBodyMatch = checkEquality(
            expected.jsonBody,
            call.jsonBodyAssertionCall[0],
          );
        }

        if ("body" in expected) {
          isBodyMatch = checkEquality(expected.body, call.bodyAssertionCall[0]);
        }

        if ("query" in expected) {
          isQueryMatch = checkEquality(
            expected.query,
            call.queryAssertionCall[0],
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

        if ("variables" in expected) {
          isVariablesMatch = checkEquality(
            expected.variables,
            call.variablesAssertionCall[0],
          );
        }

        return (
          isBodyMatch &&
          isJsonBodyMatch &&
          isQueryMatch &&
          isHeadersMatch &&
          isHashMatch &&
          isVariablesMatch
        );
      }),
      message: () =>
        `Expected ${received.bodyAssertion.getMockName()} to${isNot ? " not" : ""} have been requested with body ${this.utils.printExpected(JSON.stringify(expected))}`,
    };
  },
};
