import { describe, expect, it } from "@jest/globals";
import { parseFrontMatter, hasFrontMatter } from "./frontmatter.js";

describe("frontmatter", () => {
  describe("hasFrontMatter", () => {
    it("returns true for content with properly formatted front matter", () => {
      const content = `---
title: "Test Post"
abstract: "Test abstract"
publish: true
---

# Test Content`;

      expect(hasFrontMatter(content)).toBe(true);
    });

    it("returns false for content without front matter", () => {
      const content = "# Just a regular markdown file";

      expect(hasFrontMatter(content)).toBe(false);
    });

    it("returns false for content with opening but no closing front matter", () => {
      const content = `---
title: "Test Post"
abstract: "Test abstract"
publish: true

# Test Content`;

      expect(hasFrontMatter(content)).toBe(false);
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

    it("fails when content doesn't start with front matter", () => {
      const content = "# Just a regular markdown file";

      const result = parseFrontMatter(content);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe("parse front matter failed");
        expect(result.message).toBe("No front matter found");
      }
    });

    it("fails when front matter is not properly closed", () => {
      const content = `---
title: "Test Post"
abstract: "Test abstract"
publish: true

# Test Content`;

      const result = parseFrontMatter(content);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe("parse front matter failed");
        expect(result.message).toBe("Front matter not properly closed");
      }
    });

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
        expect(result.reason).toBe("parse front matter failed");
        expect(result.message).toContain("can not read a block mapping entry");
      }
    });

    it("fails when front matter has invalid structure", () => {
      const content = `---
title: "Test Post"
abstract: "Test abstract"
publish: "not-a-boolean"
---

# Test Content`;

      const result = parseFrontMatter(content);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe("parse front matter failed");
        expect(result.message).toBe("Invalid front matter structure");
      }
    });

    it("fails when front matter is missing required fields", () => {
      const content = `---
title: "Test Post"
---

# Test Content`;

      const result = parseFrontMatter(content);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe("parse front matter failed");
        expect(result.message).toBe("Invalid front matter structure");
      }
    });
  });
});
