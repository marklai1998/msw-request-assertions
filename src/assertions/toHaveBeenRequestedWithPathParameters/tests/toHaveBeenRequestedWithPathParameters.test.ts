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

describe("toHaveBeenRequestedWithPathParameters", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  it("should match request with single path parameter", async () => {
    await wretch("http://127.0.0.1/users/123").get().json();

    expect(userHandler).toHaveBeenRequestedWithPathParameters({
      userId: "123",
    });
  });

  it("should match request with multiple path parameters", async () => {
    await wretch("http://127.0.0.1/posts/456/comments/789").get().json();

    expect(postHandler).toHaveBeenRequestedWithPathParameters({
      postId: "456",
      commentId: "789",
    });
  });

  it("should match request with numeric-like path parameters", async () => {
    await wretch("http://127.0.0.1/users/12345").get().json();

    expect(userHandler).toHaveBeenRequestedWithPathParameters({
      userId: "12345",
    });
  });

  it("should fail when path parameters don't match", async () => {
    await wretch("http://127.0.0.1/users/123").get().json();

    expect(() => {
      expect(userHandler).toHaveBeenRequestedWithPathParameters({
        userId: "456",
      });
    }).toThrow();
  });

  it("should work with not matcher", async () => {
    await wretch("http://127.0.0.1/users/123").get().json();

    expect(userHandler).not.toHaveBeenRequestedWithPathParameters({
      userId: "456",
    });
  });

  it("should match any call when multiple calls made", async () => {
    await wretch("http://127.0.0.1/users/123").get().json();
    await wretch("http://127.0.0.1/users/456").get().json();

    expect(userHandler).toHaveBeenRequestedWithPathParameters({
      userId: "123",
    });
    expect(userHandler).toHaveBeenRequestedWithPathParameters({
      userId: "456",
    });
  });

  it("should handle empty path parameters", async () => {
    const noParamsHandler = http.get("http://127.0.0.1/api/data", () => {
      return HttpResponse.json({ data: "test" });
    });

    server.use(noParamsHandler);

    await wretch("http://127.0.0.1/api/data").get().json();

    expect(noParamsHandler).toHaveBeenRequestedWithPathParameters({});
  });
});
