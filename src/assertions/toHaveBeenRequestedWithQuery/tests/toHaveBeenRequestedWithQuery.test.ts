import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import wretch from "wretch";
import QueryStringAddon from "wretch/addons/queryString";
import "../../../vitest";

const w = wretch().addon(QueryStringAddon);

const searchHandler = http.get("http://127.0.0.1/search", () => {
  return HttpResponse.json({ results: [] });
});

const server = setupServer(searchHandler);

describe("toHaveBeenRequestedWithQuery", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  it("should match request with single query parameter", async () => {
    await w.url("http://127.0.0.1/search").query({ q: "test" }).get().json();

    expect(searchHandler).toHaveBeenRequestedWithQuery("?q=test");
  });

  it("should match request with multiple and encoded query parameters", async () => {
    await w
      .url("http://127.0.0.1/search")
      .query({ q: "hello world", page: 1, limit: 10 })
      .get()
      .json();

    expect(searchHandler).toHaveBeenRequestedWithQuery(
      "?q=hello+world&page=1&limit=10",
    );
  });

  it("should fail when query parameters don't match", async () => {
    await w.url("http://127.0.0.1/search").query({ q: "test" }).get().json();

    expect(() => {
      expect(searchHandler).toHaveBeenRequestedWithQuery("?q=different");
    }).toThrow();
  });

  it("should work with not matcher", async () => {
    await w.url("http://127.0.0.1/search").query({ q: "test" }).get().json();

    expect(searchHandler).not.toHaveBeenRequestedWithQuery("?q=different");
  });

  it("should handle multiple calls with different queries", async () => {
    await w.url("http://127.0.0.1/search").query({ q: "first" }).get().json();
    await w.url("http://127.0.0.1/search").query({ q: "second" }).get().json();

    expect(searchHandler).toHaveBeenRequestedWithQuery("?q=first");
    expect(searchHandler).toHaveBeenRequestedWithQuery("?q=second");
  });
});
