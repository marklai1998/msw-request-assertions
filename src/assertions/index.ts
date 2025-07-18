import { toHaveBeenRequested } from "./toHaveBeenRequested/toHaveBeenRequested.js";
import { toHaveBeenRequestedTimes } from "./toHaveBeenRequested/toHaveBeenRequestedTimes.js";
import { toHaveBeenNthRequestedWith } from "./toHaveBeenRequestedWith/toHaveBeenNthRequestedWith.js";
import { toHaveBeenRequestedWith } from "./toHaveBeenRequestedWith/toHaveBeenRequestedWith.js";
import { toHaveBeenNthRequestedWithBody } from "./toHaveBeenRequestedWithBody/toHaveBeenNthRequestedWithBody.js";
import { toHaveBeenRequestedWithBody } from "./toHaveBeenRequestedWithBody/toHaveBeenRequestedWithBody.js";
import { toHaveBeenNthRequestedWithGqlQuery } from "./toHaveBeenRequestedWithGqlQuery/toHaveBeenNthRequestedWithGqlQuery.js";
import { toHaveBeenRequestedWithGqlQuery } from "./toHaveBeenRequestedWithGqlQuery/toHaveBeenRequestedWithGqlQuery.js";
import { toHaveBeenNthRequestedWithGqlVariables } from "./toHaveBeenRequestedWithGqlVariables/toHaveBeenNthRequestedWithGqlVariables.js";
import { toHaveBeenRequestedWithGqlVariables } from "./toHaveBeenRequestedWithGqlVariables/toHaveBeenRequestedWithGqlVariables.js";
import { toHaveBeenNthRequestedWithHash } from "./toHaveBeenRequestedWithHash/toHaveBeenNthRequestedWithHash.js";
import { toHaveBeenRequestedWithHash } from "./toHaveBeenRequestedWithHash/toHaveBeenRequestedWithHash.js";
import { toHaveBeenNthRequestedWithHeaders } from "./toHaveBeenRequestedWithHeaders/toHaveBeenNthRequestedWithHeaders.js";
import { toHaveBeenRequestedWithHeaders } from "./toHaveBeenRequestedWithHeaders/toHaveBeenRequestedWithHeaders.js";
import { toHaveBeenNthRequestedWithJsonBody } from "./toHaveBeenRequestedWithJsonBody/toHaveBeenNthRequestedWithJsonBody.js";
import { toHaveBeenRequestedWithJsonBody } from "./toHaveBeenRequestedWithJsonBody/toHaveBeenRequestedWithJsonBody.js";
import { toHaveBeenNthRequestedWithQueryString } from "./toHaveBeenRequestedWithQueryString/toHaveBeenNthRequestedWithQueryString.js";
import { toHaveBeenRequestedWithQueryString } from "./toHaveBeenRequestedWithQueryString/toHaveBeenRequestedWithQueryString.js";

export const graphqlOnlyAssertions = [
  toHaveBeenRequestedWithGqlVariables,
  toHaveBeenNthRequestedWithGqlVariables,
  toHaveBeenRequestedWithGqlQuery,
  toHaveBeenNthRequestedWithGqlQuery,
];

export const assertions = [
  toHaveBeenRequested,
  toHaveBeenRequestedTimes,
  toHaveBeenRequestedWith,
  toHaveBeenNthRequestedWith,
  toHaveBeenRequestedWithBody,
  toHaveBeenNthRequestedWithBody,
  toHaveBeenRequestedWithHash,
  toHaveBeenNthRequestedWithHash,
  toHaveBeenRequestedWithHeaders,
  toHaveBeenNthRequestedWithHeaders,
  toHaveBeenRequestedWithJsonBody,
  toHaveBeenNthRequestedWithJsonBody,
  toHaveBeenRequestedWithQueryString,
  toHaveBeenNthRequestedWithQueryString,
];

export const httpAssertions = [...assertions];
export const graphqlAssertions = [...graphqlOnlyAssertions, ...assertions];
