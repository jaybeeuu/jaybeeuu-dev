import { describe, expect, it } from "@jest/globals";
import { cleanUpDirectories, compilePosts } from "./helpers.js";
import { writeTextFiles } from "../../src/files/index.js";

describe("metafile integration", () => {
  it("fails compilation when JSON metadata file has invalid JSON", async () => {
    await cleanUpDirectories();

    const slug = "invalid-json-post";

    // Write a post with a .post.json file containing invalid JSON
    await writeTextFiles("src", [
      {
        path: `${slug}.md`,
        content: "# Test Post\n\nThis is test content.",
      },
      {
        path: `${slug}.post.json`,
        content:
          '{"title": "Test Post", "abstract": "Test abstract", "publish": true,', // Missing closing brace
      },
    ]);

    const result = await compilePosts();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.message).toContain("JSON");
    }
  });

  it("skips posts when JSON metadata file cannot be read", async () => {
    await cleanUpDirectories();

    const slug = "no-access-post";

    // Write a markdown file but no corresponding .post.json file
    await writeTextFiles("src", [
      {
        path: `${slug}.md`,
        content: "# Test Post\n\nThis is test content.",
      },
    ]);

    const result = await compilePosts();

    // Should succeed but with empty manifest since the post was skipped
    expect(result.success).toBe(true);
    if (result.success) {
      expect(Object.keys(result.value)).toHaveLength(0);
    }
  });
});
