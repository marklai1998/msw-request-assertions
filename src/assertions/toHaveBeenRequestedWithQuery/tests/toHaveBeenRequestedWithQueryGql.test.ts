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

describe("toHaveBeenRequestedWithQuery - GraphQL", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  it("should match when called with expected query parameters", async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: "123" },
      "?version=v1&format=json",
    );

    expect(getUserQuery).toHaveBeenRequestedWithQuery(
      "?version=v1&format=json",
    );
  });

  it("should match with complex query parameters", async () => {
    await executeGraphQL(
      `mutation CreateUser($input: CreateUserInput!) { createUser(input: $input) { id name } }`,
      {
        input: {
          name: "John Doe",
          email: "john@example.com",
        },
      },
      "?debug=true&timeout=5000&format=json",
    );

    expect(createUserMutation).toHaveBeenRequestedWithQuery(
      "?debug=true&timeout=5000&format=json",
    );
  });

  it("should match with empty query parameters", async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: "123" },
    );

    expect(getUserQuery).toHaveBeenRequestedWithQuery("");
  });

  it("should fail when query parameters don't match", async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: "123" },
      "?version=v1",
    );

    expect(() => {
      expect(getUserQuery).toHaveBeenRequestedWithQuery("?version=v2");
    }).toThrow();
  });

  it("should work with not matcher", async () => {
    await executeGraphQL(
      `query GetUser($userId: ID!) { user(id: $userId) { id name } }`,
      { userId: "123" },
      "?version=v1",
    );

    expect(getUserQuery).not.toHaveBeenRequestedWithQuery("?version=v2");
  });

  it("should match any call when multiple calls made", async () => {
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

    expect(getUserQuery).toHaveBeenRequestedWithQuery("?version=v1");
    expect(getUserQuery).toHaveBeenRequestedWithQuery("?version=v2");
  });
});
