import { describe, expect, it } from "@jest/globals";
import { parseFrontMatter, hasFrontMatter } from "./frontmatter.js";

describe("frontmatter", () => {
  describe("hasFrontMatter", () => {
    it.each([
      {
        description: "content with properly formatted front matter",
        content: `---
title: "Test Post"
abstract: "Test abstract"
publish: true
---

# Test Content`,
        expected: true,
      },
      {
        description: "content without front matter",
        content: "# Just a regular markdown file",
        expected: false,
      },
      {
        description: "content with opening but no closing front matter",
        content: `---
title: "Test Post"
abstract: "Test abstract"
publish: true

# Test Content`,
        expected: false,
      },
      {
        description: "content with no --- characters at all",
        content: "title: Test\ncontent: body",
        expected: false,
      },
    ])("returns $expected for $description", ({ content, expected }) => {
      expect(hasFrontMatter(content)).toBe(expected);
    });
  });

  describe("parseFrontMatter", () => {
    it("successfully parses valid front matter", () => {
      const content = `---
title: "Test Post"
abstract: "Test abstract"
publish: true
---

# Test Content

This is the body.`;

      const result = parseFrontMatter(content);

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
        content: `---
title: "Test Post"
abstract: "Test abstract"
publish: true

# Test Content`,
        expectedMessage: "Front matter not properly closed",
        expectedReason: "front matter not properly closed",
      },
      {
        description: "front matter has invalid structure",
        content: `---
title: "Test Post"
abstract: "Test abstract"
publish: "not-a-boolean"
---

# Test Content`,
        expectedMessage: "Invalid front matter structure",
        expectedReason: "invalid front matter structure",
      },
      {
        description: "front matter is missing required fields",
        content: `---
title: "Test Post"
---

# Test Content`,
        expectedMessage: "Invalid front matter structure",
        expectedReason: "invalid front matter structure",
      },
    ])(
      "fails when $description",
      ({ content, expectedMessage, expectedReason }) => {
        const result = parseFrontMatter(content);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.reason).toBe(expectedReason);
          expect(result.message).toBe(expectedMessage);
        }
      },
    );

    it("fails when YAML parsing throws an error", () => {
      const content = `---
title: "Test Post
abstract: "Invalid YAML - unterminated string
publish: true
---

# Test Content`;

      const result = parseFrontMatter(content);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe("front matter yaml parse failure");
        expect(result.message).toContain("can not read a block mapping entry");
      }
    });
  });
});
