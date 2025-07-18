import type { Mock } from "vitest";
import type { Assertion } from "../../types/index.js";
import { checkEquality } from "../../utils/checkEquality.js";
import { checkMockedHandler } from "../../utils/checkMockedHandler.js";
import { formatMockCalls } from "../../utils/formatMockCalls.js";

declare module "msw" {
  interface HttpHandler {
    pathParametersAssertion?: Mock;
  }
  interface GraphQLHandler {
    pathParametersAssertion?: Mock;
  }
}

export const toHaveBeenRequestedWithPathParameters: Assertion = {
  name: "toHaveBeenRequestedWithPathParameters",
  interceptHttp:
    (mockFn, original) =>
    (path, resolver, options, ...rest) => {
      const pathParametersAssertion = mockFn();
      pathParametersAssertion.mockName(
        typeof path === "string" ? path : path.source,
      );

      const newResolver: typeof resolver = (info, ...args) => {
        const { params } = info;

        // There is a null prototype
        pathParametersAssertion(JSON.parse(JSON.stringify(params)));

        return resolver(info, ...args);
      };

      const handler = original(path, newResolver, options, ...rest);

      handler.pathParametersAssertion = pathParametersAssertion;

      return handler;
    },
  interceptGql:
    (mockFn, original) =>
    (operationName, resolver, options, ...rest) => {
      const pathParametersAssertion = mockFn();
      pathParametersAssertion.mockName(
        typeof operationName === "string"
          ? operationName
          : operationName.toString(),
      );

      const newResolver: typeof resolver = (info, ...args) => {
        const params = "params" in info ? info.params : {};

        // There is a null prototype
        pathParametersAssertion(JSON.parse(JSON.stringify(params)));

        return resolver(info, ...args);
      };

      const handler = original(operationName, newResolver, options, ...rest);

      handler.pathParametersAssertion = pathParametersAssertion;

      return handler;
    },
  assert: function (received, expected) {
    checkMockedHandler(received);
    const assertion = received.pathParametersAssertion;
    if (!assertion) throw new Error("No path parameters assertion found");

    const name = assertion.getMockName();
    const calls = assertion?.mock.calls || [];

    const { isNot } = this;
    return {
      pass: calls.some((call) => checkEquality(call[0], expected)),
      message: () =>
        formatMockCalls(
          name,
          calls,
          `Expected ${name} to${isNot ? " not" : ""} have been requested with path parameters ${this.utils.printExpected(JSON.stringify(expected))}`,
        ),
    };
  },
};
