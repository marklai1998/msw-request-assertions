import { HttpHandler } from "msw";
import type { AssertFn } from "../types/index.js";

export const toHaveBeenRequestedTimes: AssertFn = function (
  received,
  expectedTimes,
) {
  if (!(received instanceof HttpHandler)) {
    throw new Error("Expected a HttpHandler");
  }
  if (!received.requestedAssertion) {
    throw new Error("HttpHandler is not intercepted");
  }

  const calls = received.requestedAssertion.mock.calls;
  const actualTimes = calls.length;

  const { isNot } = this;
  return {
    pass: actualTimes === expectedTimes,
    message: () =>
      `Expected ${received.requestedAssertion.getMockName()} to${isNot ? " not" : ""} have been requested ${expectedTimes} times, but it was requested ${actualTimes} times`,
  };
};
