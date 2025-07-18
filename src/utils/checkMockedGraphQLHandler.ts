import { GraphQLHandler } from "msw";

export function checkMockedGraphQLHandler(
  input: unknown,
): asserts input is GraphQLHandler {
  if (!(input instanceof GraphQLHandler)) {
    throw new Error("Expected a GraphQLHandler");
  }
  if (!input.variablesAssertion) {
    throw new Error("GraphQLHandler is not intercepted");
  }
}
