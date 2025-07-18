import { graphql, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import "../../../vitest";

const getUserQuery = graphql.query("GetUser", ({ variables }) => {
  return HttpResponse.json({
    data: { user: { id: variables.userId, name: "John Doe" } },
  });
});

const createUserMutation = graphql.mutation("CreateUser", ({ variables }) => {
  return HttpResponse.json({
    data: { user: { id: "new-id", name: variables.input.name } },
  });
});

const server = setupServer(getUserQuery, createUserMutation);

async function executeGraphQL(query: string, variables?: unknown) {
  const response = await fetch("http://localhost/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  return response.json();
}

describe("toHaveBeenRequestedWithJsonBody - GraphQL", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  it("should match when called with expected JSON body", async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: "123" },
    );

    expect(getUserQuery).toHaveBeenRequestedWithJsonBody({
      query: `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      variables: { userId: "123" },
    });
  });

  it("should match mutation with complex variables", async () => {
    await executeGraphQL(
      `mutation CreateUser($input: CreateUserInput!) { createUser(input: $input) { id name } }`,
      {
        input: {
          name: "John Doe",
          email: "john@example.com",
          metadata: {
            age: 30,
            preferences: ["react", "typescript"],
          },
        },
      },
    );

    expect(createUserMutation).toHaveBeenRequestedWithJsonBody({
      query: `mutation CreateUser($input: CreateUserInput!) { createUser(input: $input) { id name } }`,
      variables: {
        input: {
          name: "John Doe",
          email: "john@example.com",
          metadata: {
            age: 30,
            preferences: ["react", "typescript"],
          },
        },
      },
    });
  });

  it("should fail when JSON body doesn't match", async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: "123" },
    );

    expect(() => {
      expect(getUserQuery).toHaveBeenRequestedWithJsonBody({
        query: `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
        variables: { userId: "wrong-id" },
      });
    }).toThrow();
  });

  it("should work with not matcher", async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: "123" },
    );

    expect(getUserQuery).not.toHaveBeenRequestedWithJsonBody({
      query: `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      variables: { userId: "wrong-id" },
    });
  });

  it("should match any call when multiple calls made", async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: "123" },
    );
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: "456" },
    );

    expect(getUserQuery).toHaveBeenRequestedWithJsonBody({
      query: `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      variables: { userId: "123" },
    });
    expect(getUserQuery).toHaveBeenRequestedWithJsonBody({
      query: `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      variables: { userId: "456" },
    });
  });
});
