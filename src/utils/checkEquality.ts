const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return (
    typeof value === 'object' && value !== null && value.constructor === Object
  );
};

export const checkEquality = (expected: unknown, actual: unknown): boolean => {
  if (expected === actual) {
    return true;
  }

  if (
    typeof expected === 'object' &&
    expected !== null &&
    'asymmetricMatch' in expected &&
    typeof expected.asymmetricMatch === 'function'
  ) {
    return expected.asymmetricMatch(actual);
  }

  if (
    typeof actual === 'object' &&
    actual !== null &&
    'asymmetricMatch' in actual &&
    typeof actual.asymmetricMatch === 'function'
  ) {
    return actual.asymmetricMatch(expected);
  }

  if (expected === null || actual === null) {
    return expected === actual;
  }

  if (expected === undefined || actual === undefined) {
    return expected === actual;
  }

  if (typeof expected !== typeof actual) {
    return false;
  }

  if (Array.isArray(expected) && Array.isArray(actual)) {
    if (expected.length !== actual.length) {
      return false;
    }

    return expected.every((item, index) => checkEquality(item, actual[index]));
  }

  if (isPlainObject(expected) && isPlainObject(actual)) {
    const expectedKeys = Object.keys(expected);
    const actualKeys = Object.keys(actual);

    if (expectedKeys.length !== actualKeys.length) {
      return false;
    }

    return expectedKeys.every(
      (key) =>
        actualKeys.includes(key) && checkEquality(expected[key], actual[key]),
    );
  }

  return false;
};
