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
  hash?: string,
) {
  const url = `http://localhost/graphql${hash || ''}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  return response.json();
}

describe('toHaveBeenNthRequestedWithHash - GraphQL', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  it('should match specific call position', async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: '123' },
      '#section1',
    );
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: '456' },
      '#section2',
    );

    expect(getUserQuery).toHaveBeenNthRequestedWithHash(1, '#section1');
    expect(getUserQuery).toHaveBeenNthRequestedWithHash(2, '#section2');
  });

  it('should match nth request with complex hash', async () => {
    await executeGraphQL(
      `mutation CreateUser($input: CreateUserInput!) { createUser(input: $input) { id name } }`,
      {
        input: {
          name: 'Jane Doe',
          email: 'jane@example.com',
        },
      },
      '#user-form-step1',
    );
    await executeGraphQL(
      `mutation CreateUser($input: CreateUserInput!) { createUser(input: $input) { id name } }`,
      {
        input: {
          name: 'John Smith',
          email: 'john@example.com',
        },
      },
      '#user-form-step2',
    );

    expect(createUserMutation).toHaveBeenNthRequestedWithHash(
      1,
      '#user-form-step1',
    );
    expect(createUserMutation).toHaveBeenNthRequestedWithHash(
      2,
      '#user-form-step2',
    );
  });

  it('should match with empty hash at specific position', async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: '123' },
      '',
    );
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: '456' },
      '#section1',
    );

    expect(getUserQuery).toHaveBeenNthRequestedWithHash(1, '');
    expect(getUserQuery).toHaveBeenNthRequestedWithHash(2, '#section1');
  });

  it("should fail when nth call doesn't match", async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: '123' },
      '#section1',
    );
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: '456' },
      '#section2',
    );

    expect(() => {
      expect(getUserQuery).toHaveBeenNthRequestedWithHash(2, '#section999');
    }).toThrow();
  });

  it('should fail when call index is out of bounds', async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: '123' },
      '#section1',
    );

    expect(() => {
      expect(getUserQuery).toHaveBeenNthRequestedWithHash(2, '#section1');
    }).toThrow();
  });

  it('should work with not matcher', async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: '123' },
      '#section1',
    );
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: '456' },
      '#section2',
    );

    expect(getUserQuery).not.toHaveBeenNthRequestedWithHash(1, '#section999');
    expect(getUserQuery).not.toHaveBeenNthRequestedWithHash(2, '#section999');
  });
});
