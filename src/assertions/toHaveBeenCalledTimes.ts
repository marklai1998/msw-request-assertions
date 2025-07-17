import { HttpHandler } from "msw";
import type { assertFn } from "../types/index.js";

export const toHaveBeenCalledTimes: assertFn = function (
  received,
  expectedTimes,
) {
  if (!(received instanceof HttpHandler)) {
    throw new Error("Expected a HttpHandler");
  }
  if (!received.calledAssertion) {
    throw new Error("HttpHandler is not intercepted");
  }

  const calls = received.calledAssertion.mock.calls;
  const actualTimes = calls.length;

  const { isNot } = this;
  return {
    pass: actualTimes === expectedTimes,
    message: () =>
      `Expected ${received.calledAssertion.getMockName()} to${isNot ? " not" : ""} have been called ${expectedTimes} times, but it was called ${actualTimes} times`,
  };
};
