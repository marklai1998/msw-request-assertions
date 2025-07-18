import type { Assertion } from "../../types";
import { checkEquality } from "../../utils";
import { checkMockedHttpHandler } from "../../utils/checkMockedHttpHandler";

export const toHaveBeenNthRequestedWith: Assertion = {
  name: "toHaveBeenNthRequestedWith",
  interceptHttp: (original) => original,
  assert: function (received, time, expected) {
    checkMockedHttpHandler(received);

    const bodyAssertionCalls = received.bodyAssertion.mock.calls;
    const queryAssertionCalls = received.queryAssertion.mock.calls;
    const jsonBodyAssertionCalls = received.jsonBodyAssertion.mock.calls;
    const headersAssertionCalls = received.headersAssertion.mock.calls;
    const hashAssertionCalls = received.hashAssertion.mock.calls;

    const nthCall = {
      bodyAssertionCall: bodyAssertionCalls[time - 1],
      queryAssertionCall: queryAssertionCalls[time - 1],
      jsonBodyAssertionCall: jsonBodyAssertionCalls[time - 1],
      headersAssertionCall: headersAssertionCalls[time - 1],
      hashAssertionCall: hashAssertionCalls[time - 1],
    };

    let isBodyMatch = true;
    let isJsonBodyMatch = true;
    let isQueryMatch = true;
    let isHeadersMatch = true;
    let isHashMatch = true;

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

    if ("query" in expected) {
      isQueryMatch = checkEquality(
        expected.query,
        nthCall.queryAssertionCall?.[0],
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

    const allMatch =
      isBodyMatch &&
      isJsonBodyMatch &&
      isQueryMatch &&
      isHeadersMatch &&
      isHashMatch;

    // Build actual object for error message
    const actual: any = {};
    if ("jsonBody" in expected) {
      actual.jsonBody = nthCall.jsonBodyAssertionCall?.[0];
    }
    if ("body" in expected) {
      actual.body = nthCall.bodyAssertionCall?.[0];
    }
    if ("query" in expected) {
      actual.query = nthCall.queryAssertionCall?.[0];
    }
    if ("headers" in expected) {
      actual.headers = nthCall.headersAssertionCall?.[0];
    }
    if ("hash" in expected) {
      actual.hash = nthCall.hashAssertionCall?.[0];
    }

    const { isNot } = this;
    return {
      pass: allMatch,
      message: () =>
        `Expected ${received.bodyAssertion.getMockName()} to${isNot ? " not" : ""} have been called the ${time}${time === 1 ? "st" : time === 2 ? "nd" : time === 3 ? "rd" : "th"} time with request matching ${this.utils.printExpected(JSON.stringify(expected))}, but it was called with ${this.utils.printReceived(JSON.stringify(actual))}`,
    };
  },
};
