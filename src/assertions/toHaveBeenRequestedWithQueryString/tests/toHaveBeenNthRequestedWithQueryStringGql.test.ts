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

describe("toHaveBeenNthRequestedWithQueryString - GraphQL", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  it("should match specific call position with query parameters", async () => {
    const queryString = `query GetUser($userId: ID!) { user(id: $userId) { id name } }`;

    await executeGraphQL(queryString, { userId: "123" }, "?version=v1");
    await executeGraphQL(
      queryString,
      { userId: "456" },
      "?version=v2&format=json",
    );

    expect(getUserQuery).toHaveBeenNthRequestedWithQueryString(
      1,
      "?version=v1",
    );
    expect(getUserQuery).toHaveBeenNthRequestedWithQueryString(
      2,
      "?version=v2&format=json",
    );
  });

  it("should fail when nth call doesn't match", async () => {
    const queryString = `query GetUser($userId: ID!) { user(id: $userId) { id name } }`;

    await executeGraphQL(queryString, { userId: "123" }, "?version=v1");
    await executeGraphQL(queryString, { userId: "456" }, "?version=v2");

    expect(() => {
      expect(getUserQuery).toHaveBeenNthRequestedWithQueryString(
        2,
        "?version=v3",
      );
    }).toThrow();
  });

  it("should fail when call index is out of bounds", async () => {
    const queryString = `query GetUser($userId: ID!) { user(id: $userId) { id name } }`;
    await executeGraphQL(queryString, { userId: "123" }, "?version=v1");

    expect(() => {
      expect(getUserQuery).toHaveBeenNthRequestedWithQueryString(
        2,
        "?version=v1",
      );
    }).toThrow();
  });

  it("should work with not matcher", async () => {
    const queryString = `query GetUser($userId: ID!) { user(id: $userId) { id name } }`;

    await executeGraphQL(queryString, { userId: "123" }, "?version=v1");
    await executeGraphQL(queryString, { userId: "456" }, "?version=v2");

    expect(getUserQuery).not.toHaveBeenNthRequestedWithQueryString(
      1,
      "?version=v2",
    );
    expect(getUserQuery).not.toHaveBeenNthRequestedWithQueryString(
      2,
      "?version=v1",
    );
  });

  it("should handle empty query strings at specific positions", async () => {
    const queryString = `query GetUser($userId: ID!) { user(id: $userId) { id name } }`;

    await executeGraphQL(queryString, { userId: "123" });
    await executeGraphQL(queryString, { userId: "456" }, "?version=v1");

    expect(getUserQuery).toHaveBeenNthRequestedWithQueryString(1, "");
    expect(getUserQuery).toHaveBeenNthRequestedWithQueryString(
      2,
      "?version=v1",
    );
  });

  it("should match complex query parameters at specific positions", async () => {
    const queryString = `query GetUser($userId: ID!) { user(id: $userId) { id name } }`;

    await executeGraphQL(
      queryString,
      { userId: "123" },
      "?api_version=2023-01-01&include_deprecated=false",
    );
    await executeGraphQL(
      queryString,
      { userId: "456" },
      "?cache=false&debug=true&trace_id=abc123",
    );

    expect(getUserQuery).toHaveBeenNthRequestedWithQueryString(
      1,
      "?api_version=2023-01-01&include_deprecated=false",
    );
    expect(getUserQuery).toHaveBeenNthRequestedWithQueryString(
      2,
      "?cache=false&debug=true&trace_id=abc123",
    );
  });
});
