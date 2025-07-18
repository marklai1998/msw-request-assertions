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

describe("toHaveBeenRequestedWithBody - GraphQL", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  it("should match when called with expected body", async () => {
    const query = `query GetUser($userId: ID!) { user(id: $userId) { id name } }`;
    const variables = { userId: "123" };

    await executeGraphQL(query, variables);

    const expectedBody = JSON.stringify({ query, variables });
    expect(getUserQuery).toHaveBeenRequestedWithBody(expectedBody);
  });

  it("should match with complex GraphQL body", async () => {
    const query = `mutation CreateUser($input: CreateUserInput!) { createUser(input: $input) { id name } }`;
    const variables = {
      input: {
        name: "John Doe",
        email: "john@example.com",
        metadata: { department: "engineering", level: 5 },
        tags: ["admin", "user"],
        isActive: true,
        score: 4.5,
      },
    };

    await executeGraphQL(query, variables);

    const expectedBody = JSON.stringify({ query, variables });
    expect(createUserMutation).toHaveBeenRequestedWithBody(expectedBody);
  });

  it("should fail when body doesn't match", async () => {
    const query = `query GetUser($userId: ID!) { user(id: $userId) { id name } }`;
    const variables = { userId: "123" };

    await executeGraphQL(query, variables);

    const wrongBody = JSON.stringify({
      query,
      variables: { userId: "456" },
    });

    expect(() => {
      expect(getUserQuery).toHaveBeenRequestedWithBody(wrongBody);
    }).toThrow();
  });

  it("should work with not matcher", async () => {
    const query = `query GetUser($userId: ID!) { user(id: $userId) { id name } }`;
    const variables = { userId: "123" };

    await executeGraphQL(query, variables);

    const wrongBody = JSON.stringify({
      query,
      variables: { userId: "456" },
    });

    expect(getUserQuery).not.toHaveBeenRequestedWithBody(wrongBody);
  });

  it("should match any call when multiple calls made", async () => {
    const query = `query GetUser($userId: ID!) { user(id: $userId) { id name } }`;

    await executeGraphQL(query, { userId: "123" });
    await executeGraphQL(query, { userId: "456" });

    const expectedBody1 = JSON.stringify({
      query,
      variables: { userId: "123" },
    });
    const expectedBody2 = JSON.stringify({
      query,
      variables: { userId: "456" },
    });

    expect(getUserQuery).toHaveBeenRequestedWithBody(expectedBody1);
    expect(getUserQuery).toHaveBeenRequestedWithBody(expectedBody2);
  });
});
