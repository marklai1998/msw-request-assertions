import { http } from "msw";
import { expect } from "vitest";
import { toHaveBeenRequested } from "../assertions/toHaveBeenRequested/toHaveBeenRequested";
import { toHaveBeenRequestedTimes } from "../assertions/toHaveBeenRequestedTimes/toHaveBeenRequestedTimes";
import { toHaveBeenNthRequestedWith } from "../assertions/toHaveBeenRequestedWith/toHaveBeenNthRequestedWith";
import { toHaveBeenRequestedWith } from "../assertions/toHaveBeenRequestedWith/toHaveBeenRequestedWith";
import { toHaveBeenNthRequestedWithBody } from "../assertions/toHaveBeenRequestedWithBody/toHaveBeenNthRequestedWithBody";
import { toHaveBeenRequestedWithBody } from "../assertions/toHaveBeenRequestedWithBody/toHaveBeenRequestedWithBody";
import { toHaveBeenNthRequestedWithHash } from "../assertions/toHaveBeenRequestedWithHash/toHaveBeenNthRequestedWithHash";
import { toHaveBeenRequestedWithHash } from "../assertions/toHaveBeenRequestedWithHash/toHaveBeenRequestedWithHash";
import { toHaveBeenNthRequestedWithHeaders } from "../assertions/toHaveBeenRequestedWithHeaders/toHaveBeenNthRequestedWithHeaders";
import { toHaveBeenRequestedWithHeaders } from "../assertions/toHaveBeenRequestedWithHeaders/toHaveBeenRequestedWithHeaders";
import { toHaveBeenNthRequestedWithJsonBody } from "../assertions/toHaveBeenRequestedWithJsonBody/toHaveBeenNthRequestedWithJsonBody";
import { toHaveBeenRequestedWithJsonBody } from "../assertions/toHaveBeenRequestedWithJsonBody/toHaveBeenRequestedWithJsonBody";
import { toHaveBeenNthRequestedWithQuery } from "../assertions/toHaveBeenRequestedWithQuery/toHaveBeenNthRequestedWithQuery.js";
import { toHaveBeenRequestedWithQuery } from "../assertions/toHaveBeenRequestedWithQuery/toHaveBeenRequestedWithQuery.js";

const httpAssertions = [
  toHaveBeenRequested,
  toHaveBeenRequestedTimes,
  toHaveBeenRequestedWith,
  toHaveBeenNthRequestedWith,
  toHaveBeenRequestedWithBody,
  toHaveBeenNthRequestedWithBody,
  toHaveBeenRequestedWithJsonBody,
  toHaveBeenNthRequestedWithJsonBody,
  toHaveBeenRequestedWithHeaders,
  toHaveBeenNthRequestedWithHeaders,
  toHaveBeenNthRequestedWithQuery,
  toHaveBeenRequestedWithQuery,
  toHaveBeenRequestedWithHash,
  toHaveBeenNthRequestedWithHash,
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
