import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import wretch from 'wretch';
import '../../../vitest';

const usersHandler = http.post('http://127.0.0.1/users', () => {
  return HttpResponse.json({
    id: 1,
    name: 'John Doe',
  });
});

const productsHandler = http.put('http://127.0.0.1/products/123', () => {
  return HttpResponse.json({
    id: 123,
    updated: true,
  });
});

const configHandler = http.patch('http://127.0.0.1/config', () => {
  return HttpResponse.json({
    success: true,
  });
});

const restHandlers = [usersHandler, productsHandler, configHandler];
const server = setupServer(...restHandlers);

describe('toHaveBeenNthRequestedWithJsonBody', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  afterAll(() => server.close());

  afterEach(() => server.resetHandlers());

  it('should match 1st request with JSON body', async () => {
    const firstData = { name: 'John', email: 'john@example.com' };
    const secondData = { name: 'Jane', email: 'jane@example.com' };

    await wretch('http://127.0.0.1/users').post(firstData).json();
    await wretch('http://127.0.0.1/users').post(secondData).json();

    expect(usersHandler).toHaveBeenNthRequestedWithJsonBody(1, firstData);
  });

  it('should match 2nd request with JSON body', async () => {
    const firstData = { name: 'John', email: 'john@example.com' };
    const secondData = { name: 'Jane', email: 'jane@example.com' };

    await wretch('http://127.0.0.1/users').post(firstData).json();
    await wretch('http://127.0.0.1/users').post(secondData).json();

    expect(usersHandler).toHaveBeenNthRequestedWithJsonBody(2, secondData);
  });

  it('should match 3rd request with JSON body', async () => {
    const firstData = { name: 'John' };
    const secondData = { name: 'Jane' };
    const thirdData = { name: 'Bob', age: 30 };

    await wretch('http://127.0.0.1/users').post(firstData).json();
    await wretch('http://127.0.0.1/users').post(secondData).json();
    await wretch('http://127.0.0.1/users').post(thirdData).json();

    expect(usersHandler).toHaveBeenNthRequestedWithJsonBody(3, thirdData);
  });

  it('should match nth request with nested JSON object', async () => {
    const simpleData = { name: 'John' };
    const complexData = {
      name: 'Laptop',
      specs: {
        cpu: 'Intel i7',
        ram: '16GB',
        storage: { type: 'SSD', size: '512GB' },
      },
      price: 1299.99,
      tags: ['electronics', 'computer'],
    };

    await wretch('http://127.0.0.1/products/123').put(simpleData).json();
    await wretch('http://127.0.0.1/products/123').put(complexData).json();

    expect(productsHandler).toHaveBeenNthRequestedWithJsonBody(2, complexData);
  });

  it('should match nth request with array JSON', async () => {
    const firstData = { settings: ['basic'] };
    const arrayData = [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
      { id: 3, name: 'Item 3' },
    ];

    await wretch('http://127.0.0.1/config').patch(firstData).json();
    await wretch('http://127.0.0.1/config').patch(arrayData).json();

    expect(configHandler).toHaveBeenNthRequestedWithJsonBody(2, arrayData);
  });

  it('should match nth request with special values', async () => {
    const firstData = { name: 'simple' };
    const specialData = {
      name: 'John Doe',
      middleName: null,
      preferences: {
        theme: 'dark',
        notifications: null,
      },
      active: true,
      score: 0,
      rating: 4.5,
    };

    await wretch('http://127.0.0.1/users').post(firstData).json();
    await wretch('http://127.0.0.1/users').post(specialData).json();

    expect(usersHandler).toHaveBeenNthRequestedWithJsonBody(2, specialData);
  });

  it('should match nth request with empty object', async () => {
    const firstData = { name: 'test' };
    const emptyData = {};

    await wretch('http://127.0.0.1/config').patch(firstData).json();
    await wretch('http://127.0.0.1/config').patch(emptyData).json();

    expect(configHandler).toHaveBeenNthRequestedWithJsonBody(2, emptyData);
  });

  it('should match nth request with special characters', async () => {
    const firstData = { name: 'basic' };
    const unicodeData = {
      name: 'José María',
      bio: 'Software engineer with 5+ years 🚀',
      unicode: 'Hello 世界 🌍',
    };

    await wretch('http://127.0.0.1/users').post(firstData).json();
    await wretch('http://127.0.0.1/users').post(unicodeData).json();

    expect(usersHandler).toHaveBeenNthRequestedWithJsonBody(2, unicodeData);
  });

  it("should fail when nth request JSON body doesn't match", async () => {
    const firstData = { name: 'John' };
    const secondData = { name: 'Jane' };

    await wretch('http://127.0.0.1/users').post(firstData).json();
    await wretch('http://127.0.0.1/users').post(secondData).json();

    expect(() => {
      expect(usersHandler).toHaveBeenNthRequestedWithJsonBody(2, {
        name: 'Bob',
      });
    }).toThrow();
  });

  it("should fail when requesting nth call that doesn't exist", async () => {
    const onlyData = { name: 'Only request' };

    await wretch('http://127.0.0.1/users').post(onlyData).json();

    expect(() => {
      expect(usersHandler).toHaveBeenNthRequestedWithJsonBody(2, {
        name: 'Second',
      });
    }).toThrow();
  });

  it('should work with not matcher for correct nth call', async () => {
    const firstData = { name: 'John' };
    const secondData = { name: 'Jane' };

    await wretch('http://127.0.0.1/users').post(firstData).json();
    await wretch('http://127.0.0.1/users').post(secondData).json();

    expect(usersHandler).not.toHaveBeenNthRequestedWithJsonBody(2, firstData);
    expect(usersHandler).not.toHaveBeenNthRequestedWithJsonBody(1, secondData);
  });

  it('should work with not matcher for wrong data', async () => {
    const actualData = { name: 'Actual' };

    await wretch('http://127.0.0.1/users').post(actualData).json();

    expect(usersHandler).not.toHaveBeenNthRequestedWithJsonBody(1, {
      name: 'Wrong',
    });
  });

  it('should handle multiple handlers independently', async () => {
    const userData = { name: 'User Data' };
    const productData = { name: 'Product Data' };
    const configData = { setting: 'Config Data' };

    await wretch('http://127.0.0.1/users').post(userData).json();
    await wretch('http://127.0.0.1/products/123').put(productData).json();
    await wretch('http://127.0.0.1/config').patch(configData).json();

    expect(usersHandler).toHaveBeenNthRequestedWithJsonBody(1, userData);
    expect(productsHandler).toHaveBeenNthRequestedWithJsonBody(1, productData);
    expect(configHandler).toHaveBeenNthRequestedWithJsonBody(1, configData);
  });

  it('should handle requests with same JSON body on different calls', async () => {
    const sameData = { name: 'Duplicate', type: 'test' };
    const differentData = { name: 'Different', type: 'other' };

    await wretch('http://127.0.0.1/users').post(sameData).json();
    await wretch('http://127.0.0.1/users').post(differentData).json();
    await wretch('http://127.0.0.1/users').post(sameData).json();

    expect(usersHandler).toHaveBeenNthRequestedWithJsonBody(1, sameData);
    expect(usersHandler).toHaveBeenNthRequestedWithJsonBody(3, sameData);
    expect(usersHandler).toHaveBeenNthRequestedWithJsonBody(2, differentData);
  });

  it('should handle non-JSON requests gracefully', async () => {
    const jsonData = { name: 'JSON Data' };

    await wretch('http://127.0.0.1/users')
      .headers({ 'Content-Type': 'text/plain' })
      .body('plain text body')
      .post()
      .json();
    await wretch('http://127.0.0.1/users').post(jsonData).json();

    expect(usersHandler).toHaveBeenNthRequestedWithJsonBody(1, undefined);
    expect(usersHandler).toHaveBeenNthRequestedWithJsonBody(2, jsonData);
  });
});
