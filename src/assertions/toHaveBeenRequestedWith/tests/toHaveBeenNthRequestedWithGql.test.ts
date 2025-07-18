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

describe("toHaveBeenNthRequestedWith - GraphQL", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  it("should match specific call position", async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: "123" },
    );
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: "456" },
    );

    expect(getUserQuery).toHaveBeenNthRequestedWith(1, {
      variables: { userId: "123" },
    });
    expect(getUserQuery).toHaveBeenNthRequestedWith(2, {
      variables: { userId: "456" },
    });
  });

  it("should match nth request with complex variables", async () => {
    const firstVariables = {
      input: {
        name: "Jane Doe",
        email: "jane@example.com",
        metadata: { department: "engineering", level: 5 },
        tags: ["admin", "user"],
        isActive: true,
        score: 4.5,
      },
    };

    const secondVariables = {
      input: {
        name: "John Smith",
        email: "john@example.com",
      },
    };

    await executeGraphQL(
      `mutation CreateUser($input: CreateUserInput!) { createUser(input: $input) { id name } }`,
      firstVariables,
    );
    await executeGraphQL(
      `mutation CreateUser($input: CreateUserInput!) { createUser(input: $input) { id name } }`,
      secondVariables,
    );

    expect(createUserMutation).toHaveBeenNthRequestedWith(1, {
      gqlVariables: firstVariables,
    });
    expect(createUserMutation).toHaveBeenNthRequestedWith(2, {
      gqlVariables: secondVariables,
    });
  });

  it("should fail when nth call doesn't match", async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: "123" },
    );
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: "456" },
    );

    expect(() => {
      expect(getUserQuery).toHaveBeenNthRequestedWith(2, {
        gqlVariables: { userId: "999" },
      });
    }).toThrow();
  });

  it("should fail when call index is out of bounds", async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: "123" },
    );

    expect(() => {
      expect(getUserQuery).toHaveBeenNthRequestedWith(2, {
        gqlVariables: { userId: "123" },
      });
    }).toThrow();
  });

  it("should work with not matcher", async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: "123" },
    );
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: "456" },
    );

    expect(getUserQuery).not.toHaveBeenNthRequestedWith(1, {
      gqlVariables: { userId: "999" },
    });
    expect(getUserQuery).not.toHaveBeenNthRequestedWith(2, {
      gqlVariables: { userId: "999" },
    });
  });

  it("should match nth request with expected GraphQL query", async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: "123" },
    );
    await executeGraphQL(
      `mutation CreateUser($input: CreateUserInput!) { createUser(input: $input) { id name } }`,
      { input: { name: "John Doe", email: "john@example.com" } },
    );

    expect(getUserQuery).toHaveBeenNthRequestedWith(1, {
      gqlQuery: `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
    });
    expect(createUserMutation).toHaveBeenNthRequestedWith(1, {
      gqlQuery: `mutation CreateUser($input: CreateUserInput!) { createUser(input: $input) { id name } }`,
    });
  });

  it("should match nth request with both gqlVariables and gqlQuery", async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: "123" },
    );
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: "456" },
    );

    expect(getUserQuery).toHaveBeenNthRequestedWith(1, {
      gqlVariables: { userId: "123" },
      gqlQuery: `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
    });
    expect(getUserQuery).toHaveBeenNthRequestedWith(2, {
      gqlVariables: { userId: "456" },
      gqlQuery: `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
    });
  });
});
