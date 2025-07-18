import { GraphQLHandler } from "msw";
import type { Assertion } from "../../types/index.js";
import { checkMockedHandler } from "../../utils/checkMockedHandler.js";
import { checkEquality } from "../../utils/index.js";

export const toHaveBeenNthRequestedWith: Assertion = {
  name: "toHaveBeenNthRequestedWith",
  interceptHttp: (_mockFn, original) => original,
  interceptGql: (_mockFn, original) => original,
  assert: function (received, time, expected) {
    checkMockedHandler(received);

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

    const nthCall = {
      bodyAssertionCall: bodyAssertionCalls[time - 1],
      queryStringAssertionCall: queryStringAssertionCalls[time - 1],
      jsonBodyAssertionCall: jsonBodyAssertionCalls[time - 1],
      headersAssertionCall: headersAssertionCalls[time - 1],
      hashAssertionCall: hashAssertionCalls[time - 1],
      pathParametersAssertionCall: pathParametersAssertionCalls[time - 1],
      gqlVariablesAssertionCall: gqlVariablesAssertionCalls[time - 1],
      gqlQueryAssertionCall: gqlQueryAssertionCalls[time - 1],
    };

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
        nthCall.jsonBodyAssertionCall?.[0],
      );
    }

    if ("body" in expected) {
      isBodyMatch = checkEquality(
        expected.body,
        nthCall.bodyAssertionCall?.[0],
      );
    }

    if ("queryString" in expected) {
      isQueryStringMatch = checkEquality(
        expected.queryString,
        nthCall.queryStringAssertionCall?.[0],
      );
    }

    if ("headers" in expected) {
      isHeadersMatch = checkEquality(
        expected.headers,
        nthCall.headersAssertionCall?.[0],
      );
    }

    if ("hash" in expected) {
      isHashMatch = checkEquality(
        expected.hash,
        nthCall.hashAssertionCall?.[0],
      );
    }

    if ("pathParameters" in expected) {
      isPathParametersMatch = checkEquality(
        expected.pathParameters,
        nthCall.pathParametersAssertionCall?.[0],
      );
    }

    if ("gqlVariables" in expected) {
      isGqlVariablesMatch = checkEquality(
        expected.gqlVariables,
        nthCall.gqlVariablesAssertionCall?.[0],
      );
    }

    if ("gqlQuery" in expected) {
      isGqlQueryMatch = checkEquality(
        expected.gqlQuery,
        nthCall.gqlQueryAssertionCall?.[0],
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
      actual.jsonBody = nthCall.jsonBodyAssertionCall?.[0];
    }
    if ("body" in expected) {
      actual.body = nthCall.bodyAssertionCall?.[0];
    }
    if ("queryString" in expected) {
      actual.queryString = nthCall.queryStringAssertionCall?.[0];
    }
    if ("headers" in expected) {
      actual.headers = nthCall.headersAssertionCall?.[0];
    }
    if ("hash" in expected) {
      actual.hash = nthCall.hashAssertionCall?.[0];
    }

    if ("pathParameters" in expected) {
      actual.pathParameters = nthCall.pathParametersAssertionCall?.[0];
    }

    if ("gqlVariables" in expected) {
      actual.gqlVariables = nthCall.gqlVariablesAssertionCall?.[0];
    }

    if ("gqlQuery" in expected) {
      actual.gqlQuery = nthCall.gqlQueryAssertionCall?.[0];
    }

    return {
      pass: allMatch,
      message: () =>
        `Expected ${received.bodyAssertion?.getMockName()} to${isNot ? " not" : ""} have been called the ${time}${time === 1 ? "st" : time === 2 ? "nd" : time === 3 ? "rd" : "th"} time with request matching ${this.utils.printExpected(JSON.stringify(expected))}, but it was called with ${this.utils.printReceived(JSON.stringify(actual))}`,
    };
  },
};
