import { typeDescription } from "./type-guards";
import {
  is,
  isArrayOf,
  isInPrimitiveUnion,
  isNullish,
  isObject,
  isRecordOf,
  or,
  exclude,
} from "./index";

describe("type-guards", () => {
  describe("isNullish", () => {
    const samples: {
      value: unknown;
      expectedOutcome: boolean;
    }[] = [
      {
        value: null,
        expectedOutcome: true,
      },
      {
        value: undefined,
        expectedOutcome: true,
      },
      {
        value: "{not-null}",
        expectedOutcome: false,
      },
    ];
    it.each(samples)(
      "$#: isNull(value: $value) -> $expectedOutcome",
      ({ expectedOutcome, value }) => {
        expect(isNullish(value)).toBe(expectedOutcome);
      },
    );

    it("has the right type description.", () => {
      expect(isNullish[typeDescription]).toBe("null | undefined");
    });
  });

  describe("isObject", () => {
    const samples: {
      value: unknown;
      expectedOutcome: boolean;
    }[] = [
      {
        value: { a: "1", b: 2 },
        expectedOutcome: true,
      },
      {
        value: { a: "1", b: 2, c: true },
        expectedOutcome: true,
      },
      {
        value: { a: 1, b: 2 },
        expectedOutcome: false,
      },
      {
        value: "{not-an-object}",
        expectedOutcome: false,
      },
      {
        value: null,
        expectedOutcome: false,
      },
    ];

    it.each(samples)(
      '$#: isObject({ a: is("string"), b: is("number") })(value: $value) -> $expectedOutcome',
      ({ expectedOutcome, value }) => {
        expect(
          isObject({
            a: is("string"),
            b: is("number"),
          })(value),
        ).toBe(expectedOutcome);
      },
    );

    it("has the right type description.", () => {
      expect(
        isObject({
          a: is("string"),
          b: is("number"),
        })[typeDescription],
      ).toBe("{ a: string; b: number; }");
    });
  });

  describe("isArray", () => {
    const samples: {
      value: unknown;
      expectedOutcome: boolean;
    }[] = [
      {
        value: [1, 2],
        expectedOutcome: true,
      },
      {
        value: ["1", 2],
        expectedOutcome: false,
      },
      {
        value: "{not-an-object}",
        expectedOutcome: false,
      },
      {
        value: null,
        expectedOutcome: false,
      },
    ];

    it.each(samples)(
      '$#: isArray(is("number"))(value: $value) -> $expectedOutcome',
      ({ expectedOutcome, value }) => {
        const predicate = isArrayOf(is("number"));
        expect(predicate(value)).toBe(expectedOutcome);
      },
    );

    it("has the right type description.", () => {
      expect(isArrayOf(is("number"))[typeDescription]).toBe("number[]");
    });
  });

  describe("isRecordOf", () => {
    const samples: {
      value: unknown;
      expectedOutcome: boolean;
    }[] = [
      {
        value: { a: 1, b: 2 },
        expectedOutcome: true,
      },
      {
        value: { a: "1", b: 2 },
        expectedOutcome: false,
      },
      {
        value: "{not-an-object}",
        expectedOutcome: false,
      },
      {
        value: null,
        expectedOutcome: false,
      },
    ];

    it.each(samples)(
      '$#: isRecordOf(is("number"))(value: $value) -> $expectedOutcome',
      ({ expectedOutcome, value }) => {
        expect(isRecordOf(is("number"))(value)).toBe(expectedOutcome);
      },
    );

    it("has the right type description.", () => {
      expect(isRecordOf(is("number"))[typeDescription]).toBe(
        "{ [key: string]: number; }",
      );
    });
  });

  describe("is", () => {
    const samples: {
      typeString: string | number | boolean;
      value: unknown;
      expectedOutcome: boolean;
    }[] = [
      {
        typeString: "bigint",
        value: BigInt("7697543624385867012413"),
        expectedOutcome: true,
      },
      {
        typeString: "bigint",
        value: "{string}",
        expectedOutcome: false,
      },
      {
        typeString: "boolean",
        value: true,
        expectedOutcome: true,
      },
      {
        typeString: "boolean",
        value: 10,
        expectedOutcome: false,
      },
      {
        typeString: "function",
        value: () => {},
        expectedOutcome: true,
      },
      {
        typeString: "function",
        value: {},
        expectedOutcome: false,
      },
      {
        typeString: "null",
        value: null,
        expectedOutcome: true,
      },
      {
        typeString: "null",
        value: false,
        expectedOutcome: false,
      },
      {
        typeString: "number",
        value: 100,
        expectedOutcome: true,
      },
      {
        typeString: "number",
        value: [],
        expectedOutcome: false,
      },
      {
        typeString: "object",
        value: {},
        expectedOutcome: true,
      },
      {
        typeString: "object",
        value: 99,
        expectedOutcome: false,
      },
      {
        typeString: "string",
        value: "{string}",
        expectedOutcome: true,
      },
      {
        typeString: "symbol",
        value: Symbol.for("thing"),
        expectedOutcome: true,
      },
      {
        typeString: "symbol",
        value: {},
        expectedOutcome: false,
      },
      {
        typeString: "undefined",
        value: undefined,
        expectedOutcome: true,
      },
      {
        typeString: "undefined",
        value: {},
        expectedOutcome: false,
      },
      {
        typeString: "literal",
        value: "literal",
        expectedOutcome: true,
      },
      {
        typeString: "literal",
        value: "thing",
        expectedOutcome: false,
      },
      {
        typeString: 10,
        value: 10,
        expectedOutcome: true,
      },
      {
        typeString: 10,
        value: 11,
        expectedOutcome: false,
      },
      {
        typeString: false,
        value: false,
        expectedOutcome: true,
      },
      {
        typeString: true,
        value: true,
        expectedOutcome: true,
      },
    ];

    it.each(samples)(
      "$#: is(typeString: $typeString)(value: $value) -> $expectedOutcome;",
      ({ expectedOutcome, typeString, value }) => {
        expect(is(typeString)(value)).toBe(expectedOutcome);
      },
    );

    it.each([
      { typeString: "string" },
      { typeString: "number" },
      { typeString: "bigint" },
      { typeString: "boolean" },
      { typeString: "symbol" },
      { typeString: "undefined" },
      { typeString: "object" },
      { typeString: "function" },
      { typeString: "thing" },
    ] as const)(
      "$#: is(typeString: $typeString) has type description $typeString.",
      ({ typeString }) => {
        expect(is(typeString)[typeDescription]).toBe(typeString);
      },
    );
  });

  describe("or", () => {
    const samples: {
      value: unknown;
      expectedOutcome: boolean;
    }[] = [
      {
        value: 100,
        expectedOutcome: true,
      },
      {
        value: "{string}",
        expectedOutcome: true,
      },
      {
        value: false,
        expectedOutcome: false,
      },
    ];

    it.each(samples)(
      '$#: or(is("number"), is("string"))(value: $value) -> $expectedOutcome',
      ({ expectedOutcome, value }) => {
        expect(or(is("number"), is("string"))(value)).toBe(expectedOutcome);
      },
    );

    it("has the right type description.", () => {
      expect(or(is("number"), is("string"))[typeDescription]).toBe(
        "number | string",
      );
    });
  });

  describe("exclude", () => {
    const samples: {
      value: unknown;
      expectedOutcome: boolean;
    }[] = [
      {
        value: undefined,
        expectedOutcome: false,
      },
      {
        value: 10,
        expectedOutcome: true,
      },
    ];

    it.each(samples)(
      '$#: exclude(or(is("number"), is("undefined")), is("undefined"))(value: $value) -> $expectedOutcome',
      ({ expectedOutcome, value }) => {
        expect(
          exclude(or(is("number"), is("undefined")), is("undefined"))(value),
        ).toBe(expectedOutcome);
      },
    );

    it("has the right type description.", () => {
      expect(
        exclude(or(is("number"), is("undefined")), is("undefined"))[
          typeDescription
        ],
      ).toBe("number");
    });
  });

  describe("isInPrimitiveUnion", () => {
    const samples: {
      value: unknown;
      expectedOutcome: boolean;
    }[] = [
      {
        value: "one",
        expectedOutcome: true,
      },
      {
        value: "two",
        expectedOutcome: true,
      },
      {
        value: "three",
        expectedOutcome: false,
      },
      {
        value: 100,
        expectedOutcome: false,
      },
      {
        value: true,
        expectedOutcome: false,
      },
      {
        value: {},
        expectedOutcome: false,
      },
    ];

    it.each(samples)(
      '$#: isInPrimitiveUnion(["one", "two"])(value: $value) -> $expectedOutcome',
      ({ expectedOutcome, value }) => {
        expect(isInPrimitiveUnion(["one", "two"])(value)).toBe(expectedOutcome);
      },
    );

    it("has the right type description.", () => {
      expect(isInPrimitiveUnion(["one", "two"])[typeDescription]).toBe(
        '"one" | "two"',
      );
    });
  });
});
