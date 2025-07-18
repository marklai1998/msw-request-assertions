import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import wretch from "wretch";
import "../../../vitest";

const apiHandler = http.post("http://127.0.0.1/api/data", () => {
  return HttpResponse.json({
    success: true,
  });
});

const formsHandler = http.post("http://127.0.0.1/forms/submit", () => {
  return HttpResponse.json({
    submitted: true,
  });
});

const uploadHandler = http.put("http://127.0.0.1/upload", () => {
  return HttpResponse.json({
    uploaded: true,
  });
});

const restHandlers = [apiHandler, formsHandler, uploadHandler];
const server = setupServer(...restHandlers);

describe("toHaveBeenNthRequestedWithBody", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

  afterAll(() => server.close());

  afterEach(() => server.resetHandlers());

  it("should match 1st request with text body", async () => {
    await wretch("http://127.0.0.1/api/data")
      .headers({ "Content-Type": "text/plain" })
      .body("first request")
      .post()
      .json();
    await wretch("http://127.0.0.1/api/data")
      .headers({ "Content-Type": "text/plain" })
      .body("second request")
      .post()
      .json();

    expect(apiHandler).toHaveBeenNthRequestedWithBody(1, "first request");
  });

  it("should match 2nd request with text body", async () => {
    await wretch("http://127.0.0.1/api/data")
      .headers({ "Content-Type": "text/plain" })
      .body("first request")
      .post()
      .json();
    await wretch("http://127.0.0.1/api/data")
      .headers({ "Content-Type": "text/plain" })
      .body("second request")
      .post()
      .json();

    expect(apiHandler).toHaveBeenNthRequestedWithBody(2, "second request");
  });

  it("should match 3rd request with text body", async () => {
    await wretch("http://127.0.0.1/api/data").body("first").post().json();
    await wretch("http://127.0.0.1/api/data").body("second").post().json();
    await wretch("http://127.0.0.1/api/data").body("third").post().json();

    expect(apiHandler).toHaveBeenNthRequestedWithBody(3, "third");
  });

  it("should match nth request with JSON string body", async () => {
    const firstBody = JSON.stringify({ name: "John" });
    const secondBody = JSON.stringify({ name: "Jane", age: 30, active: true });

    await wretch("http://127.0.0.1/api/data")
      .headers({ "Content-Type": "application/json" })
      .body(firstBody)
      .post()
      .json();
    await wretch("http://127.0.0.1/api/data")
      .headers({ "Content-Type": "application/json" })
      .body(secondBody)
      .post()
      .json();

    expect(apiHandler).toHaveBeenNthRequestedWithBody(2, secondBody);
  });

  it("should match nth request with form data body", async () => {
    const firstForm = "name=John&email=john@example.com";
    const secondForm = "name=Jane&email=jane@example.com&age=30&subscribe=true";

    await wretch("http://127.0.0.1/forms/submit")
      .headers({ "Content-Type": "application/x-www-form-urlencoded" })
      .body(firstForm)
      .post()
      .json();
    await wretch("http://127.0.0.1/forms/submit")
      .headers({ "Content-Type": "application/x-www-form-urlencoded" })
      .body(secondForm)
      .post()
      .json();

    expect(formsHandler).toHaveBeenNthRequestedWithBody(2, secondForm);
  });

  it("should match nth request with empty body", async () => {
    await wretch("http://127.0.0.1/api/data").post().json();
    await wretch("http://127.0.0.1/api/data")
      .body("with content")
      .post()
      .json();

    expect(apiHandler).toHaveBeenNthRequestedWithBody(1, "");
  });

  it("should match nth request with multiline text body", async () => {
    const firstBody = "Line 1\nLine 2";
    const secondBody = "First line\nSecond line\nThird line with more content";

    await wretch("http://127.0.0.1/upload")
      .headers({ "Content-Type": "text/plain" })
      .body(firstBody)
      .put()
      .json();
    await wretch("http://127.0.0.1/upload")
      .headers({ "Content-Type": "text/plain" })
      .body(secondBody)
      .put()
      .json();

    expect(uploadHandler).toHaveBeenNthRequestedWithBody(2, secondBody);
  });

  it("should match nth request with special characters in body", async () => {
    const firstBody = "basic text";
    const secondBody = "Special chars: àáâãäå çñø ñîï 中文 🚀 & <script>";

    await wretch("http://127.0.0.1/api/data").body(firstBody).post().json();
    await wretch("http://127.0.0.1/api/data").body(secondBody).post().json();

    expect(apiHandler).toHaveBeenNthRequestedWithBody(2, secondBody);
  });

  it("should match nth request with XML body", async () => {
    const firstBody = "<simple>data</simple>";
    const secondBody = `<?xml version="1.0" encoding="UTF-8"?>
<root>
  <user id="123">
    <name>John Doe</name>
    <email>john@example.com</email>
  </user>
</root>`;

    await wretch("http://127.0.0.1/api/data")
      .headers({ "Content-Type": "application/xml" })
      .body(firstBody)
      .post()
      .json();
    await wretch("http://127.0.0.1/api/data")
      .headers({ "Content-Type": "application/xml" })
      .body(secondBody)
      .post()
      .json();

    expect(apiHandler).toHaveBeenNthRequestedWithBody(2, secondBody);
  });

  it("should match nth request with URL-encoded body", async () => {
    const firstBody = "query=test";
    const secondBody = "query=hello%20world&filter=category%3Atech&sort=date";

    await wretch("http://127.0.0.1/forms/submit")
      .headers({ "Content-Type": "application/x-www-form-urlencoded" })
      .body(firstBody)
      .post()
      .json();
    await wretch("http://127.0.0.1/forms/submit")
      .headers({ "Content-Type": "application/x-www-form-urlencoded" })
      .body(secondBody)
      .post()
      .json();

    expect(formsHandler).toHaveBeenNthRequestedWithBody(2, secondBody);
  });

  it("should fail when nth request body doesn't match", async () => {
    await wretch("http://127.0.0.1/api/data").body("first body").post().json();
    await wretch("http://127.0.0.1/api/data").body("second body").post().json();

    expect(() => {
      expect(apiHandler).toHaveBeenNthRequestedWithBody(2, "wrong body");
    }).toThrow();
  });

  it("should fail when requesting nth call that doesn't exist", async () => {
    await wretch("http://127.0.0.1/api/data")
      .body("only request")
      .post()
      .json();

    expect(() => {
      expect(apiHandler).toHaveBeenNthRequestedWithBody(2, "second request");
    }).toThrow();
  });

  it("should work with not matcher for correct nth call", async () => {
    await wretch("http://127.0.0.1/api/data").body("first body").post().json();
    await wretch("http://127.0.0.1/api/data").body("second body").post().json();

    expect(apiHandler).not.toHaveBeenNthRequestedWithBody(2, "first body");
    expect(apiHandler).not.toHaveBeenNthRequestedWithBody(1, "second body");
  });

  it("should work with not matcher for wrong body", async () => {
    await wretch("http://127.0.0.1/api/data").body("actual body").post().json();

    expect(apiHandler).not.toHaveBeenNthRequestedWithBody(1, "wrong body");
  });

  it("should handle multiple handlers independently", async () => {
    await wretch("http://127.0.0.1/api/data").body("api data").post().json();
    await wretch("http://127.0.0.1/forms/submit")
      .body("form data")
      .post()
      .json();
    await wretch("http://127.0.0.1/upload").body("upload data").put().json();

    expect(apiHandler).toHaveBeenNthRequestedWithBody(1, "api data");
    expect(formsHandler).toHaveBeenNthRequestedWithBody(1, "form data");
    expect(uploadHandler).toHaveBeenNthRequestedWithBody(1, "upload data");
  });

  it("should handle requests with same body on different calls", async () => {
    const sameBody = "duplicate content";
    const differentBody = "different content";

    await wretch("http://127.0.0.1/api/data").body(sameBody).post().json();
    await wretch("http://127.0.0.1/api/data").body(differentBody).post().json();
    await wretch("http://127.0.0.1/api/data").body(sameBody).post().json();

    expect(apiHandler).toHaveBeenNthRequestedWithBody(1, sameBody);
    expect(apiHandler).toHaveBeenNthRequestedWithBody(3, sameBody);
    expect(apiHandler).toHaveBeenNthRequestedWithBody(2, differentBody);
  });

  it("should handle large text bodies", async () => {
    const firstBody = "short";
    const secondBody =
      "A".repeat(1000) + " with some text in between " + "B".repeat(1000);

    await wretch("http://127.0.0.1/upload").body(firstBody).put().json();
    await wretch("http://127.0.0.1/upload").body(secondBody).put().json();

    expect(uploadHandler).toHaveBeenNthRequestedWithBody(2, secondBody);
  });
});
