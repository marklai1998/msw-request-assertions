import { http } from "msw";
import { compose } from "ramda";
import { expect, type Mock } from "vitest";
import {
  initToHaveBeenCalled,
  toHaveBeenCalled,
} from "../assertions/toHaveBeenCalled.js";
import { toHaveBeenCalledTimes } from "../assertions/toHaveBeenCalledTimes.js";
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
  http[key as keyof typeof http] = compose(
    initToHaveBeenCalled,
    initToHaveBeenRequestedWithBody,
    initToHaveBeenRequestedWithJsonBody,
    initToHaveBeenRequestedWithHeader,
    initToHaveBeenRequestedWithQuery,
    initToHaveBeenRequestedWithHash,
  )(original);
}

expect.extend({
  toHaveBeenCalled,
  toHaveBeenCalledTimes,
  toHaveBeenRequestedWithBody,
  toHaveBeenRequestedWithJsonBody,
  toHaveBeenRequestedWithHeaders,
  toHaveBeenRequestedWithQuery,
  toHaveBeenRequestedWith,
  toHaveBeenRequestedWithHash,
});
