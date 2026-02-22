import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import wretch from 'wretch';
import '../../../vitest';

const usersHandler = http.get('http://127.0.0.1/users', () => {
  return HttpResponse.json([{ id: 1, name: 'John Doe' }]);
});

const apiHandler = http.post('http://127.0.0.1/api/data', () => {
  return HttpResponse.json({
    success: true,
  });
});

const restHandlers = [usersHandler, apiHandler];
const server = setupServer(...restHandlers);

describe('toHaveBeenRequestedTimes', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  afterAll(() => server.close());

  afterEach(() => server.resetHandlers());

  it('should pass when handler has been called exact number of times', async () => {
    await wretch('http://127.0.0.1/users').get().json();
    await wretch('http://127.0.0.1/users').get().json();
    await wretch('http://127.0.0.1/users').get().json();

    expect(usersHandler).toHaveBeenRequestedTimes(3);
  });

  it('should pass when handler has been called once', async () => {
    await wretch('http://127.0.0.1/users').get().json();

    expect(usersHandler).toHaveBeenRequestedTimes(1);
  });

  it('should pass when handler has not been called', async () => {
    // Don't make any requests
    expect(usersHandler).toHaveBeenRequestedTimes(0);
  });

  it("should fail when call count doesn't match", async () => {
    await wretch('http://127.0.0.1/users').get().json();

    expect(() => {
      expect(usersHandler).toHaveBeenRequestedTimes(2);
    }).toThrow();
  });

  it('should work with not matcher', async () => {
    await wretch('http://127.0.0.1/users').get().json();
    await wretch('http://127.0.0.1/users').get().json();

    expect(usersHandler).not.toHaveBeenRequestedTimes(1);
    expect(usersHandler).not.toHaveBeenRequestedTimes(3);
  });
});
