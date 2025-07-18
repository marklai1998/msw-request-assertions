import { GraphQLHandler } from "msw";
import type { Assertion } from "../../types/index.js";
import { checkEquality } from "../../utils/checkEquality.js";
import { checkMockedHandler } from "../../utils/checkMockedHandler.js";
import { formatMockCalls, ordinalOf } from "../../utils/formatMockCalls.js";

export const toHaveBeenNthRequestedWith: Assertion = {
  name: "toHaveBeenNthRequestedWith",
  interceptHttp: (_mockFn, original) => original,
  interceptGql: (_mockFn, original) => original,
  assert: function (received, time, expected) {
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
      received.pathParametersAssertion?.mock.calls || [];
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

    const nthCall = calls[time - 1];

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
        nthCall.jsonBodyAssertionCall,
      );
    }

    if ("body" in expected) {
      isBodyMatch = checkEquality(expected.body, nthCall.bodyAssertionCall);
    }

    if ("queryString" in expected) {
      isQueryStringMatch = checkEquality(
        expected.queryString,
        nthCall.queryStringAssertionCall,
      );
    }

    if ("headers" in expected) {
      isHeadersMatch = checkEquality(
        expected.headers,
        nthCall.headersAssertionCall,
      );
    }

    if ("hash" in expected) {
      isHashMatch = checkEquality(expected.hash, nthCall.hashAssertionCall);
    }

    if ("pathParameters" in expected) {
      isPathParametersMatch = checkEquality(
        expected.pathParameters,
        nthCall.pathParametersAssertionCall,
      );
    }

    if ("gqlVariables" in expected) {
      isGqlVariablesMatch = checkEquality(
        expected.gqlVariables,
        nthCall.gqlVariablesAssertionCall,
      );
    }

    if ("gqlQuery" in expected) {
      isGqlQueryMatch = checkEquality(
        expected.gqlQuery,
        nthCall.gqlQueryAssertionCall,
      );
    }

    const allMatch =
      isBodyMatch &&
      isJsonBodyMatch &&
      isQueryStringMatch &&
      isHeadersMatch &&
      isHashMatch &&
      isPathParametersMatch &&
      isGqlVariablesMatch &&
      isGqlQueryMatch;

    const actual: any = {};
    if ("jsonBody" in expected) {
      actual.jsonBody = nthCall.jsonBodyAssertionCall;
    }
    if ("body" in expected) {
      actual.body = nthCall.bodyAssertionCall;
    }
    if ("queryString" in expected) {
      actual.queryString = nthCall.queryStringAssertionCall;
    }
    if ("headers" in expected) {
      actual.headers = nthCall.headersAssertionCall;
    }
    if ("hash" in expected) {
      actual.hash = nthCall.hashAssertionCall;
    }

    if ("pathParameters" in expected) {
      actual.pathParameters = nthCall.pathParametersAssertionCall;
    }

    if ("gqlVariables" in expected) {
      actual.gqlVariables = nthCall.gqlVariablesAssertionCall;
    }

    if ("gqlQuery" in expected) {
      actual.gqlQuery = nthCall.gqlQueryAssertionCall;
    }

    return {
      pass: allMatch,
      message: () =>
        formatMockCalls(
          name,
          // TODO: filter
          calls.map((call) => [call]),
          `Expected ${name} to${isNot ? " not" : ""} have been requested the ${ordinalOf(time)} time with request matching ${this.utils.printExpected(JSON.stringify(expected))}, but it was requested with ${this.utils.printReceived(JSON.stringify(actual))}`,
        ),
    };
  },
};
