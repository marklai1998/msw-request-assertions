import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import wretch from "wretch";
import "../../../vitest";

const postHandler = http.post("http://127.0.0.1/users", () => {
  return HttpResponse.json({ id: 1, name: "John Doe" });
});

const getHandler = http.get("http://127.0.0.1/users", () => {
  return HttpResponse.json([{ id: 1, name: "John Doe" }]);
});

const server = setupServer(postHandler, getHandler);

describe("toHaveBeenRequestedWith", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  it("should match request with JSON body", async () => {
    const userData = { name: "John Doe", email: "john@example.com" };
    await wretch("http://127.0.0.1/users").post(userData).json();

    expect(postHandler).toHaveBeenRequestedWith({ jsonBody: userData });
  });

  it("should match request with multiple aspects", async () => {
    const userData = { name: "Jane Doe", email: "jane@example.com" };
    await wretch("http://127.0.0.1/users?source=web#section1")
      .headers({ Authorization: "Bearer token456" })
      .post(userData)
      .json();

    expect(postHandler).toHaveBeenRequestedWith({
      jsonBody: userData,
      queryString: "?source=web",
      hash: "#section1",
      headers: {
        authorization: "Bearer token456",
        "content-type": "application/json",
      },
    });
  });

  it("should match request with raw body", async () => {
    const rawData = "name=John&email=john@example.com";
    await wretch("http://127.0.0.1/users")
      .headers({ "Content-Type": "application/x-www-form-urlencoded" })
      .body(rawData)
      .post()
      .json();

    expect(postHandler).toHaveBeenRequestedWith({ body: rawData });
  });

  it("should fail when request doesn't match", async () => {
    await wretch("http://127.0.0.1/users").post({ name: "John Doe" }).json();

    expect(() => {
      expect(postHandler).toHaveBeenRequestedWith({
        jsonBody: { name: "Jane Doe" },
      });
    }).toThrow();
  });
});
