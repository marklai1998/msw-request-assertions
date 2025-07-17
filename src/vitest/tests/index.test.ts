import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { describe, expect } from "vitest";
import wretch from "wretch";
import QueryStringAddon from "wretch/addons/queryString";

const myHandler = http.post("http://127.0.0.1/foo", () => {
  return HttpResponse.json({
    a: "b",
  });
});

const restHandlers = [myHandler];

const server = setupServer(...restHandlers);

describe("test", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

  afterAll(() => server.close());

  afterEach(() => server.resetHandlers());

  it("run", async () => {
    await wretch("http://127.0.0.1")
      .addon(QueryStringAddon)
      .query({ foo: "bar" })
      .url("/foo")
      .headers({ x: "y" })
      .post({ a: "b" })
      .json();

    expect(myHandler).toHaveBeenRequestedWithBody(JSON.stringify({ a: "b" }));
    expect(myHandler).toHaveBeenRequestedWithJsonBody({ a: "b" });
    expect(myHandler).toHaveBeenRequestedWithHeaders({
      x: "y",
      "content-type": "application/json",
    });
    expect(myHandler).toHaveBeenRequestedWithQuery(`?foo=bar`);

    expect(myHandler).toHaveBeenRequestedWith({
      body: JSON.stringify({ a: "b" }),
      jsonBody: { a: "b" },
      headers: { x: "y", "content-type": "application/json" },
      query: "?foo=bar",
    });
  });

  it("with string body", async () => {
    await wretch("http://127.0.0.1")
      .addon(QueryStringAddon)
      .query({ foo: "bar" })
      .url("/foo")
      .post("HELLO")
      .json();

    expect(myHandler).toHaveBeenRequestedWithBody("HELLO");
    expect(myHandler).toHaveBeenRequestedWithHeaders({
      x: "y",
      "content-type": "application/json",
    });
    expect(myHandler).toHaveBeenRequestedWithQuery(`?foo=bar`);
  });

  it("with hash", async () => {
    await wretch("http://127.0.0.1").url("/foo#test-hash").post("HELLO").json();

    expect(myHandler).toHaveBeenRequestedWithHash("#test-hash");
  });
});
