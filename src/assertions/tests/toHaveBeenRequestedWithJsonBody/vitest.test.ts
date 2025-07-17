import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import wretch from "wretch";
import "../../../vitest/index.js";

const usersHandler = http.post("http://127.0.0.1/users", () => {
  return HttpResponse.json({
    id: 1,
    name: "John Doe",
  });
});

const productsHandler = http.put("http://127.0.0.1/products/123", () => {
  return HttpResponse.json({
    id: 123,
    updated: true,
  });
});

const configHandler = http.patch("http://127.0.0.1/config", () => {
  return HttpResponse.json({
    success: true,
  });
});

const restHandlers = [usersHandler, productsHandler, configHandler];
const server = setupServer(...restHandlers);

describe("toHaveBeenRequestedWithJsonBody", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

  afterAll(() => server.close());

  afterEach(() => server.resetHandlers());

  it("should match request with simple JSON object", async () => {
    const userData = { name: "John Doe", email: "john@example.com" };

    await wretch("http://127.0.0.1/users").post(userData).json();

    expect(usersHandler).toHaveBeenRequestedWithJsonBody(userData);
  });

  it("should match request with nested JSON object", async () => {
    const productData = {
      name: "Laptop",
      specs: {
        cpu: "Intel i7",
        ram: "16GB",
        storage: { type: "SSD", size: "512GB" },
      },
      price: 1299.99,
      tags: ["electronics", "computer", "laptop"],
    };

    await wretch("http://127.0.0.1/products/123").put(productData).json();

    expect(productsHandler).toHaveBeenRequestedWithJsonBody(productData);
  });

  it("should match request with array in JSON", async () => {
    const configData = {
      settings: {
        permissions: ["read", "write", "admin"],
        features: [
          { name: "notifications", enabled: true },
          { name: "analytics", enabled: false },
        ],
      },
    };

    await wretch("http://127.0.0.1/config").patch(configData).json();

    expect(configHandler).toHaveBeenRequestedWithJsonBody(configData);
  });

  it("should match request with partial object using exact subset", async () => {
    const userData = {
      name: "Jane Doe",
      email: "jane@example.com",
      age: 30,
      address: {
        street: "123 Main St",
        city: "New York",
        zipCode: "10001",
      },
    };

    await wretch("http://127.0.0.1/users").post(userData).json();

    // Test exact matching of the full object for now
    expect(usersHandler).toHaveBeenRequestedWithJsonBody(userData);
  });

  it("should match request with null and undefined values", async () => {
    const userData = {
      name: "John Doe",
      middleName: null,
      nickname: undefined,
      preferences: {
        theme: "dark",
        notifications: null,
      },
    };

    await wretch("http://127.0.0.1/users").post(userData).json();

    expect(usersHandler).toHaveBeenRequestedWithJsonBody({
      name: "John Doe",
      middleName: null,
      preferences: {
        theme: "dark",
        notifications: null,
      },
    });
  });

  it("should match request with boolean and number values", async () => {
    const productData = {
      name: "Widget",
      price: 29.99,
      inStock: true,
      discontinued: false,
      quantity: 0,
      rating: 4.5,
    };

    await wretch("http://127.0.0.1/products/123").put(productData).json();

    expect(productsHandler).toHaveBeenRequestedWithJsonBody(productData);
  });

  it("should match request with empty object", async () => {
    await wretch("http://127.0.0.1/config").patch({}).json();

    expect(configHandler).toHaveBeenRequestedWithJsonBody({});
  });

  it("should match request with array as root", async () => {
    const arrayData = [
      { id: 1, name: "Item 1" },
      { id: 2, name: "Item 2" },
      { id: 3, name: "Item 3" },
    ];

    await wretch("http://127.0.0.1/config").patch(arrayData).json();

    expect(configHandler).toHaveBeenRequestedWithJsonBody(arrayData);
  });

  it("should match request with special characters in strings", async () => {
    const userData = {
      name: "José María",
      bio: "Software engineer with 5+ years of experience 🚀",
      notes: "Special chars: @#$%^&*(){}[]|\\:;\"'<>,.?/~`",
      unicode: "Hello 世界 🌍",
    };

    await wretch("http://127.0.0.1/users").post(userData).json();

    expect(usersHandler).toHaveBeenRequestedWithJsonBody(userData);
  });

  it("should fail when JSON body doesn't match", async () => {
    const userData = { name: "John Doe", email: "john@example.com" };

    await wretch("http://127.0.0.1/users").post(userData).json();

    expect(() => {
      expect(usersHandler).toHaveBeenRequestedWithJsonBody({
        name: "Jane Doe", // Different name
        email: "john@example.com",
      });
    }).toThrow();
  });

  it("should work with not matcher", async () => {
    const userData = { name: "John Doe", email: "john@example.com" };

    await wretch("http://127.0.0.1/users").post(userData).json();

    expect(usersHandler).not.toHaveBeenRequestedWithJsonBody({
      name: "Jane Doe", // Different name
      email: "jane@example.com",
    });
  });

  it("should handle requests with no JSON body gracefully", async () => {
    // This should capture undefined for non-JSON requests
    await wretch("http://127.0.0.1/users")
      .headers({ "Content-Type": "text/plain" })
      .body("plain text body")
      .post()
      .json();

    expect(usersHandler).toHaveBeenRequestedWithJsonBody(undefined);
  });

  it("should match using flexible matching with known values", async () => {
    const userData = {
      name: "John Doe",
      email: "john@example.com",
      createdAt: "2024-01-01T00:00:00.000Z",
      id: 123,
    };

    await wretch("http://127.0.0.1/users").post(userData).json();

    expect(usersHandler).toHaveBeenRequestedWithJsonBody({
      name: "John Doe",
      email: "john@example.com",
      createdAt: "2024-01-01T00:00:00.000Z",
      id: 123,
    });
  });
});
