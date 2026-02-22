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

describe('toHaveBeenRequestedWithHeaders - GraphQL', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  it('should match when called with expected headers', async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: '123' },
      { authorization: 'Bearer token123' },
    );

    expect(getUserQuery).toHaveBeenRequestedWithHeaders({
      authorization: 'Bearer token123',
      'content-type': 'application/json',
    });
  });

  it('should match with partial headers', async () => {
    await executeGraphQL(
      `mutation CreateUser($input: CreateUserInput!) { createUser(input: $input) { id name } }`,
      {
        input: {
          name: 'John Doe',
          email: 'john@example.com',
        },
      },
      {
        authorization: 'Bearer token456',
        'x-user-id': 'user123',
        'x-custom-header': 'value',
      },
    );

    expect(createUserMutation).toHaveBeenRequestedWithHeaders({
      authorization: 'Bearer token456',
      'content-type': 'application/json',
      'x-user-id': 'user123',
      'x-custom-header': 'value',
    });
  });

  it('should match with multiple custom headers', async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: '123' },
      {
        'x-api-key': 'key123',
        'x-client-version': '1.0.0',
        'x-request-id': 'req-456',
      },
    );

    expect(getUserQuery).toHaveBeenRequestedWithHeaders({
      'x-api-key': 'key123',
      'x-client-version': '1.0.0',
      'x-request-id': 'req-456',
      'content-type': 'application/json',
    });
  });

  it("should fail when headers don't match", async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: '123' },
      { authorization: 'Bearer token123' },
    );

    expect(() => {
      expect(getUserQuery).toHaveBeenRequestedWithHeaders({
        authorization: 'Bearer wrong-token',
        'content-type': 'application/json',
      });
    }).toThrow();
  });

  it('should work with not matcher', async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: '123' },
      { authorization: 'Bearer token123' },
    );

    expect(getUserQuery).not.toHaveBeenRequestedWithHeaders({
      authorization: 'Bearer wrong-token',
      'content-type': 'application/json',
    });
  });

  it('should match any call when multiple calls made', async () => {
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

    expect(getUserQuery).toHaveBeenRequestedWithHeaders({
      authorization: 'Bearer token1',
      'content-type': 'application/json',
    });
    expect(getUserQuery).toHaveBeenRequestedWithHeaders({
      authorization: 'Bearer token2',
      'content-type': 'application/json',
    });
  });
});
