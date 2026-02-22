import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { describe, expect } from 'vitest';
import wretch from 'wretch';

const myHandler = http.post('http://127.0.0.1/foo', () => {
  return HttpResponse.json({
    a: 'b',
  });
});

const restHandlers = [myHandler];

const server = setupServer(...restHandlers);

describe('toHaveBeenRequestedWithBody', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  afterAll(() => server.close());

  afterEach(() => server.resetHandlers());

  it('with hash', async () => {
    await wretch('http://127.0.0.1').url('/foo').post({ a: 'b' }).json();

    expect(myHandler).toHaveBeenRequestedWithBody(JSON.stringify({ a: 'b' }));
  });
});
