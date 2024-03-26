import { typeDescription } from "./core.js";
import {
  is,
  isArrayOf,
  isInstanceOf,
  isIntersectionOf,
  isLiteral,
  isNullish,
  isObject,
  isRecordOf,
  isTuple,
  isUnionOf,
  type TypeString,
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
      }
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
          })(value)
        ).toBe(expectedOutcome);
      }
    );

    it("has the right type description.", () => {
      expect(
        isObject({
          a: is("string"),
          b: is("number"),
        })[typeDescription]
      ).toBe("{ a: string; b: number; }");
    });
  });

  describe("isArrayOf", () => {
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
      '$#: isArrayOf(is("number"))(value: $value) -> $expectedOutcome',
      ({ expectedOutcome, value }) => {
        const predicate = isArrayOf(is("number"));
        expect(predicate(value)).toBe(expectedOutcome);
      }
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
      }
    );

    it("has the right type description.", () => {
      expect(isRecordOf(is("number"))[typeDescription]).toBe(
        "{ [key: string]: number; }"
      );
    });
  });

  describe("is", () => {
    const samples: {
      typeString: TypeString | "null";
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
        typeString: "string",
        value: 10,
        expectedOutcome: false,
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
    ];

    it.each(samples)(
      "$#: is(typeString: $typeString)(value: $value) -> $expectedOutcome;",
      ({ expectedOutcome, typeString, value }) => {
        expect(is(typeString)(value)).toBe(expectedOutcome);
      }
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
      { typeString: "null" },
    ] as const)(
      "$#: is(typeString: $typeString) has type description $typeString.",
      ({ typeString }) => {
        expect(is(typeString)[typeDescription]).toBe(typeString);
      }
    );
  });

  describe("isLiteral", () => {
    const samples: {
      type: string | number | boolean;
      value: unknown;
      expectedOutcome: boolean;
    }[] = [
      {
        type: "literal",
        value: "literal",
        expectedOutcome: true,
      },
      {
        type: "literal",
        value: "thing",
        expectedOutcome: false,
      },
      {
        type: 10,
        value: 10,
        expectedOutcome: true,
      },
      {
        type: 10,
        value: 11,
        expectedOutcome: false,
      },
      {
        type: false,
        value: false,
        expectedOutcome: true,
      },
      {
        type: true,
        value: true,
        expectedOutcome: true,
      },
    ];

    it.each(samples)(
      "$#: isLiteral(type: $type)(value: $value) -> $expectedOutcome;",
      ({ expectedOutcome, type, value }) => {
        expect(isLiteral(type)(value)).toBe(expectedOutcome);
      }
    );

    it.each([{ type: "literal" }, { type: 1 }, { type: true }] as const)(
      "$#: isLiteral(type: $type) has type description $type.",
      ({ type }) => {
        expect(isLiteral(type)[typeDescription]).toBe(String(type));
      }
    );
  });

  describe("isUnionOf", () => {
    const samples: {
      value: unknown;
      expectedOutcome: boolean;
    }[] = [
      {
        value: 100,
        expectedOutcome: true,
      },
      {
        value: "apple",
        expectedOutcome: true,
      },
      {
        value: false,
        expectedOutcome: false,
      },
    ];

    it.each(samples)(
      '$#: isUnionOf(is("number"), is("string"))(value: $value) -> $expectedOutcome',
      ({ expectedOutcome, value }) => {
        expect(
          isUnionOf(
            is("number"),
            isLiteral("banana"),
            isLiteral("apple")
          )(value)
        ).toBe(expectedOutcome);
      }
    );

    it("has the right type description.", () => {
      expect(isUnionOf(is("number"), is("string"))[typeDescription]).toBe(
        "number | string"
      );
    });
  });

  describe("isIntersectionOf", () => {
    const samples: {
      value: unknown;
      expectedOutcome: boolean;
    }[] = [
      {
        value: { a: "{string}", b: 10 },
        expectedOutcome: true,
      },
      {
        value: { a: 10, b: 10 },
        expectedOutcome: false,
      },
      {
        value: { a: "{string}", b: "{string}" },
        expectedOutcome: false,
      },
    ];

    it.each(samples)(
      '$#: isIntersectionOf(isObject({ a: is("string") }), isObject({ b: is("number") }))(value: $value) -> $expectedOutcome',
      ({ expectedOutcome, value }) => {
        expect(
          isIntersectionOf(
            isObject({ a: is("string") }),
            isObject({ b: is("number") })
          )(value)
        ).toBe(expectedOutcome);
      }
    );

    it("has the right type description.", () => {
      expect(
        isIntersectionOf(
          isObject({ a: is("string") }),
          isObject({ b: is("number") })
        )[typeDescription]
      ).toBe("{ a: string; } & { b: number; }");
    });
  });

  describe("isTuple", () => {
    const samples: {
      value: unknown;
      expectedOutcome: boolean;
    }[] = [
      {
        value: ["{string}", 10],
        expectedOutcome: true,
      },
      {
        value: [10, 10],
        expectedOutcome: false,
      },
      {
        value: ["{string}", "{string}"],
        expectedOutcome: false,
      },
      {
        value: "{not an array}",
        expectedOutcome: false,
      },
    ];

    it.each(samples)(
      '$#: isTuple(is("string"), is("number"))(value: $value) -> $expectedOutcome',
      ({ expectedOutcome, value }) => {
        expect(isTuple(is("string"), is("number"))(value)).toBe(
          expectedOutcome
        );
      }
    );

    it("has the right type description.", () => {
      expect(isTuple(is("string"), is("number"))[typeDescription]).toBe(
        "[string, number]"
      );
    });
  });

  describe("isInstanceOf", () => {
    class A {
      toJSON(): string {
        return "new A()";
      }
    }

    class B extends A {
      toJSON(): string {
        return "new B()";
      }
    }
    class C {
      toJSON(): string {
        return "new C()";
      }
    }

    const samples: {
      value: unknown;
      expectedOutcome: boolean;
    }[] = [
      {
        value: new A(),
        expectedOutcome: true,
      },
      {
        value: new B(),
        expectedOutcome: true,
      },
      {
        value: new C(),
        expectedOutcome: false,
      },
    ];

    it.each(samples)(
      "$#: isInstanceOf(A)(value: $value) -> $expectedOutcome",
      ({ expectedOutcome, value }) => {
        expect(isInstanceOf(A)(value)).toBe(expectedOutcome);
      }
    );

    it("has the right type description.", () => {
      expect(isInstanceOf(A)[typeDescription]).toBe("instanceof(A)");
    });
  });
});
