import { http } from "msw";
import { expect, type Mock } from "vitest";
import {
  initToHaveBeenRequested,
  toHaveBeenRequested,
} from "../assertions/toHaveBeenRequested.js";
import { toHaveBeenRequestedTimes } from "../assertions/toHaveBeenRequestedTimes.js";
import { toHaveBeenRequestedWith } from "../assertions/toHaveBeenRequestedWith.js";
import {
  initToHaveBeenRequestedWithBody,
  toHaveBeenRequestedWithBody,
} from "../assertions/toHaveBeenRequestedWithBody.js";
import {
  initToHaveBeenRequestedWithHash,
  toHaveBeenRequestedWithHash,
} from "../assertions/toHaveBeenRequestedWithHash.js";
import {
  initToHaveBeenRequestedWithHeader,
  toHaveBeenRequestedWithHeaders,
} from "../assertions/toHaveBeenRequestedWithHeaders.js";
import {
  initToHaveBeenRequestedWithJsonBody,
  toHaveBeenRequestedWithJsonBody,
} from "../assertions/toHaveBeenRequestedWithJsonBody.js";
import {
  initToHaveBeenRequestedWithQuery,
  toHaveBeenRequestedWithQuery,
} from "../assertions/toHaveBeenRequestedWithQuery.js";

declare module "msw" {
  interface HttpHandler {
    assertions: {
      headersAssertion: Mock;
    };
  }
}

for (const key in http) {
  const original = http[key as keyof typeof http];
  http[key as keyof typeof http] = [
    initToHaveBeenRequested,
    initToHaveBeenRequestedWithBody,
    initToHaveBeenRequestedWithJsonBody,
    initToHaveBeenRequestedWithHeader,
    initToHaveBeenRequestedWithQuery,
    initToHaveBeenRequestedWithHash,
  ].reduce((fn, init) => init(fn), original);
}

expect.extend({
  toHaveBeenRequested,
  toHaveBeenRequestedTimes,
  toHaveBeenRequestedWithBody,
  toHaveBeenRequestedWithJsonBody,
  toHaveBeenRequestedWithHeaders,
  toHaveBeenRequestedWithQuery,
  toHaveBeenRequestedWith,
  toHaveBeenRequestedWithHash,
});
