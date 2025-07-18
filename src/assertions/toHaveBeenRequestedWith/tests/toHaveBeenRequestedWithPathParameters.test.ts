import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import wretch from "wretch";
import "../../../vitest";

const userHandler = http.get("http://127.0.0.1/users/:userId", ({ params }) => {
  return HttpResponse.json({ id: params.userId, name: "John Doe" });
});

const postHandler = http.post(
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

describe("toHaveBeenRequestedWith - Path Parameters", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  it("should match request with path parameters", async () => {
    await wretch("http://127.0.0.1/users/123").get().json();

    expect(userHandler).toHaveBeenRequestedWith({
      pathParameters: { userId: "123" },
    });
  });

  it("should match request with multiple path parameters", async () => {
    await wretch("http://127.0.0.1/posts/456/comments/789")
      .post({ message: "test" })
      .json();

    expect(postHandler).toHaveBeenRequestedWith({
      pathParameters: { postId: "456", commentId: "789" },
      jsonBody: { message: "test" },
    });
  });

  it("should match request with path parameters and other properties", async () => {
    await wretch("http://127.0.0.1/users/123?active=true#profile")
      .headers({ Authorization: "Bearer token" })
      .get()
      .json();

    expect(userHandler).toHaveBeenRequestedWith({
      pathParameters: { userId: "123" },
      queryString: "?active=true",
      hash: "#profile",
      headers: {
        authorization: "Bearer token",
      },
    });
  });

  it("should fail when path parameters don't match", async () => {
    await wretch("http://127.0.0.1/users/123").get().json();

    expect(() => {
      expect(userHandler).toHaveBeenRequestedWith({
        pathParameters: { userId: "456" },
      });
    }).toThrow();
  });

  it("should work with not matcher", async () => {
    await wretch("http://127.0.0.1/users/123").get().json();

    expect(userHandler).not.toHaveBeenRequestedWith({
      pathParameters: { userId: "456" },
    });
  });
});
