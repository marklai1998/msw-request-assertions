import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import wretch from "wretch";
import "../../../vitest/index.js";

const postHandler = http.post("http://127.0.0.1/users", () => {
  return HttpResponse.json({
    id: 1,
    name: "John Doe",
  });
});

const getHandler = http.get("http://127.0.0.1/users", () => {
  return HttpResponse.json([{ id: 1, name: "John Doe" }]);
});

const restHandlers = [postHandler, getHandler];
const server = setupServer(...restHandlers);

describe("toHaveBeenRequestedWith", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

  afterAll(() => server.close());

  afterEach(() => server.resetHandlers());

  it("should match request with JSON body", async () => {
    const userData = { name: "John Doe", email: "john@example.com" };

    await wretch("http://127.0.0.1/users").post(userData).json();

    expect(postHandler).toHaveBeenRequestedWith({
      jsonBody: userData,
    });
  });

  it("should match request with query parameters", async () => {
    await wretch("http://127.0.0.1/users?page=1&limit=10").get().json();

    expect(getHandler).toHaveBeenRequestedWith({
      query: "?page=1&limit=10",
    });
  });

  it("should match request with headers", async () => {
    await wretch("http://127.0.0.1/users")
      .headers({
        Authorization: "Bearer token123",
        "Content-Type": "application/json",
      })
      .get()
      .json();

    // Only check the specific headers we set
    expect(getHandler).toHaveBeenRequestedWith({
      headers: {
        authorization: "Bearer token123",
        "content-type": "application/json",
      },
    });
  });

  it("should match request with multiple aspects", async () => {
    const userData = { name: "Jane Doe", email: "jane@example.com" };

    await wretch("http://127.0.0.1/users?source=web")
      .headers({ Authorization: "Bearer token456" })
      .post(userData)
      .json();

    expect(postHandler).toHaveBeenRequestedWith({
      jsonBody: userData,
      query: "?source=web",
      headers: {
        authorization: "Bearer token456",
        "content-type": "application/json",
      },
    });
  });

  it("should match request with hash", async () => {
    await wretch("http://127.0.0.1/users#section1").get().json();

    expect(getHandler).toHaveBeenRequestedWith({
      hash: "#section1",
    });
  });

  it("should match request with raw body", async () => {
    const rawData = "name=John&email=john@example.com";

    await wretch("http://127.0.0.1/users")
      .headers({ "Content-Type": "application/x-www-form-urlencoded" })
      .body(rawData)
      .post()
      .json();

    expect(postHandler).toHaveBeenRequestedWith({
      body: rawData,
    });
  });

  it("should fail when request doesn't match", async () => {
    const userData = { name: "John Doe" };

    await wretch("http://127.0.0.1/users").post(userData).json();

    expect(() => {
      expect(postHandler).toHaveBeenRequestedWith({
        jsonBody: { name: "Jane Doe" }, // Different data
      });
    }).toThrow();
  });
});
