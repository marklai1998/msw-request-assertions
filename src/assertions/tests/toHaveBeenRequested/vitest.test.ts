import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import wretch from "wretch";
import "../../../vitest/index.js";

const usersHandler = http.get("http://127.0.0.1/users", () => {
  return HttpResponse.json([{ id: 1, name: "John Doe" }]);
});

const apiHandler = http.post("http://127.0.0.1/api/data", () => {
  return HttpResponse.json({
    success: true,
  });
});

const restHandlers = [usersHandler, apiHandler];
const server = setupServer(...restHandlers);

describe("toHaveBeenRequested", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

  afterAll(() => server.close());

  afterEach(() => server.resetHandlers());

  it("should pass when handler has been called", async () => {
    await wretch("http://127.0.0.1/users").get().json();

    expect(usersHandler).toHaveBeenRequested();
  });

  it("should pass when handler has been called multiple times", async () => {
    await wretch("http://127.0.0.1/users").get().json();
    await wretch("http://127.0.0.1/users").get().json();

    expect(usersHandler).toHaveBeenRequested();
  });

  it("should fail when handler has not been called", async () => {
    // Don't make any requests
    expect(() => {
      expect(usersHandler).toHaveBeenRequested();
    }).toThrow();
  });

  it("should work with not matcher", async () => {
    // Don't make any requests to usersHandler
    await wretch("http://127.0.0.1/api/data").post({ data: "test" }).json();

    expect(usersHandler).not.toHaveBeenRequested();
  });
});
