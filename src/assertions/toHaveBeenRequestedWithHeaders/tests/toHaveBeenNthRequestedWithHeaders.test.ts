import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import wretch from 'wretch';
import '../../../vitest';

const apiHandler = http.post('http://127.0.0.1/api/data', () => {
  return HttpResponse.json({
    success: true,
  });
});

const authHandler = http.get('http://127.0.0.1/protected', () => {
  return HttpResponse.json({
    data: 'protected content',
  });
});

const webhookHandler = http.post('http://127.0.0.1/webhooks/process', () => {
  return HttpResponse.json({
    processed: true,
  });
});

const restHandlers = [apiHandler, authHandler, webhookHandler];
const server = setupServer(...restHandlers);

describe('toHaveBeenNthRequestedWithHeaders', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  afterAll(() => server.close());

  afterEach(() => server.resetHandlers());

  it('should match 1st request with headers', async () => {
    const firstHeaders = { Authorization: 'Bearer token1' };
    const secondHeaders = { Authorization: 'Bearer token2' };

    await wretch('http://127.0.0.1/protected')
      .headers(firstHeaders)
      .get()
      .json();
    await wretch('http://127.0.0.1/protected')
      .headers(secondHeaders)
      .get()
      .json();

    expect(authHandler).toHaveBeenNthRequestedWithHeaders(1, {
      authorization: 'Bearer token1',
    });
  });

  it('should match 2nd request with headers', async () => {
    const firstHeaders = { Authorization: 'Bearer token1' };
    const secondHeaders = { Authorization: 'Bearer token2' };

    await wretch('http://127.0.0.1/protected')
      .headers(firstHeaders)
      .get()
      .json();
    await wretch('http://127.0.0.1/protected')
      .headers(secondHeaders)
      .get()
      .json();

    expect(authHandler).toHaveBeenNthRequestedWithHeaders(2, {
      authorization: 'Bearer token2',
    });
  });

  it('should match 3rd request with headers', async () => {
    const basicHeaders = { 'Content-Type': 'application/json' };
    const authHeaders = { Authorization: 'Bearer token123' };
    const customHeaders = {
      'X-API-Key': 'secret123',
      'X-Client-Version': '1.0.0',
    };

    await wretch('http://127.0.0.1/api/data')
      .headers(basicHeaders)
      .post({ data: 'first' })
      .json();
    await wretch('http://127.0.0.1/api/data')
      .headers(authHeaders)
      .post({ data: 'second' })
      .json();
    await wretch('http://127.0.0.1/api/data')
      .headers(customHeaders)
      .post({ data: 'third' })
      .json();

    expect(apiHandler).toHaveBeenNthRequestedWithHeaders(3, {
      'content-type': 'application/json',
      'x-api-key': 'secret123',
      'x-client-version': '1.0.0',
    });
  });

  it('should match nth request with multiple headers', async () => {
    const simpleHeaders = { 'Content-Type': 'text/plain' };
    const complexHeaders = {
      Authorization: 'Bearer token123',
      'Content-Type': 'application/json',
      'X-Client-Version': '1.0.0',
      'X-Request-ID': 'req-12345',
    };

    await wretch('http://127.0.0.1/api/data')
      .headers(simpleHeaders)
      .post({ data: 'simple' })
      .json();
    await wretch('http://127.0.0.1/api/data')
      .headers(complexHeaders)
      .post({ data: 'complex' })
      .json();

    expect(apiHandler).toHaveBeenNthRequestedWithHeaders(2, {
      authorization: 'Bearer token123',
      'content-type': 'application/json',
      'x-client-version': '1.0.0',
      'x-request-id': 'req-12345',
    });
  });

  it('should match nth request with case-insensitive headers', async () => {
    const mixedCaseHeaders = {
      'Content-Type': 'application/json',
      Authorization: 'Bearer token456',
      'X-Custom-Header': 'custom-value',
    };

    await wretch('http://127.0.0.1/protected')
      .headers({ 'User-Agent': 'test-agent' })
      .get()
      .json();
    await wretch('http://127.0.0.1/protected')
      .headers(mixedCaseHeaders)
      .get()
      .json();

    expect(authHandler).toHaveBeenNthRequestedWithHeaders(2, {
      'content-type': 'application/json',
      authorization: 'Bearer token456',
      'x-custom-header': 'custom-value',
    });
  });

  it('should match nth request with empty headers', async () => {
    const customHeaders = { 'X-Custom': 'value' };

    await wretch('http://127.0.0.1/webhooks/process')
      .post({ event: 'test' })
      .json();
    await wretch('http://127.0.0.1/webhooks/process')
      .headers(customHeaders)
      .post({ event: 'test2' })
      .json();

    // First request should have default headers (content-type from JSON)
    expect(webhookHandler).toHaveBeenNthRequestedWithHeaders(2, {
      'content-type': 'application/json',
      'x-custom': 'value',
    });
  });

  it('should match nth request with webhook headers', async () => {
    const firstHeaders = { 'X-Webhook-Secret': 'secret1' };
    const secondHeaders = {
      'X-Webhook-Secret': 'secret2',
      'X-Webhook-Timestamp': '1640995200',
      'X-Webhook-Signature': 'sha256=signature',
    };

    await wretch('http://127.0.0.1/webhooks/process')
      .headers(firstHeaders)
      .post({ event: 'webhook1' })
      .json();
    await wretch('http://127.0.0.1/webhooks/process')
      .headers(secondHeaders)
      .post({ event: 'webhook2' })
      .json();

    expect(webhookHandler).toHaveBeenNthRequestedWithHeaders(2, {
      'content-type': 'application/json',
      'x-webhook-secret': 'secret2',
      'x-webhook-timestamp': '1640995200',
      'x-webhook-signature': 'sha256=signature',
    });
  });

  it("should fail when nth request headers don't match", async () => {
    const firstHeaders = { Authorization: 'Bearer token1' };
    const secondHeaders = { Authorization: 'Bearer token2' };

    await wretch('http://127.0.0.1/protected')
      .headers(firstHeaders)
      .get()
      .json();
    await wretch('http://127.0.0.1/protected')
      .headers(secondHeaders)
      .get()
      .json();

    expect(() => {
      expect(authHandler).toHaveBeenNthRequestedWithHeaders(2, {
        authorization: 'Bearer wrong-token',
      });
    }).toThrow();
  });

  it("should fail when requesting nth call that doesn't exist", async () => {
    const headers = { Authorization: 'Bearer token123' };

    await wretch('http://127.0.0.1/protected').headers(headers).get().json();

    expect(() => {
      expect(authHandler).toHaveBeenNthRequestedWithHeaders(2, {
        authorization: 'Bearer token123',
      });
    }).toThrow();
  });

  it('should work with not matcher for correct nth call', async () => {
    const firstHeaders = { Authorization: 'Bearer token1' };
    const secondHeaders = { Authorization: 'Bearer token2' };

    await wretch('http://127.0.0.1/protected')
      .headers(firstHeaders)
      .get()
      .json();
    await wretch('http://127.0.0.1/protected')
      .headers(secondHeaders)
      .get()
      .json();

    expect(authHandler).not.toHaveBeenNthRequestedWithHeaders(2, {
      authorization: 'Bearer token1',
    });
    expect(authHandler).not.toHaveBeenNthRequestedWithHeaders(1, {
      authorization: 'Bearer token2',
    });
  });

  it('should work with not matcher for wrong headers', async () => {
    const actualHeaders = { Authorization: 'Bearer actual-token' };

    await wretch('http://127.0.0.1/protected')
      .headers(actualHeaders)
      .get()
      .json();

    expect(authHandler).not.toHaveBeenNthRequestedWithHeaders(1, {
      authorization: 'Bearer wrong-token',
    });
  });

  it('should handle multiple handlers independently', async () => {
    const apiHeaders = { 'X-API-Key': 'api-key-123' };
    const authHeaders = { Authorization: 'Bearer auth-token' };
    const webhookHeaders = { 'X-Webhook-Secret': 'webhook-secret' };

    await wretch('http://127.0.0.1/api/data')
      .headers(apiHeaders)
      .post({ data: 'api' })
      .json();
    await wretch('http://127.0.0.1/protected')
      .headers(authHeaders)
      .get()
      .json();
    await wretch('http://127.0.0.1/webhooks/process')
      .headers(webhookHeaders)
      .post({ event: 'webhook' })
      .json();

    expect(apiHandler).toHaveBeenNthRequestedWithHeaders(1, {
      'content-type': 'application/json',
      'x-api-key': 'api-key-123',
    });
    expect(authHandler).toHaveBeenNthRequestedWithHeaders(1, {
      authorization: 'Bearer auth-token',
    });
    expect(webhookHandler).toHaveBeenNthRequestedWithHeaders(1, {
      'content-type': 'application/json',
      'x-webhook-secret': 'webhook-secret',
    });
  });

  it('should handle requests with same headers on different calls', async () => {
    const sameHeaders = { Authorization: 'Bearer duplicate-token' };
    const differentHeaders = { Authorization: 'Bearer different-token' };

    await wretch('http://127.0.0.1/protected')
      .headers(sameHeaders)
      .get()
      .json();
    await wretch('http://127.0.0.1/protected')
      .headers(differentHeaders)
      .get()
      .json();
    await wretch('http://127.0.0.1/protected')
      .headers(sameHeaders)
      .get()
      .json();

    expect(authHandler).toHaveBeenNthRequestedWithHeaders(1, {
      authorization: 'Bearer duplicate-token',
    });
    expect(authHandler).toHaveBeenNthRequestedWithHeaders(3, {
      authorization: 'Bearer duplicate-token',
    });
    expect(authHandler).toHaveBeenNthRequestedWithHeaders(2, {
      authorization: 'Bearer different-token',
    });
  });

  it('should handle partial header matching', async () => {
    const basicHeaders = { 'Content-Type': 'application/json' };
    const fullHeaders = {
      'Content-Type': 'application/json',
      Authorization: 'Bearer token123',
      'X-Client-Version': '1.0.0',
    };

    await wretch('http://127.0.0.1/api/data')
      .headers(basicHeaders)
      .post({ data: 'basic' })
      .json();
    await wretch('http://127.0.0.1/api/data')
      .headers(fullHeaders)
      .post({ data: 'full' })
      .json();

    // Test partial matching - only check specific headers we care about
    expect(apiHandler).toHaveBeenNthRequestedWithHeaders(2, {
      authorization: 'Bearer token123',
      'content-type': 'application/json',
      'x-client-version': '1.0.0',
    });
  });
});
