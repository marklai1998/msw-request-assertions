import { HttpHandler } from 'msw';

export function checkMockedHttpHandler(
  input: unknown,
): asserts input is HttpHandler {
  if (!(input instanceof HttpHandler)) {
    throw new Error('Expected a HttpHandler');
  }
}
