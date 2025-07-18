import { graphql, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import "../../../vitest";

const getUserQuery = graphql.query("GetUser", ({ variables }) => {
  return HttpResponse.json({
    data: { user: { id: variables.userId, name: "John Doe" } },
  });
});

const server = setupServer(getUserQuery);

async function executeGraphQL(
  query: string,
  variables?: unknown,
  queryParams?: string,
) {
  const url = queryParams
    ? `http://localhost/graphql${queryParams}`
    : "http://localhost/graphql";
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  return response.json();
}

describe("toHaveBeenRequestedWithQueryString - GraphQL", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  it("should match when called with expected query parameters", async () => {
    const queryString = `query GetUser($userId: ID!) { user(id: $userId) { id name } }`;
    await executeGraphQL(
      queryString,
      { userId: "123" },
      "?version=v1&format=json",
    );

    expect(getUserQuery).toHaveBeenRequestedWithQueryString(
      "?version=v1&format=json",
    );
  });

  it("should match with empty query string", async () => {
    const queryString = `query GetUser($userId: ID!) { user(id: $userId) { id name } }`;
    await executeGraphQL(queryString, { userId: "123" });

    expect(getUserQuery).toHaveBeenRequestedWithQueryString("");
  });

  it("should match with API versioning in query params", async () => {
    const queryString = `query GetUser($userId: ID!) { user(id: $userId) { id name } }`;
    await executeGraphQL(
      queryString,
      { userId: "123" },
      "?api_version=2023-01-01",
    );

    expect(getUserQuery).toHaveBeenRequestedWithQueryString(
      "?api_version=2023-01-01",
    );
  });

  it("should fail when query string doesn't match", async () => {
    const queryString = `query GetUser($userId: ID!) { user(id: $userId) { id name } }`;
    await executeGraphQL(queryString, { userId: "123" }, "?version=v1");

    expect(() => {
      expect(getUserQuery).toHaveBeenRequestedWithQueryString("?version=v2");
    }).toThrow();
  });

  it("should work with not matcher", async () => {
    const queryString = `query GetUser($userId: ID!) { user(id: $userId) { id name } }`;
    await executeGraphQL(queryString, { userId: "123" }, "?version=v1");

    expect(getUserQuery).not.toHaveBeenRequestedWithQueryString("?version=v2");
  });

  it("should match any call when multiple calls made", async () => {
    const queryString = `query GetUser($userId: ID!) { user(id: $userId) { id name } }`;

    await executeGraphQL(queryString, { userId: "123" }, "?version=v1");
    await executeGraphQL(
      queryString,
      { userId: "456" },
      "?version=v2&format=compact",
    );

    expect(getUserQuery).toHaveBeenRequestedWithQueryString("?version=v1");
    expect(getUserQuery).toHaveBeenRequestedWithQueryString(
      "?version=v2&format=compact",
    );
  });
});
