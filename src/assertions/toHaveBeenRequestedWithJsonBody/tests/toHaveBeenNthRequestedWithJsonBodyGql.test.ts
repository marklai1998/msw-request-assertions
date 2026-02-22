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

describe('toHaveBeenNthRequestedWithJsonBody - GraphQL', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  it('should match specific call position', async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: '123' },
    );
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: '456' },
    );

    expect(getUserQuery).toHaveBeenNthRequestedWithJsonBody(1, {
      query: `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      variables: { userId: '123' },
    });
    expect(getUserQuery).toHaveBeenNthRequestedWithJsonBody(2, {
      query: `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      variables: { userId: '456' },
    });
  });

  it('should match nth request with complex JSON body', async () => {
    await executeGraphQL(
      `mutation CreateUser($input: CreateUserInput!) { createUser(input: $input) { id name } }`,
      {
        input: {
          name: 'Jane Doe',
          email: 'jane@example.com',
          metadata: { role: 'admin' },
        },
      },
    );
    await executeGraphQL(
      `mutation CreateUser($input: CreateUserInput!) { createUser(input: $input) { id name } }`,
      {
        input: {
          name: 'John Smith',
          email: 'john@example.com',
          metadata: { role: 'user' },
        },
      },
    );

    expect(createUserMutation).toHaveBeenNthRequestedWithJsonBody(1, {
      query: `mutation CreateUser($input: CreateUserInput!) { createUser(input: $input) { id name } }`,
      variables: {
        input: {
          name: 'Jane Doe',
          email: 'jane@example.com',
          metadata: { role: 'admin' },
        },
      },
    });
    expect(createUserMutation).toHaveBeenNthRequestedWithJsonBody(2, {
      query: `mutation CreateUser($input: CreateUserInput!) { createUser(input: $input) { id name } }`,
      variables: {
        input: {
          name: 'John Smith',
          email: 'john@example.com',
          metadata: { role: 'user' },
        },
      },
    });
  });

  it('should match with different operation types at specific positions', async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: '123' },
    );
    await executeGraphQL(
      `mutation CreateUser($input: CreateUserInput!) { createUser(input: $input) { id name } }`,
      {
        input: {
          name: 'New User',
          email: 'newuser@example.com',
        },
      },
    );

    expect(getUserQuery).toHaveBeenNthRequestedWithJsonBody(1, {
      query: `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      variables: { userId: '123' },
    });
    expect(createUserMutation).toHaveBeenNthRequestedWithJsonBody(1, {
      query: `mutation CreateUser($input: CreateUserInput!) { createUser(input: $input) { id name } }`,
      variables: {
        input: {
          name: 'New User',
          email: 'newuser@example.com',
        },
      },
    });
  });

  it("should fail when nth call doesn't match", async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: '123' },
    );
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: '456' },
    );

    expect(() => {
      expect(getUserQuery).toHaveBeenNthRequestedWithJsonBody(2, {
        query: `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
        variables: { userId: 'wrong-id' },
      });
    }).toThrow();
  });

  it('should fail when call index is out of bounds', async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: '123' },
    );

    expect(() => {
      expect(getUserQuery).toHaveBeenNthRequestedWithJsonBody(2, {
        query: `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
        variables: { userId: '123' },
      });
    }).toThrow();
  });

  it('should work with not matcher', async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: '123' },
    );
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: '456' },
    );

    expect(getUserQuery).not.toHaveBeenNthRequestedWithJsonBody(1, {
      query: `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      variables: { userId: 'wrong-id' },
    });
    expect(getUserQuery).not.toHaveBeenNthRequestedWithJsonBody(2, {
      query: `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      variables: { userId: 'wrong-id' },
    });
  });
});
