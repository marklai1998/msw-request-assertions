import { http } from "msw";
import { expect } from "vitest";
import { toHaveBeenRequested } from "../assertions/toHaveBeenRequested.js";
import { toHaveBeenRequestedTimes } from "../assertions/toHaveBeenRequestedTimes.js";
import { toHaveBeenRequestedWith } from "../assertions/toHaveBeenRequestedWith.js";
import { toHaveBeenRequestedWithBody } from "../assertions/toHaveBeenRequestedWithBody.js";
import { toHaveBeenRequestedWithHash } from "../assertions/toHaveBeenRequestedWithHash.js";
import { toHaveBeenRequestedWithHeaders } from "../assertions/toHaveBeenRequestedWithHeaders.js";
import { toHaveBeenNthRequestedWithJsonBody } from "../assertions/toHaveBeenRequestedWithJsonBody/toHaveBeenNthRequestedWithJsonBody";
import { toHaveBeenRequestedWithJsonBody } from "../assertions/toHaveBeenRequestedWithJsonBody/toHaveBeenRequestedWithJsonBody";
import { toHaveBeenNthRequestedWithQuery } from "../assertions/toHaveBeenRequestedWithQuery/toHaveBeenNthRequestedWithQuery";
import { toHaveBeenRequestedWithQuery } from "../assertions/toHaveBeenRequestedWithQuery/toHaveBeenRequestedWithQuery";

const httpAssertions = [
  toHaveBeenRequested,
  toHaveBeenRequestedTimes,
  toHaveBeenRequestedWith,
  toHaveBeenRequestedWithBody,
  toHaveBeenRequestedWithJsonBody,
  toHaveBeenNthRequestedWithJsonBody,
  toHaveBeenRequestedWithHeaders,
  toHaveBeenNthRequestedWithQuery,
  toHaveBeenRequestedWithQuery,
  toHaveBeenRequestedWithHash,
];

for (const key in http) {
  const original = http[key as keyof typeof http];
  http[key as keyof typeof http] = httpAssertions.reduce(
    (fn, { intercept }) => intercept(fn),
    original,
  );
}

expect.extend(
  httpAssertions.reduce(
    (acc, { name, assert }) => ({ ...acc, [name]: assert }),
    {},
  ),
);
