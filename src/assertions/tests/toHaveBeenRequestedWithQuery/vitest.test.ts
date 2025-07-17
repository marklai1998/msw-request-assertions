import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import wretch from "wretch";
import QueryStringAddon from "wretch/addons/queryString";
import "../../../vitest/index.js";

const w = wretch().addon(QueryStringAddon);

const searchHandler = http.get("http://127.0.0.1/search", () => {
  return HttpResponse.json({
    results: [],
  });
});

const usersHandler = http.get("http://127.0.0.1/users", () => {
  return HttpResponse.json([{ id: 1, name: "John Doe" }]);
});

const restHandlers = [searchHandler, usersHandler];
const server = setupServer(...restHandlers);

describe("toHaveBeenRequestedWithQuery", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

  afterAll(() => server.close());

  afterEach(() => server.resetHandlers());

  it("should match request with single query parameter", async () => {
    await w.url("http://127.0.0.1/search").query({ q: "test" }).get().json();

    expect(searchHandler).toHaveBeenRequestedWithQuery("?q=test");
  });

  it("should match request with multiple query parameters", async () => {
    await w
      .url("http://127.0.0.1/search")
      .query({ q: "test", page: 1, limit: 10 })
      .get()
      .json();

    expect(searchHandler).toHaveBeenRequestedWithQuery(
      "?q=test&page=1&limit=10",
    );
  });

  it("should match request with encoded query parameters", async () => {
    await w
      .url("http://127.0.0.1/search")
      .query({ q: "hello world", category: "tech" })
      .get()
      .json();

    expect(searchHandler).toHaveBeenRequestedWithQuery(
      "?q=hello+world&category=tech",
    );
  });

  it("should match request with empty query string", async () => {
    await wretch("http://127.0.0.1/users").get().json();

    expect(usersHandler).toHaveBeenRequestedWithQuery("");
  });

  it("should match request with query parameters in different order", async () => {
    await wretch("http://127.0.0.1/search?page=1&q=test&limit=10").get().json();

    // Note: This tests the exact string match, so order matters
    expect(searchHandler).toHaveBeenRequestedWithQuery(
      "?page=1&q=test&limit=10",
    );
  });

  it("should match request with special characters in query", async () => {
    await w
      .url("http://127.0.0.1/search")
      .query({ filter: "price>100", sort: "desc" })
      .get()
      .json();

    expect(searchHandler).toHaveBeenRequestedWithQuery(
      "?filter=price%3E100&sort=desc",
    );
  });

  it("should fail when query doesn't match", async () => {
    await wretch("http://127.0.0.1/search?q=test").get().json();

    expect(() => {
      expect(searchHandler).toHaveBeenRequestedWithQuery("?q=different");
    }).toThrow();
  });

  it("should work with not matcher", async () => {
    await wretch("http://127.0.0.1/search?q=test").get().json();

    expect(searchHandler).not.toHaveBeenRequestedWithQuery("?q=different");
  });

  it("should handle requests with query parameters containing arrays", async () => {
    await w
      .url("http://127.0.0.1/search")
      .query({ tags: ["javascript", "typescript", "react"] })
      .get()
      .json();

    expect(searchHandler).toHaveBeenRequestedWithQuery(
      "?tags=javascript&tags=typescript&tags=react",
    );
  });

  it("should handle complex query parameters", async () => {
    const queryParams =
      "?search=test&filters[category]=tech&filters[price][min]=100&filters[price][max]=500&sort=date&order=desc";

    await wretch(`http://127.0.0.1/search${queryParams}`).get().json();

    expect(searchHandler).toHaveBeenRequestedWithQuery(queryParams);
  });
});
