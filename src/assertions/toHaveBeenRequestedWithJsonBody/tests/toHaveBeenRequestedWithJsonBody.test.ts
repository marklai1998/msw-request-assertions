import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import wretch from 'wretch';
import '../../../vitest';

const usersHandler = http.post('http://127.0.0.1/users', () => {
  return HttpResponse.json({ id: 1, name: 'John Doe' });
});

const server = setupServer(usersHandler);

describe('toHaveBeenRequestedWithJsonBody', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  it('should match request with simple JSON object', async () => {
    const userData = { name: 'John Doe', email: 'john@example.com' };
    await wretch('http://127.0.0.1/users').post(userData).json();

    expect(usersHandler).toHaveBeenRequestedWithJsonBody(userData);
  });

  it('should match request with complex nested JSON', async () => {
    const complexData = {
      user: {
        name: 'Jane Doe',
        preferences: { theme: 'dark', notifications: true },
        roles: ['admin', 'user'],
      },
      metadata: {
        version: 2,
        features: ['feature1', 'feature2'],
        config: { setting1: true, setting2: 42 },
      },
    };

    await wretch('http://127.0.0.1/users').post(complexData).json();

    expect(usersHandler).toHaveBeenRequestedWithJsonBody(complexData);
  });

  it("should fail when JSON body doesn't match", async () => {
    await wretch('http://127.0.0.1/users').post({ name: 'John' }).json();

    expect(() => {
      expect(usersHandler).toHaveBeenRequestedWithJsonBody({ name: 'Jane' });
    }).toThrow();
  });

  it('should work with not matcher', async () => {
    await wretch('http://127.0.0.1/users').post({ name: 'John' }).json();

    expect(usersHandler).not.toHaveBeenRequestedWithJsonBody({ name: 'Jane' });
  });

  it('should handle multiple calls', async () => {
    await wretch('http://127.0.0.1/users').post({ name: 'John' }).json();
    await wretch('http://127.0.0.1/users').post({ name: 'Jane' }).json();

    expect(usersHandler).toHaveBeenRequestedWithJsonBody({ name: 'John' });
    expect(usersHandler).toHaveBeenRequestedWithJsonBody({ name: 'Jane' });
  });
});
