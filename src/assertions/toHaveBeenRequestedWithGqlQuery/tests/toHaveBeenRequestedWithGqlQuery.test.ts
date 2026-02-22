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

describe('toHaveBeenRequestedWithGqlQuery', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  it('should match when requested with expected query', async () => {
    const queryString = `query GetUser($userId: ID!) { user(id: $userId) { id name } }`;
    await executeGraphQL(queryString, { userId: '123' });

    expect(getUserQuery).toHaveBeenRequestedWithGqlQuery(queryString);
  });

  it('should match mutation query', async () => {
    const mutationString = `mutation CreateUser($input: CreateUserInput!) { createUser(input: $input) { id name } }`;
    await executeGraphQL(mutationString, {
      input: { name: 'John Doe', email: 'john@example.com' },
    });

    expect(createUserMutation).toHaveBeenRequestedWithGqlQuery(mutationString);
  });

  it('should match with complex nested query', async () => {
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
    await executeGraphQL(complexQuery, { userId: '123' });

    expect(getUserQuery).toHaveBeenRequestedWithGqlQuery(complexQuery);
  });

  it("should fail when query doesn't match", async () => {
    const queryString = `query GetUser($userId: ID!) { user(id: $userId) { id name } }`;
    await executeGraphQL(queryString, { userId: '123' });

    expect(() => {
      expect(getUserQuery).toHaveBeenRequestedWithGqlQuery(
        `query GetUser($userId: ID!) { user(id: $userId) { id } }`,
      );
    }).toThrow();
  });

  it('should work with not matcher', async () => {
    const queryString = `query GetUser($userId: ID!) { user(id: $userId) { id name } }`;
    await executeGraphQL(queryString, { userId: '123' });

    expect(getUserQuery).not.toHaveBeenRequestedWithGqlQuery(
      `query GetUser($userId: ID!) { user(id: $userId) { id } }`,
    );
  });

  it('should match any call when multiple calls made', async () => {
    const query1 = `query GetUser($userId: ID!) { user(id: $userId) { id name } }`;
    const query2 = `query GetUser($userId: ID!) { user(id: $userId) { id name email } }`;

    await executeGraphQL(query1, { userId: '123' });
    await executeGraphQL(query2, { userId: '456' });

    expect(getUserQuery).toHaveBeenRequestedWithGqlQuery(query1);
    expect(getUserQuery).toHaveBeenRequestedWithGqlQuery(query2);
  });
});
