import { graphql, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import '../../../vitest';

const getUserQuery = graphql.query('GetUser', ({ variables }) => {
  return HttpResponse.json({
    data: { user: { id: variables.userId, name: 'John Doe' } },
  });
});

const createUserMutation = graphql.mutation('CreateUser', ({ variables }) => {
  return HttpResponse.json({
    data: { user: { id: 'new-id', name: variables.input.name } },
  });
});

const server = setupServer(getUserQuery, createUserMutation);

async function executeGraphQL(query: string, variables?: unknown) {
  const response = await fetch('http://localhost/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  return response.json();
}

describe('toHaveBeenRequestedWith - GraphQL', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  it('should match when called with expected variables', async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: '123' },
    );

    expect(getUserQuery).toHaveBeenRequestedWith({
      gqlVariables: { userId: '123' },
    });
  });

  it('should match with complex variables', async () => {
    const variables = {
      input: {
        name: 'John Doe',
        email: 'john@example.com',
        metadata: { department: 'engineering', level: 5 },
        tags: ['admin', 'user'],
        isActive: true,
        score: 4.5,
      },
    };

    await executeGraphQL(
      `mutation CreateUser($input: CreateUserInput!) { createUser(input: $input) { id name } }`,
      variables,
    );

    expect(createUserMutation).toHaveBeenRequestedWith({
      gqlVariables: variables,
    });
  });

  it("should fail when variables don't match", async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: '123' },
    );

    expect(() => {
      expect(getUserQuery).toHaveBeenRequestedWith({
        gqlVariables: { userId: '456' },
      });
    }).toThrow();
  });

  it('should work with not matcher', async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: '123' },
    );

    expect(getUserQuery).not.toHaveBeenRequestedWith({
      gqlVariables: { userId: '456' },
    });
  });

  it('should match any call when multiple calls made', async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: '123' },
    );
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: '456' },
    );

    expect(getUserQuery).toHaveBeenRequestedWith({
      gqlVariables: { userId: '123' },
    });
    expect(getUserQuery).toHaveBeenRequestedWith({
      gqlVariables: { userId: '456' },
    });
  });

  it('should match when called with expected GraphQL query', async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: '123' },
    );

    expect(getUserQuery).toHaveBeenRequestedWith({
      gqlQuery: `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
    });
  });

  it("should fail when GraphQL query doesn't match", async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: '123' },
    );

    expect(() => {
      expect(getUserQuery).toHaveBeenRequestedWith({
        gqlQuery: `query GetUser($id: ID!) { user(id: $id) { name } }`,
      });
    }).toThrow();
  });

  it('should match when called with both gqlVariables and gqlQuery', async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: '123' },
    );

    expect(getUserQuery).toHaveBeenRequestedWith({
      gqlVariables: { userId: '123' },
      gqlQuery: `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
    });
  });
});
