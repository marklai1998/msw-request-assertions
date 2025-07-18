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

describe("toHaveBeenCalledNthWithVariables", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

  afterAll(() => server.close());

  afterEach(() => server.resetHandlers());

  it("should match first call with simple variables", async () => {
    const firstVariables = { userId: "123" };
    const secondVariables = { userId: "456" };

    // First call
    await executeGraphQL(
      `query GetUser($userId: ID!) {
        user(id: $userId) {
          id
          name
        }
      }`,
      firstVariables,
    );

    // Second call
    await executeGraphQL(
      `query GetUser($userId: ID!) {
        user(id: $userId) {
          id
          name
        }
      }`,
      secondVariables,
    );

    expect(getUserQuery).toHaveBeenCalledNthWithVariables(1, firstVariables);
  });

  it("should match second call with simple variables", async () => {
    const firstVariables = { userId: "123" };
    const secondVariables = { userId: "456" };

    // First call
    await executeGraphQL(
      `query GetUser($userId: ID!) {
        user(id: $userId) {
          id
          name
        }
      }`,
      firstVariables,
    );

    // Second call
    await executeGraphQL(
      `query GetUser($userId: ID!) {
        user(id: $userId) {
          id
          name
        }
      }`,
      secondVariables,
    );

    expect(getUserQuery).toHaveBeenCalledNthWithVariables(2, secondVariables);
  });

  it("should match third call with complex variables", async () => {
    const firstVariables = { userId: "123" };
    const secondVariables = { userId: "456" };
    const thirdVariables = {
      filters: {
        status: "active",
        role: ["admin", "user"],
        metadata: {
          department: "engineering",
          level: 5,
        },
      },
      pagination: {
        limit: 20,
        offset: 0,
      },
    };

    // First call
    await executeGraphQL(
      `query GetUser($userId: ID!) {
        user(id: $userId) {
          id
          name
        }
      }`,
      firstVariables,
    );

    // Second call
    await executeGraphQL(
      `query GetUser($userId: ID!) {
        user(id: $userId) {
          id
          name
        }
      }`,
      secondVariables,
    );

    // Third call with complex variables
    await executeGraphQL(
      `query SearchUsers($filters: UserFilters!, $pagination: Pagination) {
        users(filters: $filters, pagination: $pagination) {
          id
          name
        }
      }`,
      thirdVariables,
    );

    expect(searchQuery).toHaveBeenCalledNthWithVariables(1, thirdVariables);
  });

  it("should match mutation call with nested variables", async () => {
    const firstVariables = {
      input: {
        name: "Jane Doe",
        email: "jane@example.com",
      },
    };

    const secondVariables = {
      input: {
        name: "John Smith",
        email: "john@example.com",
      },
    };

    // First call
    await executeGraphQL(
      `mutation CreateUser($input: CreateUserInput!) {
        createUser(input: $input) {
          id
          name
          email
        }
      }`,
      firstVariables,
    );

    // Second call
    await executeGraphQL(
      `mutation CreateUser($input: CreateUserInput!) {
        createUser(input: $input) {
          id
          name
          email
        }
      }`,
      secondVariables,
    );

    expect(createUserMutation).toHaveBeenCalledNthWithVariables(
      1,
      firstVariables,
    );
    expect(createUserMutation).toHaveBeenCalledNthWithVariables(
      2,
      secondVariables,
    );
  });

  it("should handle array variables in specific calls", async () => {
    const firstVariables = {
      userIds: ["123", "456"],
      tags: ["frontend", "react"],
    };

    const secondVariables = {
      userIds: ["789", "101"],
      tags: ["backend", "node"],
    };

    // First call
    await executeGraphQL(
      `query SearchUsers($userIds: [ID!]!, $tags: [String!]) {
        users(ids: $userIds, tags: $tags) {
          id
          name
        }
      }`,
      firstVariables,
    );

    // Second call
    await executeGraphQL(
      `query SearchUsers($userIds: [ID!]!, $tags: [String!]) {
        users(ids: $userIds, tags: $tags) {
          id
          name
        }
      }`,
      secondVariables,
    );

    expect(searchQuery).toHaveBeenCalledNthWithVariables(1, firstVariables);
    expect(searchQuery).toHaveBeenCalledNthWithVariables(2, secondVariables);
  });

  it("should handle null variables in specific calls", async () => {
    const firstVariables = {
      filters: {
        name: "John",
        email: null,
      },
    };

    const secondVariables = {
      filters: {
        name: null,
        email: "john@example.com",
      },
    };

    // First call
    await executeGraphQL(
      `query SearchUsers($filters: UserFilters!) {
        users(filters: $filters) {
          id
          name
        }
      }`,
      firstVariables,
    );

    // Second call
    await executeGraphQL(
      `query SearchUsers($filters: UserFilters!) {
        users(filters: $filters) {
          id
          name
        }
      }`,
      secondVariables,
    );

    expect(searchQuery).toHaveBeenCalledNthWithVariables(1, firstVariables);
    expect(searchQuery).toHaveBeenCalledNthWithVariables(2, secondVariables);
  });

  it("should handle boolean and number variables in specific calls", async () => {
    const firstVariables = {
      filters: {
        isActive: true,
        minAge: 18,
        score: 4.5,
      },
    };

    const secondVariables = {
      filters: {
        isActive: false,
        minAge: 25,
        score: 3.0,
      },
    };

    // First call
    await executeGraphQL(
      `query SearchUsers($filters: UserFilters!) {
        users(filters: $filters) {
          id
          name
        }
      }`,
      firstVariables,
    );

    // Second call
    await executeGraphQL(
      `query SearchUsers($filters: UserFilters!) {
        users(filters: $filters) {
          id
          name
        }
      }`,
      secondVariables,
    );

    expect(searchQuery).toHaveBeenCalledNthWithVariables(1, firstVariables);
    expect(searchQuery).toHaveBeenCalledNthWithVariables(2, secondVariables);
  });

  it("should fail when nth call variables don't match", async () => {
    const firstVariables = { userId: "123" };
    const secondVariables = { userId: "456" };
    const expectedVariables = { userId: "999" };

    // First call
    await executeGraphQL(
      `query GetUser($userId: ID!) {
        user(id: $userId) {
          id
          name
        }
      }`,
      firstVariables,
    );

    // Second call
    await executeGraphQL(
      `query GetUser($userId: ID!) {
        user(id: $userId) {
          id
          name
        }
      }`,
      secondVariables,
    );

    expect(() => {
      expect(getUserQuery).toHaveBeenCalledNthWithVariables(
        2,
        expectedVariables,
      );
    }).toThrow();
  });

  it("should fail when call number is out of bounds", async () => {
    const variables = { userId: "123" };

    // Only one call
    await executeGraphQL(
      `query GetUser($userId: ID!) {
        user(id: $userId) {
          id
          name
        }
      }`,
      variables,
    );

    expect(() => {
      expect(getUserQuery).toHaveBeenCalledNthWithVariables(2, variables);
    }).toThrow();
  });

  it("should work with not matcher", async () => {
    const firstVariables = { userId: "123" };
    const secondVariables = { userId: "456" };

    // First call
    await executeGraphQL(
      `query GetUser($userId: ID!) {
        user(id: $userId) {
          id
          name
        }
      }`,
      firstVariables,
    );

    // Second call
    await executeGraphQL(
      `query GetUser($userId: ID!) {
        user(id: $userId) {
          id
          name
        }
      }`,
      secondVariables,
    );

    expect(getUserQuery).not.toHaveBeenCalledNthWithVariables(1, {
      userId: "999",
    });
    expect(getUserQuery).not.toHaveBeenCalledNthWithVariables(2, {
      userId: "999",
    });
  });

  it("should handle empty object variables", async () => {
    const firstVariables = {};
    const secondVariables = { userId: "123" };

    // First call with empty variables
    await executeGraphQL(
      `query SearchUsers {
        users {
          id
          name
        }
      }`,
      firstVariables,
    );

    // Second call with variables
    await executeGraphQL(
      `query GetUser($userId: ID!) {
        user(id: $userId) {
          id
          name
        }
      }`,
      secondVariables,
    );

    expect(searchQuery).toHaveBeenCalledNthWithVariables(1, firstVariables);
    expect(getUserQuery).toHaveBeenCalledNthWithVariables(1, secondVariables);
  });
});
