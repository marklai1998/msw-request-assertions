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

describe("toHaveBeenNthRequestedWithGqlVariables", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  it("should match specific request position", async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: "123" },
    );
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: "456" },
    );

    expect(getUserQuery).toHaveBeenNthRequestedWithGqlVariables(1, {
      userId: "123",
    });
    expect(getUserQuery).toHaveBeenNthRequestedWithGqlVariables(2, {
      userId: "456",
    });
  });

  it("should fail when request position variables don't match", async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: "123" },
    );
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: "456" },
    );

    expect(() => {
      expect(getUserQuery).toHaveBeenNthRequestedWithGqlVariables(2, {
        userId: "999",
      });
    }).toThrow();
  });

  it("should fail when request position is out of bounds", async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: "123" },
    );

    expect(() => {
      expect(getUserQuery).toHaveBeenNthRequestedWithGqlVariables(2, {
        userId: "123",
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

    expect(getUserQuery).not.toHaveBeenNthRequestedWithGqlVariables(1, {
      userId: "999",
    });
    expect(getUserQuery).not.toHaveBeenNthRequestedWithGqlVariables(2, {
      userId: "999",
    });
  });

  it("should handle complex variables at specific positions", async () => {
    await executeGraphQL(
      `mutation CreateUser($input: CreateUserInput!) { createUser(input: $input) { id name } }`,
      {
        input: {
          name: "Jane Doe",
          email: "jane@example.com",
          metadata: { department: "engineering", level: 5 },
          tags: ["admin", "user"],
          isActive: true,
          score: 4.5,
        },
      },
    );
    await executeGraphQL(
      `mutation CreateUser($input: CreateUserInput!) { createUser(input: $input) { id name } }`,
      {
        input: {
          name: "John Smith",
          email: "john@example.com",
        },
      },
    );

    expect(createUserMutation).toHaveBeenNthRequestedWithGqlVariables(1, {
      input: {
        name: "Jane Doe",
        email: "jane@example.com",
        metadata: { department: "engineering", level: 5 },
        tags: ["admin", "user"],
        isActive: true,
        score: 4.5,
      },
    });
    expect(createUserMutation).toHaveBeenNthRequestedWithGqlVariables(2, {
      input: {
        name: "John Smith",
        email: "john@example.com",
      },
    });
  });
});
