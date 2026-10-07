import { GraphQLHandler } from 'msw/graphql';

export function checkMockedGraphQLHandler(
  input: unknown,
): asserts input is GraphQLHandler {
  if (!(input instanceof GraphQLHandler)) {
    throw new Error('Expected a GraphQLHandler');
  }
}
