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

async function executeGraphQL(query: string, variables?: any) {
  const response = await fetch("http://localhost/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  return response.json();
}

describe("toHaveBeenRequested - GraphQL", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  it("should pass when GraphQL handler has been called", async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: "123" },
    );

    expect(getUserQuery).toHaveBeenRequested();
  });

  it("should fail when GraphQL handler has not been called", async () => {
    expect(() => {
      expect(getUserQuery).toHaveBeenRequested();
    }).toThrow();
  });

  it("should work with not matcher", async () => {
    await executeGraphQL(
      `mutation CreateUser($input: CreateUserInput!) { createUser(input: $input) { id name } }`,
      { input: { name: "Jane Doe" } },
    );

    expect(getUserQuery).not.toHaveBeenRequested();
  });

  it("should handle complex variables", async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!, $filters: UserFilters) { user(id: $userId, filters: $filters) { id } }`,
      {
        userId: "123",
        filters: {
          status: "active",
          metadata: { department: "engineering" },
          tags: ["admin", "user"],
          isVerified: true,
          score: 4.5,
        },
      },
    );

    expect(getUserQuery).toHaveBeenRequested();
  });
});
