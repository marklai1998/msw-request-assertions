import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import wretch from "wretch";
import "../../../vitest";

const userHandler = http.get("http://127.0.0.1/users/:userId", ({ params }) => {
  return HttpResponse.json({ id: params.userId, name: "John Doe" });
});

const postHandler = http.get(
  "http://127.0.0.1/posts/:postId/comments/:commentId",
  ({ params }) => {
    return HttpResponse.json({
      postId: params.postId,
      commentId: params.commentId,
      content: "Test comment",
    });
  },
);

const server = setupServer(userHandler, postHandler);

describe("toHaveBeenNthRequestedWithPathParameters", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  it("should match 1st request with path parameters", async () => {
    await wretch("http://127.0.0.1/users/123").get().json();
    await wretch("http://127.0.0.1/users/456").get().json();

    expect(userHandler).toHaveBeenNthRequestedWithPathParameters(1, {
      userId: "123",
    });
  });

  it("should match 2nd request with path parameters", async () => {
    await wretch("http://127.0.0.1/users/123").get().json();
    await wretch("http://127.0.0.1/users/456").get().json();

    expect(userHandler).toHaveBeenNthRequestedWithPathParameters(2, {
      userId: "456",
    });
  });

  it("should match multiple path parameters at specific position", async () => {
    await wretch("http://127.0.0.1/posts/100/comments/200").get().json();
    await wretch("http://127.0.0.1/posts/300/comments/400").get().json();

    expect(postHandler).toHaveBeenNthRequestedWithPathParameters(2, {
      postId: "300",
      commentId: "400",
    });
  });

  it("should fail when nth call doesn't match", async () => {
    await wretch("http://127.0.0.1/users/123").get().json();
    await wretch("http://127.0.0.1/users/456").get().json();

    expect(() => {
      expect(userHandler).toHaveBeenNthRequestedWithPathParameters(2, {
        userId: "wrong-id",
      });
    }).toThrow();
  });

  it("should fail when call index is out of bounds", async () => {
    await wretch("http://127.0.0.1/users/123").get().json();

    expect(() => {
      expect(userHandler).toHaveBeenNthRequestedWithPathParameters(2, {
        userId: "123",
      });
    }).toThrow();
  });

  it("should work with not matcher", async () => {
    await wretch("http://127.0.0.1/users/123").get().json();
    await wretch("http://127.0.0.1/users/456").get().json();

    expect(userHandler).not.toHaveBeenNthRequestedWithPathParameters(1, {
      userId: "wrong-id",
    });
    expect(userHandler).not.toHaveBeenNthRequestedWithPathParameters(2, {
      userId: "wrong-id",
    });
  });

  it("should handle empty path parameters", async () => {
    const noParamsHandler = http.get("http://127.0.0.1/api/data", () => {
      return HttpResponse.json({ data: "test" });
    });

    server.use(noParamsHandler);

    await wretch("http://127.0.0.1/api/data").get().json();
    await wretch("http://127.0.0.1/api/data").get().json();

    expect(noParamsHandler).toHaveBeenNthRequestedWithPathParameters(1, {});
    expect(noParamsHandler).toHaveBeenNthRequestedWithPathParameters(2, {});
  });
});
