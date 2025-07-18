import { describe, expect, it } from "vitest";
import { checkEquality } from "../checkEquality.js";

describe("checkEquality", () => {
  describe("primitives", () => {
    it("should return true for identical primitives", () => {
      expect(checkEquality(42, 42)).toBe(true);
      expect(checkEquality("hello", "hello")).toBe(true);
      expect(checkEquality(true, true)).toBe(true);
      expect(checkEquality(false, false)).toBe(true);
    });

    it("should return false for different primitives", () => {
      expect(checkEquality(42, 43)).toBe(false);
      expect(checkEquality("hello", "world")).toBe(false);
      expect(checkEquality(true, false)).toBe(false);
    });

    it("should return false for different types", () => {
      expect(checkEquality(42, "42")).toBe(false);
      expect(checkEquality(true, 1)).toBe(false);
      expect(checkEquality(null, undefined)).toBe(false);
    });
  });

  describe("null and undefined", () => {
    it("should handle null values", () => {
      expect(checkEquality(null, null)).toBe(true);
      expect(checkEquality(null, undefined)).toBe(false);
      expect(checkEquality(null, 0)).toBe(false);
    });

    it("should handle undefined values", () => {
      expect(checkEquality(undefined, undefined)).toBe(true);
      expect(checkEquality(undefined, null)).toBe(false);
      expect(checkEquality(undefined, 0)).toBe(false);
    });
  });

  describe("objects", () => {
    it("should return true for identical objects", () => {
      const obj = { a: 1, b: 2 };
      expect(checkEquality(obj, obj)).toBe(true);
    });

    it("should return true for objects with same properties", () => {
      expect(checkEquality({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
      expect(checkEquality({}, {})).toBe(true);
    });

    it("should return false for objects with different properties", () => {
      expect(checkEquality({ a: 1, b: 2 }, { a: 1, b: 3 })).toBe(false);
      expect(checkEquality({ a: 1 }, { a: 1, b: 2 })).toBe(false);
      expect(checkEquality({ a: 1, b: 2 }, { a: 1 })).toBe(false);
    });

    it("should handle nested objects", () => {
      const obj1 = { a: 1, b: { c: 3, d: 4 } };
      const obj2 = { a: 1, b: { c: 3, d: 4 } };
      const obj3 = { a: 1, b: { c: 3, d: 5 } };

      expect(checkEquality(obj1, obj2)).toBe(true);
      expect(checkEquality(obj1, obj3)).toBe(false);
    });
  });

  describe("arrays", () => {
    it("should return true for identical arrays", () => {
      const arr = [1, 2, 3];
      expect(checkEquality(arr, arr)).toBe(true);
    });

    it("should return true for arrays with same elements", () => {
      expect(checkEquality([1, 2, 3], [1, 2, 3])).toBe(true);
      expect(checkEquality([], [])).toBe(true);
    });

    it("should return false for arrays with different elements", () => {
      expect(checkEquality([1, 2, 3], [1, 2, 4])).toBe(false);
      expect(checkEquality([1, 2], [1, 2, 3])).toBe(false);
      expect(checkEquality([1, 2, 3], [1, 2])).toBe(false);
    });

    it("should handle nested arrays", () => {
      expect(
        checkEquality(
          [
            [1, 2],
            [3, 4],
          ],
          [
            [1, 2],
            [3, 4],
          ],
        ),
      ).toBe(true);
      expect(
        checkEquality(
          [
            [1, 2],
            [3, 4],
          ],
          [
            [1, 2],
            [3, 5],
          ],
        ),
      ).toBe(false);
    });

    it("should handle arrays with objects", () => {
      const arr1 = [{ a: 1 }, { b: 2 }];
      const arr2 = [{ a: 1 }, { b: 2 }];
      const arr3 = [{ a: 1 }, { b: 3 }];

      expect(checkEquality(arr1, arr2)).toBe(true);
      expect(checkEquality(arr1, arr3)).toBe(false);
    });
  });

  describe("asymmetric matchers", () => {
    it("should handle expect.any() matcher", () => {
      expect(checkEquality(expect.any(String), "hello")).toBe(true);
      expect(checkEquality(expect.any(Number), 42)).toBe(true);
      expect(checkEquality(expect.any(Boolean), true)).toBe(true);
      expect(checkEquality(expect.any(String), 42)).toBe(false);
      expect(checkEquality(expect.any(Number), "hello")).toBe(false);
    });

    it("should handle expect.any() in reverse order", () => {
      expect(checkEquality("hello", expect.any(String))).toBe(true);
      expect(checkEquality(42, expect.any(Number))).toBe(true);
      expect(checkEquality(42, expect.any(String))).toBe(false);
    });

    it("should handle expect.objectContaining() matcher", () => {
      expect(
        checkEquality(expect.objectContaining({ a: 1 }), { a: 1, b: 2 }),
      ).toBe(true);
      expect(
        checkEquality(expect.objectContaining({ a: 1, b: 2 }), {
          a: 1,
          b: 2,
          c: 3,
        }),
      ).toBe(true);
      expect(
        checkEquality(expect.objectContaining({ a: 1, b: 3 }), { a: 1, b: 2 }),
      ).toBe(false);
    });

    it("should handle expect.arrayContaining() matcher", () => {
      expect(checkEquality(expect.arrayContaining([1, 2]), [1, 2, 3])).toBe(
        true,
      );
      expect(checkEquality(expect.arrayContaining([1, 3]), [1, 2, 3])).toBe(
        true,
      );
      expect(checkEquality(expect.arrayContaining([1, 4]), [1, 2, 3])).toBe(
        false,
      );
    });

    it("should handle nested asymmetric matchers", () => {
      expect(
        checkEquality({ a: expect.any(String), b: 2 }, { a: "hello", b: 2 }),
      ).toBe(true);
      expect(checkEquality([expect.any(Number), "world"], [42, "world"])).toBe(
        true,
      );
      expect(
        checkEquality({ a: expect.any(String), b: 2 }, { a: 42, b: 2 }),
      ).toBe(false);
    });

    it("should handle complex nested structures with matchers", () => {
      const expected = {
        user: {
          id: expect.any(Number),
          name: expect.any(String),
          posts: expect.arrayContaining([
            expect.objectContaining({ title: expect.any(String) }),
          ]),
        },
      };

      const actual = {
        user: {
          id: 123,
          name: "John",
          posts: [
            { title: "Hello World", content: "..." },
            { title: "Another Post", content: "..." },
          ],
        },
      };

      expect(checkEquality(expected, actual)).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("should handle Date objects", () => {
      const date1 = new Date("2023-01-01");
      const date2 = new Date("2023-01-01");
      const date3 = new Date("2023-01-02");

      expect(checkEquality(date1, date1)).toBe(true);
      expect(checkEquality(date1, date2)).toBe(false); // Different objects
      expect(checkEquality(date1, date3)).toBe(false);
    });

    it("should handle RegExp objects", () => {
      const regex1 = /hello/g;
      const regex2 = /hello/g;

      expect(checkEquality(regex1, regex1)).toBe(true);
      expect(checkEquality(regex1, regex2)).toBe(false); // Different objects
    });

    it("should handle class instances", () => {
      class TestClass {
        constructor(public value: number) {}
      }

      const instance1 = new TestClass(42);
      const instance2 = new TestClass(42);

      expect(checkEquality(instance1, instance1)).toBe(true);
      expect(checkEquality(instance1, instance2)).toBe(false); // Different objects
    });
  });
});
