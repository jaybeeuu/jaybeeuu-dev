import { describe, expect, it } from "@jest/globals";
import { parseFrontMatter, hasFrontMatter } from "./frontmatter.js";

describe("frontmatter", () => {
  describe("hasFrontMatter", () => {
    it.each([
      {
        description: "content with properly formatted front matter",
        content: [
          "---",
          'title: "Test Post"',
          'abstract: "Test abstract"',
          "publish: true",
          "---",
          "",
          "# Test Content",
        ],
        expected: true,
      },
      {
        description: "content without front matter",
        content: ["# Just a regular markdown file"],
        expected: false,
      },
      {
        description: "content with opening but no closing front matter",
        content: [
          "---",
          'title: "Test Post"',
          'abstract: "Test abstract"',
          "publish: true",
          "",
          "# Test Content",
        ],
        expected: false,
      },
      {
        description: "content with opening but no closing front matter",
        content: [
          'title: "Test Post"',
          'abstract: "Test abstract"',
          "publish: true",
          "---",
          "",
          "# Test Content",
        ],
        expected: false,
      },
    ])("returns $expected for $description", ({ content, expected }) => {
      expect(hasFrontMatter(content.join("\n"))).toBe(expected);
    });
  });

  describe("parseFrontMatter", () => {
    it("successfully parses valid front matter", () => {
      const testContent = [
        "---",
        'title: "Test Post"',
        'abstract: "Test abstract"',
        "publish: true",
        "---",
        "",
        "# Test Content",
        "",
        "This is the body.",
      ].join("\n");

      const result = parseFrontMatter(testContent);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.metadata).toEqual({
          title: "Test Post",
          abstract: "Test abstract",
          publish: true,
        });
        expect(result.value.content).toBe(
          "\n# Test Content\n\nThis is the body.",
        );
      }
    });

    it.each([
      {
        description: "content doesn't start with front matter",
        content: "# Just a regular markdown file",
        expectedMessage: "No front matter found",
        expectedReason: "no front matter found",
      },
      {
        description: "front matter is not properly closed",
        content: [
          "---",
          'title: "Test Post"',
          'abstract: "Test abstract"',
          "publish: true",
          "",
          "# Test Content",
        ],
        expectedMessage: "Front matter not properly closed",
        expectedReason: "front matter not properly closed",
      },
      {
        description: "YAML has invalid syntax",
        content: [
          "---",
          'title: "Test Post',
          'abstract: "Unterminated string',
          "publish: true",
          "---",
          "",
          "# Test Content",
        ],
        expectedReason: "front matter yaml parse failure",
        expectedMessage: expect.stringContaining("can not read"),
      },
      {
        description: "metadata has invalid structure",
        content: [
          "---",
          'title: "Test Post"',
          'abstract: "Test abstract"',
          'publish: "not-a-boolean"',
          "---",
          "",
          "# Test Content",
        ],
        expectedReason: "yaml metadata invalid",
        expectedMessage: expect.stringContaining("root.publish"),
      },
      {
        description: "metadata is missing required fields",
        content: ["---", 'title: "Test Post"', "---", "", "# Test Content"],
        expectedReason: "yaml metadata invalid",
        expectedMessage: expect.stringContaining("root.publish"),
      },
    ])(
      "fails when $description",
      ({ content, expectedMessage, expectedReason }) => {
        const result = parseFrontMatter(
          Array.isArray(content) ? content.join("\n") : content,
        );

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.reason).toBe(expectedReason);
          expect(result.message).toStrictEqual(expectedMessage);
        }
      },
    );
  });
});
