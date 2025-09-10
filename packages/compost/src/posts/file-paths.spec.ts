import { describe, expect, it } from "@jest/globals";
import { validateSlug } from "./file-paths.js";

describe("file-paths", () => {
  describe("validateSlug", () => {
    it("should succeed for valid slugs", () => {
      const validSlugs = [
        "test-post",
        "another-test-post",
        "post123",
        "a-very-long-slug-with-many-hyphens-and-numbers-123",
        "1234",
        "test_post", // underscore is allowed (part of A-z range)
        "TestPost", // mixed case is allowed
        "test\\post", // backslash is allowed (part of A-z range)
        "test[post]", // brackets are allowed (part of A-z range)
      ];

      for (const slug of validSlugs) {
        const result = validateSlug(slug);
        expect(result.success).toBe(true);
      }
    });

    it("should fail for slugs that are too short", () => {
      const shortSlugs = ["a", "ab", "abc"];

      for (const slug of shortSlugs) {
        const result = validateSlug(slug);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.reason).toBe("invalid slug");
          expect(result.message).toContain(`Slug "${slug}" does not match`);
          expect(result.message).toContain(slug);
        }
      }
    });

    it("should fail for slugs with invalid characters", () => {
      const invalidSlugs = [
        "test space", // space not allowed
        "test.post", // dot not allowed
        "test@post", // @ not allowed
        "test/post", // slash not allowed
        "test!post", // exclamation not allowed
        "tëst-pøst", // accented characters not allowed
        "test{post", // curly brace not allowed (outside A-z range)
        "test~post", // tilde not allowed (outside A-z range)
        "££££", // pound signs only
        "ñññññ", // accented characters only
        "😀😀😀😀", // emoji only
        "....", // dots only
        "@@@@", // @ symbols only
        "    ", // spaces only (4 spaces)
        "####", // hash symbols only
      ];

      for (const slug of invalidSlugs) {
        const result = validateSlug(slug);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.reason).toBe("invalid slug");
          expect(result.message).toContain(`Slug "${slug}" does not match`);
          expect(result.message).toContain(slug);
        }
      }
    });

    it("should fail for empty slug", () => {
      const result = validateSlug("");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe("invalid slug");
        expect(result.message).toContain('Slug "" does not match');
        expect(result.message).toContain("[0-9A-z-]{4,}");
      }
    });
  });
});
