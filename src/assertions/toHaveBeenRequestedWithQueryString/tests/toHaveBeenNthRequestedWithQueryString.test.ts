import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import "../../../vitest";

const handler = http.get("http://127.0.0.1/test", ({ request }) => {
  const url = new URL(request.url);
  return HttpResponse.json({ query: url.search });
});

const server = setupServer(handler);

describe("toHaveBeenNthRequestedWithQueryString", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  it("should match specific call position", async () => {
    await fetch("http://127.0.0.1/test?foo=bar");
    await fetch("http://127.0.0.1/test?baz=qux");

    expect(handler).toHaveBeenNthRequestedWithQueryString(1, "?foo=bar");
    expect(handler).toHaveBeenNthRequestedWithQueryString(2, "?baz=qux");
  });

  it("should fail when nth call doesn't match", async () => {
    await fetch("http://127.0.0.1/test?foo=bar");
    await fetch("http://127.0.0.1/test?baz=qux");

    expect(() => {
      expect(handler).toHaveBeenNthRequestedWithQueryString(2, "?wrong=query");
    }).toThrow();
  });

  it("should fail when call index is out of bounds", async () => {
    await fetch("http://127.0.0.1/test?foo=bar");

    expect(() => {
      expect(handler).toHaveBeenNthRequestedWithQueryString(2, "?foo=bar");
    }).toThrow();
  });

  it("should work with not matcher", async () => {
    await fetch("http://127.0.0.1/test?foo=bar");
    await fetch("http://127.0.0.1/test?baz=qux");

    expect(handler).not.toHaveBeenNthRequestedWithQueryString(
      1,
      "?wrong=query",
    );
    expect(handler).not.toHaveBeenNthRequestedWithQueryString(
      2,
      "?wrong=query",
    );
  });

  it("should handle empty query strings", async () => {
    await fetch("http://127.0.0.1/test");
    await fetch("http://127.0.0.1/test?foo=bar");

    expect(handler).toHaveBeenNthRequestedWithQueryString(1, "");
    expect(handler).toHaveBeenNthRequestedWithQueryString(2, "?foo=bar");
  });

  it("should match complex query strings with encoding", async () => {
    await fetch("http://127.0.0.1/test?name=john%20doe&age=25");
    await fetch("http://127.0.0.1/test?search=hello%20world");

    expect(handler).toHaveBeenNthRequestedWithQueryString(
      1,
      "?name=john%20doe&age=25",
    );
    expect(handler).toHaveBeenNthRequestedWithQueryString(
      2,
      "?search=hello%20world",
    );
  });

  it("should be case sensitive", async () => {
    await fetch("http://127.0.0.1/test?Foo=Bar");

    expect(handler).toHaveBeenNthRequestedWithQueryString(1, "?Foo=Bar");
    expect(handler).not.toHaveBeenNthRequestedWithQueryString(1, "?foo=bar");
  });

  it("should handle special characters", async () => {
    await fetch(
      "http://127.0.0.1/test?filter=%5B%22active%22%5D&sort=created_at",
    );

    expect(handler).toHaveBeenNthRequestedWithQueryString(
      1,
      "?filter=%5B%22active%22%5D&sort=created_at",
    );
  });

  it("should handle multiple parameters", async () => {
    await fetch("http://127.0.0.1/test?page=1&limit=10&sort=name&order=asc");
    await fetch("http://127.0.0.1/test?category=electronics&brand=apple");

    expect(handler).toHaveBeenNthRequestedWithQueryString(
      1,
      "?page=1&limit=10&sort=name&order=asc",
    );
    expect(handler).toHaveBeenNthRequestedWithQueryString(
      2,
      "?category=electronics&brand=apple",
    );
  });

  it("should distinguish between similar query strings", async () => {
    await fetch("http://127.0.0.1/test?foo=bar&baz=qux");
    await fetch("http://127.0.0.1/test?foo=bar");

    expect(handler).toHaveBeenNthRequestedWithQueryString(
      1,
      "?foo=bar&baz=qux",
    );
    expect(handler).toHaveBeenNthRequestedWithQueryString(2, "?foo=bar");
    expect(handler).not.toHaveBeenNthRequestedWithQueryString(1, "?foo=bar");
  });

  it("should handle array-like query parameters", async () => {
    await fetch(
      "http://127.0.0.1/test?tags=javascript&tags=typescript&tags=react",
    );
    await fetch("http://127.0.0.1/test?ids=1&ids=2&ids=3");

    expect(handler).toHaveBeenNthRequestedWithQueryString(
      1,
      "?tags=javascript&tags=typescript&tags=react",
    );
    expect(handler).toHaveBeenNthRequestedWithQueryString(
      2,
      "?ids=1&ids=2&ids=3",
    );
  });

  it("should handle boolean-like parameters", async () => {
    await fetch("http://127.0.0.1/test?active=true&deleted=false");
    await fetch("http://127.0.0.1/test?premium=1&verified=0");

    expect(handler).toHaveBeenNthRequestedWithQueryString(
      1,
      "?active=true&deleted=false",
    );
    expect(handler).toHaveBeenNthRequestedWithQueryString(
      2,
      "?premium=1&verified=0",
    );
  });

  it("should handle parameters with no values", async () => {
    await fetch("http://127.0.0.1/test?debug&verbose");

    expect(handler).toHaveBeenNthRequestedWithQueryString(1, "?debug&verbose");
  });

  it("should handle mixed parameter types", async () => {
    await fetch(
      "http://127.0.0.1/test?search=test&page=1&include_deleted&format=json",
    );

    expect(handler).toHaveBeenNthRequestedWithQueryString(
      1,
      "?search=test&page=1&include_deleted&format=json",
    );
  });
});
