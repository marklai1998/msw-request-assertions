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

describe('toHaveBeenNthRequestedWithGqlQuery', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  it('should match specific request position', async () => {
    const query1 = `query GetUser($userId: ID!) { user(id: $userId) { id name } }`;
    const query2 = `query GetUser($userId: ID!) { user(id: $userId) { id name email } }`;

    await executeGraphQL(query1, { userId: '123' });
    await executeGraphQL(query2, { userId: '456' });

    expect(getUserQuery).toHaveBeenNthRequestedWithGqlQuery(1, query1);
    expect(getUserQuery).toHaveBeenNthRequestedWithGqlQuery(2, query2);
  });

  it('should match nth request with complex queries', async () => {
    const mutation1 = `mutation CreateUser($input: CreateUserInput!) { createUser(input: $input) { id name } }`;
    const mutation2 = `mutation CreateUser($input: CreateUserInput!) { createUser(input: $input) { id name email profile { bio } } }`;

    await executeGraphQL(mutation1, {
      input: { name: 'Jane Doe', email: 'jane@example.com' },
    });
    await executeGraphQL(mutation2, {
      input: { name: 'John Smith', email: 'john@example.com' },
    });

    expect(createUserMutation).toHaveBeenNthRequestedWithGqlQuery(1, mutation1);
    expect(createUserMutation).toHaveBeenNthRequestedWithGqlQuery(2, mutation2);
  });

  it('should match with different query structures at specific positions', async () => {
    const simpleQuery = `query GetUser($userId: ID!) { user(id: $userId) { id } }`;
    const complexQuery = `query GetUser($userId: ID!) { 
      user(id: $userId) { 
        id 
        name 
        profile { 
          avatar 
          bio 
        } 
      } 
    }`;

    await executeGraphQL(simpleQuery, { userId: '123' });
    await executeGraphQL(complexQuery, { userId: '456' });

    expect(getUserQuery).toHaveBeenNthRequestedWithGqlQuery(1, simpleQuery);
    expect(getUserQuery).toHaveBeenNthRequestedWithGqlQuery(2, complexQuery);
  });

  it("should fail when nth request doesn't match", async () => {
    const query1 = `query GetUser($userId: ID!) { user(id: $userId) { id name } }`;
    const query2 = `query GetUser($userId: ID!) { user(id: $userId) { id name email } }`;

    await executeGraphQL(query1, { userId: '123' });
    await executeGraphQL(query2, { userId: '456' });

    expect(() => {
      expect(getUserQuery).toHaveBeenNthRequestedWithGqlQuery(2, 'wrong query');
    }).toThrow();
  });

  it('should fail when request index is out of bounds', async () => {
    const queryString = `query GetUser($userId: ID!) { user(id: $userId) { id name } }`;
    await executeGraphQL(queryString, { userId: '123' });

    expect(() => {
      expect(getUserQuery).toHaveBeenNthRequestedWithGqlQuery(2, queryString);
    }).toThrow();
  });

  it('should work with not matcher', async () => {
    const query1 = `query GetUser($userId: ID!) { user(id: $userId) { id name } }`;
    const query2 = `query GetUser($userId: ID!) { user(id: $userId) { id name email } }`;

    await executeGraphQL(query1, { userId: '123' });
    await executeGraphQL(query2, { userId: '456' });

    expect(getUserQuery).not.toHaveBeenNthRequestedWithGqlQuery(
      1,
      'wrong query',
    );
    expect(getUserQuery).not.toHaveBeenNthRequestedWithGqlQuery(
      2,
      'wrong query',
    );
  });
});
