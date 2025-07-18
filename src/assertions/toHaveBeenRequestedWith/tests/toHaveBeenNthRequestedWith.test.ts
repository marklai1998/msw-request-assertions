import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import wretch from "wretch";
import "../../../vitest";

const usersHandler = http.post("http://127.0.0.1/users", () => {
  return HttpResponse.json({
    id: 1,
    name: "John Doe",
  });
});

const apiHandler = http.get("http://127.0.0.1/api/data", () => {
  return HttpResponse.json({
    success: true,
  });
});

const formsHandler = http.put("http://127.0.0.1/forms", () => {
  return HttpResponse.json({
    submitted: true,
  });
});

const restHandlers = [usersHandler, apiHandler, formsHandler];
const server = setupServer(...restHandlers);

describe("toHaveBeenNthRequestedWith", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

  afterAll(() => server.close());

  afterEach(() => server.resetHandlers());

  it("should match 1st request with JSON body", async () => {
    const firstData = { name: "John", email: "john@example.com" };
    const secondData = { name: "Jane", email: "jane@example.com" };

    await wretch("http://127.0.0.1/users").post(firstData).json();
    await wretch("http://127.0.0.1/users").post(secondData).json();

    expect(usersHandler).toHaveBeenNthRequestedWith(1, {
      jsonBody: firstData,
    });
  });

  it("should match 2nd request with JSON body", async () => {
    const firstData = { name: "John", email: "john@example.com" };
    const secondData = { name: "Jane", email: "jane@example.com" };

    await wretch("http://127.0.0.1/users").post(firstData).json();
    await wretch("http://127.0.0.1/users").post(secondData).json();

    expect(usersHandler).toHaveBeenNthRequestedWith(2, {
      jsonBody: secondData,
    });
  });

  it("should match nth request with query parameters", async () => {
    await wretch("http://127.0.0.1/api/data?page=1").get().json();
    await wretch("http://127.0.0.1/api/data?page=2&limit=20").get().json();
    await wretch("http://127.0.0.1/api/data?search=test").get().json();

    expect(apiHandler).toHaveBeenNthRequestedWith(2, {
      query: "?page=2&limit=20",
    });
  });

  it("should match nth request with headers", async () => {
    await wretch("http://127.0.0.1/api/data")
      .headers({ Authorization: "Bearer token1" })
      .get()
      .json();
    await wretch("http://127.0.0.1/api/data")
      .headers({ Authorization: "Bearer token2", "X-Client": "app" })
      .get()
      .json();

    expect(apiHandler).toHaveBeenNthRequestedWith(2, {
      headers: {
        authorization: "Bearer token2",
        "x-client": "app",
      },
    });
  });

  it("should match nth request with hash", async () => {
    await wretch("http://127.0.0.1/api/data#section1").get().json();
    await wretch("http://127.0.0.1/api/data#section2").get().json();

    expect(apiHandler).toHaveBeenNthRequestedWith(1, {
      hash: "#section1",
    });
  });

  it("should match nth request with raw body", async () => {
    const firstBody = "name=John&email=john@example.com";
    const secondBody = "name=Jane&email=jane@example.com&age=30";

    await wretch("http://127.0.0.1/forms")
      .headers({ "Content-Type": "application/x-www-form-urlencoded" })
      .body(firstBody)
      .put()
      .json();
    await wretch("http://127.0.0.1/forms")
      .headers({ "Content-Type": "application/x-www-form-urlencoded" })
      .body(secondBody)
      .put()
      .json();

    expect(formsHandler).toHaveBeenNthRequestedWith(2, {
      body: secondBody,
    });
  });

  it("should match nth request with multiple aspects", async () => {
    const firstData = { name: "John" };
    const secondData = { name: "Jane", role: "admin" };

    await wretch("http://127.0.0.1/users?simple=true")
      .headers({ Authorization: "Bearer token1" })
      .post(firstData)
      .json();
    await wretch("http://127.0.0.1/users?source=web&version=2")
      .headers({
        Authorization: "Bearer token2",
        "X-Request-ID": "req-123",
      })
      .post(secondData)
      .json();

    expect(usersHandler).toHaveBeenNthRequestedWith(2, {
      jsonBody: secondData,
      query: "?source=web&version=2",
      headers: {
        authorization: "Bearer token2",
        "content-type": "application/json",
        "x-request-id": "req-123",
      },
    });
  });

  it("should match nth request with all aspects", async () => {
    const userData = { name: "Complete", email: "complete@example.com" };

    await wretch("http://127.0.0.1/users?test=simple")
      .post({ simple: true })
      .json();
    await wretch("http://127.0.0.1/users?filter=active&sort=name#results")
      .headers({
        Authorization: "Bearer complete-token",
        "X-Version": "1.0",
      })
      .post(userData)
      .json();

    expect(usersHandler).toHaveBeenNthRequestedWith(2, {
      jsonBody: userData,
      query: "?filter=active&sort=name",
      hash: "#results",
      headers: {
        authorization: "Bearer complete-token",
        "content-type": "application/json",
        "x-version": "1.0",
      },
    });
  });

  it("should match 3rd request with partial matching", async () => {
    await wretch("http://127.0.0.1/api/data?first=1").get().json();
    await wretch("http://127.0.0.1/api/data?second=2").get().json();
    await wretch("http://127.0.0.1/api/data?third=3#section")
      .headers({ "X-Test": "value" })
      .get()
      .json();

    // Only check query and hash, ignore headers
    expect(apiHandler).toHaveBeenNthRequestedWith(3, {
      query: "?third=3",
      hash: "#section",
    });
  });

  it("should fail when nth request doesn't match", async () => {
    const firstData = { name: "John" };
    const secondData = { name: "Jane" };

    await wretch("http://127.0.0.1/users").post(firstData).json();
    await wretch("http://127.0.0.1/users").post(secondData).json();

    expect(() => {
      expect(usersHandler).toHaveBeenNthRequestedWith(2, {
        jsonBody: { name: "Bob" }, // Different data
      });
    }).toThrow();
  });

  it("should fail when requesting nth call that doesn't exist", async () => {
    await wretch("http://127.0.0.1/users").post({ name: "Only" }).json();

    expect(() => {
      expect(usersHandler).toHaveBeenNthRequestedWith(2, {
        jsonBody: { name: "Second" },
      });
    }).toThrow();
  });

  it("should work with not matcher for correct nth call", async () => {
    const firstData = { name: "John" };
    const secondData = { name: "Jane" };

    await wretch("http://127.0.0.1/users?page=1").post(firstData).json();
    await wretch("http://127.0.0.1/users?page=2").post(secondData).json();

    expect(usersHandler).not.toHaveBeenNthRequestedWith(2, {
      jsonBody: firstData,
      query: "?page=1",
    });
    expect(usersHandler).not.toHaveBeenNthRequestedWith(1, {
      jsonBody: secondData,
      query: "?page=2",
    });
  });

  it("should work with not matcher for wrong data", async () => {
    await wretch("http://127.0.0.1/users?actual=true")
      .post({ name: "Actual" })
      .json();

    expect(usersHandler).not.toHaveBeenNthRequestedWith(1, {
      jsonBody: { name: "Wrong" },
      query: "?actual=true",
    });
  });

  it("should handle multiple handlers independently", async () => {
    const userData = { name: "User" };
    const formData = "field=value";

    await wretch("http://127.0.0.1/users?userQuery=1")
      .headers({ "X-User": "true" })
      .post(userData)
      .json();
    await wretch("http://127.0.0.1/api/data?apiQuery=1")
      .headers({ "X-API": "true" })
      .get()
      .json();
    await wretch("http://127.0.0.1/forms?formQuery=1")
      .headers({ "X-Form": "true" })
      .body(formData)
      .put()
      .json();

    expect(usersHandler).toHaveBeenNthRequestedWith(1, {
      jsonBody: userData,
      query: "?userQuery=1",
      headers: {
        "content-type": "application/json",
        "x-user": "true",
      },
    });
    expect(apiHandler).toHaveBeenNthRequestedWith(1, {
      query: "?apiQuery=1",
      headers: {
        "x-api": "true",
      },
    });
    expect(formsHandler).toHaveBeenNthRequestedWith(1, {
      body: formData,
      query: "?formQuery=1",
      headers: {
        "content-type": "text/plain;charset=UTF-8",
        "x-form": "true",
      },
    });
  });

  it("should handle mixed JSON body and raw body across calls", async () => {
    const jsonData = { type: "json" };
    const rawData = "type=raw";

    await wretch("http://127.0.0.1/users").post(jsonData).json();
    await wretch("http://127.0.0.1/users")
      .headers({ "Content-Type": "application/x-www-form-urlencoded" })
      .body(rawData)
      .post()
      .json();

    expect(usersHandler).toHaveBeenNthRequestedWith(1, {
      jsonBody: jsonData,
    });
    expect(usersHandler).toHaveBeenNthRequestedWith(2, {
      body: rawData,
    });
  });

  it("should handle complex nested scenarios", async () => {
    const complexData = {
      user: { name: "Complex", preferences: { theme: "dark" } },
      metadata: { version: 2, features: ["a", "b"] },
    };

    await wretch("http://127.0.0.1/users?simple=test")
      .post({ simple: true })
      .json();
    await wretch(
      "http://127.0.0.1/users?complex=true&nested[deep]=value#advanced",
    )
      .headers({
        Authorization: "Bearer complex-token",
        "X-Complex": "true",
        "Content-Type": "application/json",
      })
      .post(complexData)
      .json();

    expect(usersHandler).toHaveBeenNthRequestedWith(2, {
      jsonBody: complexData,
      query: "?complex=true&nested[deep]=value",
      hash: "#advanced",
      headers: {
        authorization: "Bearer complex-token",
        "x-complex": "true",
        "content-type": "application/json",
      },
    });
  });
});
