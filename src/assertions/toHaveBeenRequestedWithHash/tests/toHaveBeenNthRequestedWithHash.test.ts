import { HttpResponse, http } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import wretch from 'wretch';
import '../../../vitest';

const pageHandler = http.get('http://127.0.0.1/page', () => {
  return HttpResponse.json({
    content: 'page content',
  });
});

const docsHandler = http.get('http://127.0.0.1/docs', () => {
  return HttpResponse.json({
    documentation: 'docs content',
  });
});

const apiHandler = http.post('http://127.0.0.1/api/data', () => {
  return HttpResponse.json({
    success: true,
  });
});

const restHandlers = [pageHandler, docsHandler, apiHandler];
const server = setupServer(...restHandlers);

describe('toHaveBeenNthRequestedWithHash', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  afterAll(() => server.close());

  afterEach(() => server.resetHandlers());

  it('should match 1st request with hash', async () => {
    await wretch('http://127.0.0.1/page#section1').get().json();
    await wretch('http://127.0.0.1/page#section2').get().json();

    expect(pageHandler).toHaveBeenNthRequestedWithHash(1, '#section1');
  });

  it('should match 2nd request with hash', async () => {
    await wretch('http://127.0.0.1/page#intro').get().json();
    await wretch('http://127.0.0.1/page#conclusion').get().json();

    expect(pageHandler).toHaveBeenNthRequestedWithHash(2, '#conclusion');
  });

  it('should match 3rd request with hash', async () => {
    await wretch('http://127.0.0.1/page#first').get().json();
    await wretch('http://127.0.0.1/page#second').get().json();
    await wretch('http://127.0.0.1/page#third').get().json();

    expect(pageHandler).toHaveBeenNthRequestedWithHash(3, '#third');
  });

  it('should match nth request with complex hash', async () => {
    await wretch('http://127.0.0.1/docs#simple').get().json();
    await wretch('http://127.0.0.1/docs#section/subsection/details')
      .get()
      .json();

    expect(docsHandler).toHaveBeenNthRequestedWithHash(
      2,
      '#section/subsection/details',
    );
  });

  it('should match nth request with encoded hash', async () => {
    await wretch('http://127.0.0.1/page#basic').get().json();
    await wretch('http://127.0.0.1/page#hello%20world').get().json();

    expect(pageHandler).toHaveBeenNthRequestedWithHash(2, '#hello%20world');
  });

  it('should match nth request with empty hash', async () => {
    await wretch('http://127.0.0.1/page').get().json();
    await wretch('http://127.0.0.1/page#content').get().json();

    expect(pageHandler).toHaveBeenNthRequestedWithHash(1, '');
  });

  it('should match nth request with special characters in hash', async () => {
    await wretch('http://127.0.0.1/docs#basic').get().json();
    await wretch('http://127.0.0.1/docs#section-1_part-a').get().json();
    await wretch('http://127.0.0.1/docs#user@example.com').get().json();

    expect(docsHandler).toHaveBeenNthRequestedWithHash(2, '#section-1_part-a');
    expect(docsHandler).toHaveBeenNthRequestedWithHash(3, '#user@example.com');
  });

  it('should match nth request with hash containing query-like syntax', async () => {
    await wretch('http://127.0.0.1/page#simple').get().json();
    await wretch('http://127.0.0.1/page#state?tab=1&view=grid').get().json();

    expect(pageHandler).toHaveBeenNthRequestedWithHash(
      2,
      '#state?tab=1&view=grid',
    );
  });

  it('should match nth request with hash containing numbers', async () => {
    await wretch('http://127.0.0.1/docs#intro').get().json();
    await wretch('http://127.0.0.1/docs#line-123').get().json();
    await wretch('http://127.0.0.1/docs#version-2.1.0').get().json();

    expect(docsHandler).toHaveBeenNthRequestedWithHash(2, '#line-123');
    expect(docsHandler).toHaveBeenNthRequestedWithHash(3, '#version-2.1.0');
  });

  it('should match nth request with nested navigation hash', async () => {
    await wretch('http://127.0.0.1/page#top').get().json();
    await wretch('http://127.0.0.1/page#nav/menu/item').get().json();

    expect(pageHandler).toHaveBeenNthRequestedWithHash(2, '#nav/menu/item');
  });

  it("should fail when nth request hash doesn't match", async () => {
    await wretch('http://127.0.0.1/page#section1').get().json();
    await wretch('http://127.0.0.1/page#section2').get().json();

    expect(() => {
      expect(pageHandler).toHaveBeenNthRequestedWithHash(2, '#wrong-section');
    }).toThrow();
  });

  it("should fail when requesting nth call that doesn't exist", async () => {
    await wretch('http://127.0.0.1/page#only-request').get().json();

    expect(() => {
      expect(pageHandler).toHaveBeenNthRequestedWithHash(2, '#second-request');
    }).toThrow();
  });

  it('should work with not matcher for correct nth call', async () => {
    await wretch('http://127.0.0.1/page#first').get().json();
    await wretch('http://127.0.0.1/page#second').get().json();

    expect(pageHandler).not.toHaveBeenNthRequestedWithHash(2, '#first');
    expect(pageHandler).not.toHaveBeenNthRequestedWithHash(1, '#second');
  });

  it('should work with not matcher for wrong hash', async () => {
    await wretch('http://127.0.0.1/page#actual').get().json();

    expect(pageHandler).not.toHaveBeenNthRequestedWithHash(1, '#wrong');
  });

  it('should handle multiple handlers independently', async () => {
    await wretch('http://127.0.0.1/page#page-section').get().json();
    await wretch('http://127.0.0.1/docs#docs-section').get().json();
    await wretch('http://127.0.0.1/api/data#api-section')
      .post({ data: 'test' })
      .json();

    expect(pageHandler).toHaveBeenNthRequestedWithHash(1, '#page-section');
    expect(docsHandler).toHaveBeenNthRequestedWithHash(1, '#docs-section');
    expect(apiHandler).toHaveBeenNthRequestedWithHash(1, '#api-section');
  });

  it('should handle requests with same hash on different calls', async () => {
    const sameHash = '#duplicate-section';
    const differentHash = '#different-section';

    await wretch(`http://127.0.0.1/page${sameHash}`).get().json();
    await wretch(`http://127.0.0.1/page${differentHash}`).get().json();
    await wretch(`http://127.0.0.1/page${sameHash}`).get().json();

    expect(pageHandler).toHaveBeenNthRequestedWithHash(1, sameHash);
    expect(pageHandler).toHaveBeenNthRequestedWithHash(3, sameHash);
    expect(pageHandler).toHaveBeenNthRequestedWithHash(2, differentHash);
  });

  it('should handle hash with fragment identifiers', async () => {
    await wretch('http://127.0.0.1/docs#chapter-1').get().json();
    await wretch('http://127.0.0.1/docs#chapter-2.section-3.paragraph-4')
      .get()
      .json();

    expect(docsHandler).toHaveBeenNthRequestedWithHash(
      2,
      '#chapter-2.section-3.paragraph-4',
    );
  });
});
