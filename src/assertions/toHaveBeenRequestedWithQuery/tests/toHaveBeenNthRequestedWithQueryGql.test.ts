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

async function executeGraphQL(
  query: string,
  variables?: unknown,
  queryParams?: string,
) {
  const url = `http://localhost/graphql${queryParams || ""}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  return response.json();
}

describe("toHaveBeenNthRequestedWithQuery - GraphQL", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  it("should match specific call position", async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: "123" },
      "?version=v1",
    );
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: "456" },
      "?version=v2",
    );

    expect(getUserQuery).toHaveBeenNthRequestedWithQuery(1, "?version=v1");
    expect(getUserQuery).toHaveBeenNthRequestedWithQuery(2, "?version=v2");
  });

  it("should match nth request with complex query parameters", async () => {
    await executeGraphQL(
      `mutation CreateUser($input: CreateUserInput!) { createUser(input: $input) { id name } }`,
      {
        input: {
          name: "Jane Doe",
          email: "jane@example.com",
        },
      },
      "?debug=true&env=staging",
    );
    await executeGraphQL(
      `mutation CreateUser($input: CreateUserInput!) { createUser(input: $input) { id name } }`,
      {
        input: {
          name: "John Smith",
          email: "john@example.com",
        },
      },
      "?debug=false&env=production",
    );

    expect(createUserMutation).toHaveBeenNthRequestedWithQuery(
      1,
      "?debug=true&env=staging",
    );
    expect(createUserMutation).toHaveBeenNthRequestedWithQuery(
      2,
      "?debug=false&env=production",
    );
  });

  it("should match with empty query parameters at specific position", async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: "123" },
    );
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: "456" },
      "?version=v1",
    );

    expect(getUserQuery).toHaveBeenNthRequestedWithQuery(1, "");
    expect(getUserQuery).toHaveBeenNthRequestedWithQuery(2, "?version=v1");
  });

  it("should fail when nth call doesn't match", async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: "123" },
      "?version=v1",
    );
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: "456" },
      "?version=v2",
    );

    expect(() => {
      expect(getUserQuery).toHaveBeenNthRequestedWithQuery(2, "?version=wrong");
    }).toThrow();
  });

  it("should fail when call index is out of bounds", async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: "123" },
      "?version=v1",
    );

    expect(() => {
      expect(getUserQuery).toHaveBeenNthRequestedWithQuery(2, "?version=v1");
    }).toThrow();
  });

  it("should work with not matcher", async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: "123" },
      "?version=v1",
    );
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: "456" },
      "?version=v2",
    );

    expect(getUserQuery).not.toHaveBeenNthRequestedWithQuery(
      1,
      "?version=wrong",
    );
    expect(getUserQuery).not.toHaveBeenNthRequestedWithQuery(
      2,
      "?version=wrong",
    );
  });
});
