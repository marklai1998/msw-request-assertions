import { HttpHandler } from "msw";
import { equals } from "ramda";
import type { assertFn } from "../types/index.js";

export const toHaveBeenRequestedWith: assertFn = function (received, expected) {
  if (!(received instanceof HttpHandler)) {
    throw new Error("Expected a HttpHandler");
  }

  const bodyAssertionCalls = received.bodyAssertion.mock.calls;
  const queryAssertionCalls = received.queryAssertion.mock.calls;
  const jsonBodyAssertionCalls = received.jsonBodyAssertion.mock.calls;
  const headersAssertionCalls = received.headersAssertion.mock.calls;
  const hashAssertionCalls = received.hashAssertion.mock.calls;

  const calls = bodyAssertionCalls.map((bodyAssertionCall, idx) => ({
    bodyAssertionCall,
    queryAssertionCall: queryAssertionCalls[idx],
    jsonBodyAssertionCall: jsonBodyAssertionCalls[idx],
    headersAssertionCall: headersAssertionCalls[idx],
    hashAssertionCall: hashAssertionCalls[idx],
  }));

  const { isNot } = this;
  return {
    // TODO: expect.any handling
    pass: calls.some((call) => {
      let isBodyMatch = true;
      let isJsonBodyMatch = true;
      let isQueryMatch = true;
      let isHeadersMatch = true;
      let isHashMatch = true;

      if ("jsonBody" in expected) {
        isJsonBodyMatch = equals(
          expected.jsonBody,
          call.jsonBodyAssertionCall[0],
        );
      }

      if ("body" in expected) {
        isBodyMatch = equals(expected.body, call.bodyAssertionCall[0]);
      }

      if ("query" in expected) {
        isQueryMatch = equals(expected.query, call.queryAssertionCall[0]);
      }

      if ("headers" in expected) {
        isHeadersMatch = equals(expected.headers, call.headersAssertionCall[0]);
      }

      if ("hash" in expected) {
        isHashMatch = equals(expected.hash, call.hashAssertionCall[0]);
      }

      return (
        isBodyMatch &&
        isJsonBodyMatch &&
        isQueryMatch &&
        isHeadersMatch &&
        isHashMatch
      );
    }),
    // TODO: message_call
    message: () => `${received} is${isNot ? " not" : ""} foo`,
  };
};
