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

async function executeGraphQL(
  query: string,
  variables?: unknown,
  headers?: Record<string, string>,
) {
  const response = await fetch('http://localhost/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({ query, variables }),
  });
  return response.json();
}

describe('toHaveBeenNthRequestedWithHeaders - GraphQL', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  it('should match specific call position', async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: '123' },
      { authorization: 'Bearer token1' },
    );
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: '456' },
      { authorization: 'Bearer token2' },
    );

    expect(getUserQuery).toHaveBeenNthRequestedWithHeaders(1, {
      authorization: 'Bearer token1',
      'content-type': 'application/json',
    });
    expect(getUserQuery).toHaveBeenNthRequestedWithHeaders(2, {
      authorization: 'Bearer token2',
      'content-type': 'application/json',
    });
  });

  it('should match nth request with complex headers', async () => {
    await executeGraphQL(
      `mutation CreateUser($input: CreateUserInput!) { createUser(input: $input) { id name } }`,
      {
        input: {
          name: 'Jane Doe',
          email: 'jane@example.com',
        },
      },
      {
        authorization: 'Bearer token1',
        'x-user-id': 'user123',
        'x-request-id': 'req1',
      },
    );
    await executeGraphQL(
      `mutation CreateUser($input: CreateUserInput!) { createUser(input: $input) { id name } }`,
      {
        input: {
          name: 'John Smith',
          email: 'john@example.com',
        },
      },
      {
        authorization: 'Bearer token2',
        'x-user-id': 'user456',
        'x-request-id': 'req2',
      },
    );

    expect(createUserMutation).toHaveBeenNthRequestedWithHeaders(1, {
      authorization: 'Bearer token1',
      'content-type': 'application/json',
      'x-user-id': 'user123',
      'x-request-id': 'req1',
    });
    expect(createUserMutation).toHaveBeenNthRequestedWithHeaders(2, {
      authorization: 'Bearer token2',
      'content-type': 'application/json',
      'x-user-id': 'user456',
      'x-request-id': 'req2',
    });
  });

  it('should match with partial headers at specific position', async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: '123' },
      {
        authorization: 'Bearer token1',
        'x-api-key': 'key1',
        'x-custom': 'value1',
      },
    );
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: '456' },
      {
        authorization: 'Bearer token2',
        'x-api-key': 'key2',
        'x-custom': 'value2',
      },
    );

    expect(getUserQuery).toHaveBeenNthRequestedWithHeaders(1, {
      authorization: 'Bearer token1',
      'content-type': 'application/json',
      'x-api-key': 'key1',
      'x-custom': 'value1',
    });
    expect(getUserQuery).toHaveBeenNthRequestedWithHeaders(2, {
      authorization: 'Bearer token2',
      'content-type': 'application/json',
      'x-api-key': 'key2',
      'x-custom': 'value2',
    });
  });

  it("should fail when nth call doesn't match", async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: '123' },
      { authorization: 'Bearer token1' },
    );
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: '456' },
      { authorization: 'Bearer token2' },
    );

    expect(() => {
      expect(getUserQuery).toHaveBeenNthRequestedWithHeaders(2, {
        authorization: 'Bearer wrong-token',
        'content-type': 'application/json',
      });
    }).toThrow();
  });

  it('should fail when call index is out of bounds', async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: '123' },
      { authorization: 'Bearer token1' },
    );

    expect(() => {
      expect(getUserQuery).toHaveBeenNthRequestedWithHeaders(2, {
        authorization: 'Bearer token1',
        'content-type': 'application/json',
      });
    }).toThrow();
  });

  it('should work with not matcher', async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: '123' },
      { authorization: 'Bearer token1' },
    );
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: '456' },
      { authorization: 'Bearer token2' },
    );

    expect(getUserQuery).not.toHaveBeenNthRequestedWithHeaders(1, {
      authorization: 'Bearer wrong-token',
      'content-type': 'application/json',
    });
    expect(getUserQuery).not.toHaveBeenNthRequestedWithHeaders(2, {
      authorization: 'Bearer wrong-token',
      'content-type': 'application/json',
    });
  });
});
