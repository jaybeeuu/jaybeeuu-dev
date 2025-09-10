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
        "TestPost",
        "MixedCase-123",
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
        "test space",
        "test.post",
        "test@post",
        "test/post",
        "test!post",
        "tëst-pøst",
        "test{post",
        "test~post",
        "test_post",
        "test\\post",
        "test[post]",
        "test^post",
        "test`post",
        "££££",
        "ñññññ",
        "😀😀😀😀",
        "....",
        "@@@@",
        "    ",
        "####",
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
        expect(result.message).toContain("");
      }
    });
  });
});
