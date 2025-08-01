import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import wretch from "wretch";
import "../../../vitest";

const apiHandler = http.post("http://127.0.0.1/api/data", () => {
  return HttpResponse.json({ success: true });
});

const server = setupServer(apiHandler);

describe("toHaveBeenRequestedWithHeaders", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  it("should match request with single header", async () => {
    await wretch("http://127.0.0.1/api/data")
      .headers({ Authorization: "Bearer token123" })
      .post({ data: "test" })
      .json();

    expect(apiHandler).toHaveBeenRequestedWithHeaders({
      authorization: "Bearer token123",
      "content-type": "application/json",
    });
  });

  it("should match request with multiple headers", async () => {
    await wretch("http://127.0.0.1/api/data")
      .headers({
        Authorization: "Bearer token123",
        "Content-Type": "application/json",
        "X-Client-Version": "1.0.0",
      })
      .post({ data: "test" })
      .json();

    expect(apiHandler).toHaveBeenRequestedWithHeaders({
      authorization: "Bearer token123",
      "content-type": "application/json",
      "x-client-version": "1.0.0",
    });
  });

  it("should fail when headers don't match", async () => {
    await wretch("http://127.0.0.1/api/data")
      .headers({ Authorization: "Bearer token123" })
      .post({ data: "test" })
      .json();

    expect(() => {
      expect(apiHandler).toHaveBeenRequestedWithHeaders({
        authorization: "Bearer different-token",
      });
    }).toThrow();
  });

  it("should work with not matcher", async () => {
    await wretch("http://127.0.0.1/api/data")
      .headers({ Authorization: "Bearer token123" })
      .post({ data: "test" })
      .json();

    expect(apiHandler).not.toHaveBeenRequestedWithHeaders({
      authorization: "Bearer different-token",
    });
  });
});
