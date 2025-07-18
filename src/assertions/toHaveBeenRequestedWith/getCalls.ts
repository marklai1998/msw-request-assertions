import { GraphQLHandler, type HttpHandler } from "msw";

export const getCalls = (
  received: HttpHandler | GraphQLHandler,
  expected: unknown,
) => {
  if (!expected) throw new Error("Expected must be defined");
  if (typeof expected !== "object")
    throw new Error("Expected must be an object");

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

  return bodyAssertionCalls.map((bodyAssertionCall, idx) => {
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
};
