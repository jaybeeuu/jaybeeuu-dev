import { joinUrlPath } from "./join-url-path";

import { describe, expect, it } from "@jest/globals";
describe("joinUrlPath", () => {
  const samples: {
    description: string;
    input: string[];
    expected: string;
  }[] = [
    {
      description: "joins the fragments with /'s",
      expected: "/this/is/a/path",
      input: ["this", "is", "a", "path"],
    },
    {
      description:
        "does not include leading and trailing /'s from the fragments",
      expected: "/this/is/a/path",
      input: ["this/", "is/", "/a", "/path/"],
    },
    {
      description: "does includes middle /'s from the fragments",
      expected: "/this/is/a/path",
      input: ["this/is/", "/a", "/path/"],
    },
  ];
  it.each(samples)("$#: $description", ({ expected, input }) => {
    expect(joinUrlPath(...input)).toBe(expected);
  });
});
