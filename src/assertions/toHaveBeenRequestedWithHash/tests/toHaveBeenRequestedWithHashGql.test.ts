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

describe('toHaveBeenRequestedWithHash - GraphQL', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  it('should match when called with expected hash', async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: '123' },
      '#section1',
    );

    expect(getUserQuery).toHaveBeenRequestedWithHash('#section1');
  });

  it('should match with complex hash', async () => {
    await executeGraphQL(
      `mutation CreateUser($input: CreateUserInput!) { createUser(input: $input) { id name } }`,
      {
        input: {
          name: 'John Doe',
          email: 'john@example.com',
        },
      },
      '#user-creation-form',
    );

    expect(createUserMutation).toHaveBeenRequestedWithHash(
      '#user-creation-form',
    );
  });

  it('should match with empty hash', async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: '123' },
      '',
    );

    expect(getUserQuery).toHaveBeenRequestedWithHash('');
  });

  it("should fail when hash doesn't match", async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: '123' },
      '#section1',
    );

    expect(() => {
      expect(getUserQuery).toHaveBeenRequestedWithHash('#section2');
    }).toThrow();
  });

  it('should work with not matcher', async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: '123' },
      '#section1',
    );

    expect(getUserQuery).not.toHaveBeenRequestedWithHash('#section2');
  });

  it('should match any call when multiple calls made', async () => {
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

    expect(getUserQuery).toHaveBeenRequestedWithHash('#section1');
    expect(getUserQuery).toHaveBeenRequestedWithHash('#section2');
  });
});
