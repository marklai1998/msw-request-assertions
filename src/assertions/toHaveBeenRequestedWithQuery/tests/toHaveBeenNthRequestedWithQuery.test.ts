import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import wretch from "wretch";
import QueryStringAddon from "wretch/addons/queryString";
import "../../../vitest";

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

describe("toHaveBeenNthRequestedWithQuery", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

  afterAll(() => server.close());

  afterEach(() => server.resetHandlers());

  it("should match 1st request with query parameter", async () => {
    await w.url("http://127.0.0.1/search").query({ q: "first" }).get().json();
    await w.url("http://127.0.0.1/search").query({ q: "second" }).get().json();

    expect(searchHandler).toHaveBeenNthRequestedWithQuery(1, "?q=first");
  });

  it("should match 2nd request with query parameter", async () => {
    await w.url("http://127.0.0.1/search").query({ q: "first" }).get().json();
    await w.url("http://127.0.0.1/search").query({ q: "second" }).get().json();

    expect(searchHandler).toHaveBeenNthRequestedWithQuery(2, "?q=second");
  });

  it("should match 3rd request with query parameter", async () => {
    await w.url("http://127.0.0.1/search").query({ q: "first" }).get().json();
    await w.url("http://127.0.0.1/search").query({ q: "second" }).get().json();
    await w.url("http://127.0.0.1/search").query({ q: "third" }).get().json();

    expect(searchHandler).toHaveBeenNthRequestedWithQuery(3, "?q=third");
  });

  it("should match nth request with multiple query parameters", async () => {
    await w
      .url("http://127.0.0.1/search")
      .query({ q: "test1", page: 1 })
      .get()
      .json();
    await w
      .url("http://127.0.0.1/search")
      .query({ q: "test2", page: 2, limit: 10 })
      .get()
      .json();

    expect(searchHandler).toHaveBeenNthRequestedWithQuery(
      2,
      "?q=test2&page=2&limit=10",
    );
  });

  it("should match nth request with encoded query parameters", async () => {
    await w.url("http://127.0.0.1/search").query({ q: "simple" }).get().json();
    await w
      .url("http://127.0.0.1/search")
      .query({ q: "hello world", category: "tech" })
      .get()
      .json();

    expect(searchHandler).toHaveBeenNthRequestedWithQuery(
      2,
      "?q=hello+world&category=tech",
    );
  });

  it("should match nth request with empty query string", async () => {
    await wretch("http://127.0.0.1/users").get().json();
    await w.url("http://127.0.0.1/users").query({ page: 1 }).get().json();

    expect(usersHandler).toHaveBeenNthRequestedWithQuery(1, "");
  });

  it("should match nth request with complex query parameters", async () => {
    const firstQuery = "?simple=test";
    const secondQuery =
      "?search=test&filters[category]=tech&filters[price][min]=100&filters[price][max]=500&sort=date&order=desc";

    await wretch(`http://127.0.0.1/search${firstQuery}`).get().json();
    await wretch(`http://127.0.0.1/search${secondQuery}`).get().json();

    expect(searchHandler).toHaveBeenNthRequestedWithQuery(2, secondQuery);
  });

  it("should match nth request with array query parameters", async () => {
    await w.url("http://127.0.0.1/search").query({ q: "basic" }).get().json();
    await w
      .url("http://127.0.0.1/search")
      .query({ tags: ["javascript", "typescript", "react"] })
      .get()
      .json();

    expect(searchHandler).toHaveBeenNthRequestedWithQuery(
      2,
      "?tags=javascript&tags=typescript&tags=react",
    );
  });

  it("should fail when nth request query doesn't match", async () => {
    await w.url("http://127.0.0.1/search").query({ q: "first" }).get().json();
    await w.url("http://127.0.0.1/search").query({ q: "second" }).get().json();

    expect(() => {
      expect(searchHandler).toHaveBeenNthRequestedWithQuery(2, "?q=wrong");
    }).toThrow();
  });

  it("should fail when requesting nth call that doesn't exist", async () => {
    await w.url("http://127.0.0.1/search").query({ q: "only" }).get().json();

    expect(() => {
      expect(searchHandler).toHaveBeenNthRequestedWithQuery(2, "?q=second");
    }).toThrow();
  });

  it("should work with not matcher for correct nth call", async () => {
    await w.url("http://127.0.0.1/search").query({ q: "first" }).get().json();
    await w.url("http://127.0.0.1/search").query({ q: "second" }).get().json();

    expect(searchHandler).not.toHaveBeenNthRequestedWithQuery(2, "?q=first");
    expect(searchHandler).not.toHaveBeenNthRequestedWithQuery(1, "?q=second");
  });

  it("should work with not matcher for wrong query", async () => {
    await w.url("http://127.0.0.1/search").query({ q: "actual" }).get().json();

    expect(searchHandler).not.toHaveBeenNthRequestedWithQuery(0, "?q=wrong");
  });

  it("should handle multiple handlers independently", async () => {
    await w.url("http://127.0.0.1/search").query({ q: "search1" }).get().json();
    await w.url("http://127.0.0.1/users").query({ page: 1 }).get().json();
    await w.url("http://127.0.0.1/search").query({ q: "search2" }).get().json();

    expect(searchHandler).toHaveBeenNthRequestedWithQuery(1, "?q=search1");
    expect(searchHandler).toHaveBeenNthRequestedWithQuery(2, "?q=search2");
    expect(usersHandler).toHaveBeenNthRequestedWithQuery(1, "?page=1");
  });

  it("should handle requests with same query parameters on different calls", async () => {
    const sameQuery = "?q=duplicate";

    await wretch(`http://127.0.0.1/search${sameQuery}`).get().json();
    await w
      .url("http://127.0.0.1/search")
      .query({ q: "different" })
      .get()
      .json();
    await wretch(`http://127.0.0.1/search${sameQuery}`).get().json();

    expect(searchHandler).toHaveBeenNthRequestedWithQuery(1, sameQuery);
    expect(searchHandler).toHaveBeenNthRequestedWithQuery(3, sameQuery);
    expect(searchHandler).toHaveBeenNthRequestedWithQuery(2, "?q=different");
  });
});
