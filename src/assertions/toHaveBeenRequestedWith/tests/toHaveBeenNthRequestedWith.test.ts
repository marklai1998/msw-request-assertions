import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import wretch from "wretch";
import "../../../vitest";

const usersHandler = http.post("http://127.0.0.1/users", () => {
  return HttpResponse.json({ id: 1, name: "John Doe" });
});

const server = setupServer(usersHandler);

describe("toHaveBeenNthRequestedWith", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  it("should match specific call positions", async () => {
    const firstData = { name: "John", email: "john@example.com" };
    const secondData = { name: "Jane", email: "jane@example.com" };

    await wretch("http://127.0.0.1/users").post(firstData).json();
    await wretch("http://127.0.0.1/users").post(secondData).json();

    expect(usersHandler).toHaveBeenNthRequestedWith(1, { jsonBody: firstData });
    expect(usersHandler).toHaveBeenNthRequestedWith(2, {
      jsonBody: secondData,
    });
  });

  it("should match nth request with multiple aspects", async () => {
    await wretch("http://127.0.0.1/users?page=1#section1")
      .headers({ Authorization: "Bearer token123" })
      .post({ name: "John" })
      .json();

    await wretch("http://127.0.0.1/users?page=2")
      .body("name=Jane&email=jane@example.com")
      .headers({ "Content-Type": "application/x-www-form-urlencoded" })
      .post()
      .json();

    expect(usersHandler).toHaveBeenNthRequestedWith(1, {
      jsonBody: { name: "John" },
      query: "?page=1",
      hash: "#section1",
      headers: {
        authorization: "Bearer token123",
        "content-type": "application/json",
      },
    });

    expect(usersHandler).toHaveBeenNthRequestedWith(2, {
      body: "name=Jane&email=jane@example.com",
      query: "?page=2",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
    });
  });

  it("should fail when nth call doesn't match", async () => {
    await wretch("http://127.0.0.1/users").post({ name: "John" }).json();
    await wretch("http://127.0.0.1/users").post({ name: "Jane" }).json();

    expect(() => {
      expect(usersHandler).toHaveBeenNthRequestedWith(2, {
        jsonBody: { name: "Bob" },
      });
    }).toThrow();
  });

  it("should fail when call index is out of bounds", async () => {
    await wretch("http://127.0.0.1/users").post({ name: "John" }).json();

    expect(() => {
      expect(usersHandler).toHaveBeenNthRequestedWith(2, {
        jsonBody: { name: "John" },
      });
    }).toThrow();
  });
});
