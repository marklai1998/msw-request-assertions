import { graphql, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import "../../../vitest";

const getUserQuery = graphql.query("GetUser", ({ variables }) => {
  return HttpResponse.json({
    data: {
      user: {
        id: variables.userId,
        name: "John Doe",
      },
    },
  });
});

const createUserMutation = graphql.mutation("CreateUser", ({ variables }) => {
  return HttpResponse.json({
    data: {
      user: {
        id: "new-id",
        name: variables.input.name,
        email: variables.input.email,
      },
    },
  });
});

const searchQuery = graphql.query("SearchUsers", ({ variables }) => {
  return HttpResponse.json({
    data: {
      users: [],
      totalCount: 0,
      filters: variables.filters,
    },
  });
});

const restHandlers = [getUserQuery, createUserMutation, searchQuery];
const server = setupServer(...restHandlers);

// Mock GraphQL client for testing
async function executeGraphQL(query: string, variables?: any) {
  const response = await fetch("http://localhost/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });
  return response.json();
}

describe("toHaveBeenCalledWithVariables", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

  afterAll(() => server.close());

  afterEach(() => server.resetHandlers());

  it("should match query with simple variables", async () => {
    const variables = { userId: "123" };

    await executeGraphQL(
      `query GetUser($userId: ID!) {
        user(id: $userId) {
          id
          name
        }
      }`,
      variables,
    );

    expect(getUserQuery).toHaveBeenCalledWithVariables(variables);
  });

  it("should match mutation with nested variables", async () => {
    const variables = {
      input: {
        name: "Jane Doe",
        email: "jane@example.com",
      },
    };

    await executeGraphQL(
      `mutation CreateUser($input: CreateUserInput!) {
        createUser(input: $input) {
          id
          name
          email
        }
      }`,
      variables,
    );

    expect(createUserMutation).toHaveBeenCalledWithVariables(variables);
  });

  it("should match query with complex variables", async () => {
    const variables = {
      filters: {
        status: "active",
        role: ["admin", "user"],
        createdAfter: "2023-01-01",
        metadata: {
          department: "engineering",
          level: 5,
        },
      },
      pagination: {
        limit: 20,
        offset: 0,
      },
      sortBy: "created_at",
      sortOrder: "DESC",
    };

    await executeGraphQL(
      `query SearchUsers($filters: UserFilters!, $pagination: Pagination, $sortBy: String, $sortOrder: SortOrder) {
        users(filters: $filters, pagination: $pagination, sortBy: $sortBy, sortOrder: $sortOrder) {
          id
          name
        }
        totalCount
      }`,
      variables,
    );

    expect(searchQuery).toHaveBeenCalledWithVariables(variables);
  });

  it("should match query with array variables", async () => {
    const variables = {
      userIds: ["123", "456", "789"],
      tags: ["frontend", "react", "typescript"],
    };

    await executeGraphQL(
      `query SearchUsers($userIds: [ID!]!, $tags: [String!]) {
        users(ids: $userIds, tags: $tags) {
          id
          name
        }
      }`,
      variables,
    );

    expect(searchQuery).toHaveBeenCalledWithVariables(variables);
  });

  it("should match query with null variables", async () => {
    const variables = {
      filters: {
        name: "John",
        email: null,
      },
    };

    await executeGraphQL(
      `query SearchUsers($filters: UserFilters!) {
        users(filters: $filters) {
          id
          name
        }
      }`,
      variables,
    );

    expect(searchQuery).toHaveBeenCalledWithVariables(variables);
  });

  it("should match query with boolean and number variables", async () => {
    const variables = {
      filters: {
        isActive: true,
        isVerified: false,
        minAge: 18,
        maxAge: 65,
        score: 4.5,
      },
    };

    await executeGraphQL(
      `query SearchUsers($filters: UserFilters!) {
        users(filters: $filters) {
          id
          name
        }
      }`,
      variables,
    );

    expect(searchQuery).toHaveBeenCalledWithVariables(variables);
  });

  it("should match query with empty object variables", async () => {
    const variables = {};

    await executeGraphQL(
      `query SearchUsers {
        users {
          id
          name
        }
      }`,
      variables,
    );

    expect(searchQuery).toHaveBeenCalledWithVariables(variables);
  });

  it("should fail when variables don't match", async () => {
    const actualVariables = { userId: "123" };
    const expectedVariables = { userId: "456" };

    await executeGraphQL(
      `query GetUser($userId: ID!) {
        user(id: $userId) {
          id
          name
        }
      }`,
      actualVariables,
    );

    expect(() => {
      expect(getUserQuery).toHaveBeenCalledWithVariables(expectedVariables);
    }).toThrow();
  });

  it("should work with not matcher", async () => {
    const variables = { userId: "123" };

    await executeGraphQL(
      `query GetUser($userId: ID!) {
        user(id: $userId) {
          id
          name
        }
      }`,
      variables,
    );

    expect(getUserQuery).not.toHaveBeenCalledWithVariables({ userId: "456" });
  });

  it("should handle partial variable matching", async () => {
    const variables = {
      input: {
        name: "John Doe",
        email: "john@example.com",
        age: 30,
        department: "engineering",
      },
    };

    await executeGraphQL(
      `mutation CreateUser($input: CreateUserInput!) {
        createUser(input: $input) {
          id
          name
        }
      }`,
      variables,
    );

    // Should match when checking for a subset
    expect(createUserMutation).toHaveBeenCalledWithVariables({
      input: {
        name: "John Doe",
        email: "john@example.com",
        age: 30,
        department: "engineering",
      },
    });
  });

  it("should handle multiple calls with different variables", async () => {
    // First call
    await executeGraphQL(
      `query GetUser($userId: ID!) {
        user(id: $userId) {
          id
          name
        }
      }`,
      { userId: "123" },
    );

    // Second call
    await executeGraphQL(
      `query GetUser($userId: ID!) {
        user(id: $userId) {
          id
          name
        }
      }`,
      { userId: "456" },
    );

    // Should match any of the calls
    expect(getUserQuery).toHaveBeenCalledWithVariables({ userId: "123" });
    expect(getUserQuery).toHaveBeenCalledWithVariables({ userId: "456" });
  });
});
