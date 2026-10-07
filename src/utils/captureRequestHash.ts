import { AsyncLocalStorage } from 'node:async_hooks';

const hashStore = new AsyncLocalStorage<string>();

const wrappedFlag = Symbol.for('msw-request-assertions.fetch-hash');

type WrappedFetch = typeof fetch & {
  [wrappedFlag]: true;
  inner: typeof fetch;
};

function readHash(input: RequestInfo | URL): string {
  try {
    const href =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.href
          : input.url;
    return new URL(href).hash;
  } catch {
    return '';
  }
}

/**
 * MSW 3 observes the network request, which does not include the URL fragment.
 * Remember the fragment from the `fetch` input so hash assertions can still read it.
 */
export function installRequestHashCapture(): void {
  const current = globalThis.fetch;
  if (typeof current !== 'function') return;
  if (wrappedFlag in current) return;

  const wrapped = function wrappedFetch(
    input: RequestInfo | URL,
    init?: RequestInit,
  ) {
    const hash = readHash(input);
    return hashStore.run(hash, () =>
      wrapped.inner.call(globalThis, input, init),
    );
  } as WrappedFetch;

  wrapped[wrappedFlag] = true;
  wrapped.inner = current;

  Object.defineProperty(globalThis, 'fetch', {
    configurable: true,
    enumerable: true,
    get() {
      return wrapped;
    },
    set(next: typeof fetch) {
      wrapped.inner = next;
    },
  });
}

export function getCapturedRequestHash(): string {
  return hashStore.getStore() ?? '';
}
