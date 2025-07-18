import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import "../../../vitest";

const handler = http.get("http://127.0.0.1/test", ({ request }) => {
  const url = new URL(request.url);
  return HttpResponse.json({ query: url.search });
});

const server = setupServer(handler);

describe("toHaveBeenRequestedWithQueryString", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  it("should match request with query string", async () => {
    await fetch("http://127.0.0.1/test?foo=bar&baz=qux");

    expect(handler).toHaveBeenRequestedWithQueryString("?foo=bar&baz=qux");
  });

  it("should match request with empty query string", async () => {
    await fetch("http://127.0.0.1/test");

    expect(handler).toHaveBeenRequestedWithQueryString("");
  });

  it("should fail when query string doesn't match", async () => {
    await fetch("http://127.0.0.1/test?foo=bar");

    expect(() => {
      expect(handler).toHaveBeenRequestedWithQueryString("?foo=baz");
    }).toThrow();
  });

  it("should work with not matcher", async () => {
    await fetch("http://127.0.0.1/test?foo=bar");

    expect(handler).not.toHaveBeenRequestedWithQueryString("?foo=baz");
  });

  it("should match any call when multiple calls made", async () => {
    await fetch("http://127.0.0.1/test?foo=bar");
    await fetch("http://127.0.0.1/test?baz=qux");

    expect(handler).toHaveBeenRequestedWithQueryString("?foo=bar");
    expect(handler).toHaveBeenRequestedWithQueryString("?baz=qux");
  });
});
