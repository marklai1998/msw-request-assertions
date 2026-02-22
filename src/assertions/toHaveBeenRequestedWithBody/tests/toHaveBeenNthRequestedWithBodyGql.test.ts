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

describe('toHaveBeenNthRequestedWithBody - GraphQL', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  it('should match specific call position', async () => {
    const query = `query GetUser($userId: ID!) { user(id: $userId) { id name } }`;

    await executeGraphQL(query, { userId: '123' });
    await executeGraphQL(query, { userId: '456' });

    const expectedBody1 = JSON.stringify({
      query,
      variables: { userId: '123' },
    });
    const expectedBody2 = JSON.stringify({
      query,
      variables: { userId: '456' },
    });

    expect(getUserQuery).toHaveBeenNthRequestedWithBody(1, expectedBody1);
    expect(getUserQuery).toHaveBeenNthRequestedWithBody(2, expectedBody2);
  });

  it('should match nth request with complex body', async () => {
    const query = `mutation CreateUser($input: CreateUserInput!) { createUser(input: $input) { id name } }`;

    const firstVariables = {
      input: {
        name: 'Jane Doe',
        email: 'jane@example.com',
        metadata: { department: 'engineering', level: 5 },
        tags: ['admin', 'user'],
        isActive: true,
        score: 4.5,
      },
    };

    const secondVariables = {
      input: {
        name: 'John Smith',
        email: 'john@example.com',
      },
    };

    await executeGraphQL(query, firstVariables);
    await executeGraphQL(query, secondVariables);

    const expectedBody1 = JSON.stringify({ query, variables: firstVariables });
    const expectedBody2 = JSON.stringify({ query, variables: secondVariables });

    expect(createUserMutation).toHaveBeenNthRequestedWithBody(1, expectedBody1);
    expect(createUserMutation).toHaveBeenNthRequestedWithBody(2, expectedBody2);
  });

  it("should fail when nth call doesn't match", async () => {
    const query = `query GetUser($userId: ID!) { user(id: $userId) { id name } }`;

    await executeGraphQL(query, { userId: '123' });
    await executeGraphQL(query, { userId: '456' });

    const wrongBody = JSON.stringify({ query, variables: { userId: '999' } });

    expect(() => {
      expect(getUserQuery).toHaveBeenNthRequestedWithBody(2, wrongBody);
    }).toThrow();
  });

  it('should fail when call index is out of bounds', async () => {
    const query = `query GetUser($userId: ID!) { user(id: $userId) { id name } }`;

    await executeGraphQL(query, { userId: '123' });

    const expectedBody = JSON.stringify({
      query,
      variables: { userId: '123' },
    });

    expect(() => {
      expect(getUserQuery).toHaveBeenNthRequestedWithBody(2, expectedBody);
    }).toThrow();
  });

  it('should work with not matcher', async () => {
    const query = `query GetUser($userId: ID!) { user(id: $userId) { id name } }`;

    await executeGraphQL(query, { userId: '123' });
    await executeGraphQL(query, { userId: '456' });

    const wrongBody = JSON.stringify({ query, variables: { userId: '999' } });

    expect(getUserQuery).not.toHaveBeenNthRequestedWithBody(1, wrongBody);
    expect(getUserQuery).not.toHaveBeenNthRequestedWithBody(2, wrongBody);
  });
});
