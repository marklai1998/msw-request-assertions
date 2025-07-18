import { GraphQLHandler, HttpHandler } from "msw";

export function checkMockedHandler(
  input: unknown,
): asserts input is HttpHandler | GraphQLHandler {
  const isHttpHandler = input instanceof HttpHandler;
  const isGraphQLHandler = input instanceof GraphQLHandler;

  if (!isHttpHandler && !isGraphQLHandler) {
    throw new Error("Expected a HttpHandler or GraphQLHandler");
  }
}
