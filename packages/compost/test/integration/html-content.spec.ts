import {
  compilePosts,
  getPost,
  outputDir,
  sourceDir
} from "./helpers";

import { deleteDirectories, writeTextFiles } from "../../src/files";
import type { UpdateOptions } from "../../src/posts/src/types";

describe("compile", () => {
  const setupPostFiles = async (slug: string, contentLines: string[]): Promise<void> => {
    await writeTextFiles(
      sourceDir,
      [{
        path: `./${slug}.md`,
        content: contentLines.join("\n")
      }, {
        path: `./${slug}.post.json`,
        content: JSON.stringify({ title: "{title}", abstract: "abstract", publish: true }, null, 2),
      }]
    );
  };

  const getCompiledPostWithContent = async (
    contentLines: string[],
    options: RecursivePartial<{
      slug: string
      updateOptions: UpdateOptions
    }> = {}
  ): Promise<string> => {
    const { slug = "{slug}", updateOptions } = options;
    await deleteDirectories(sourceDir, outputDir);
    await setupPostFiles(slug, contentLines);
    await compilePosts(updateOptions);

    return await getPost(slug);
  };

  it("compiles a post tto include some basic content.", async () => {
    const postContent = "This is the content";
    const post = await getCompiledPostWithContent([
      "# This is the first post",
      "",
      postContent
    ]);
    expect(post).toContain(postContent);
  });

  it("compiles a code block.", async () => {
    const codeLine = "console.log(\"Here's a message\")";
    const post = await getCompiledPostWithContent([
      "# This is the first post",
      "This is the content",
      "```ts",
      codeLine,
      "```"
    ]);

    expect(post).toContain(
      [
        "<pre class=\"hljs\"><code><span class=\"hljs-built_in\">console</span>.log(<span class=\"hljs-string\">\"Here's a message\"</span>)",
        "</code></pre>"
      ].join("\n")
    );
  });

  it("compiles a code block with no code type.", async () => {
    const codeLine = "console.log(\"Here's a message\");";
    const post = await getCompiledPostWithContent([
      "# This is the first post",
      "This is the content",
      "```",
      codeLine,
      "```"
    ]);

    expect(post).toContain(codeLine);
  });

  it("compiles a heading to contain a link.", async () => {
    const hrefRoot = "posts";
    const slug = "{slug}";
    const post = await getCompiledPostWithContent([
      "# This is the first post"
    ],  { slug, updateOptions: { hrefRoot } });

    expect(post).toBe([
      "",
      "<h1 id=\"this-is-the-first-post\">",
      "  This is the first post",
      "  <a class=\"hash-link\" name=\"this-is-the-first-post\" href=\"#this-is-the-first-post\"></a>",
      "</h1>"
    ].join("\n"));
  });

  it("compiles a heading to contain a unique link.", async () => {
    const hrefRoot = "posts";
    const slug = "{slug}";
    const post = await getCompiledPostWithContent([
      "# This is the first post",
      "# This is the first post"
    ],  { slug, updateOptions: { hrefRoot } });

    expect(post).toBe([
      "",
      "<h1 id=\"this-is-the-first-post\">",
      "  This is the first post",
      "  <a class=\"hash-link\" name=\"this-is-the-first-post\" href=\"#this-is-the-first-post\"></a>",
      "</h1>",
      "<h1 id=\"this-is-the-first-post-1\">",
      "  This is the first post",
      "  <a class=\"hash-link\" name=\"this-is-the-first-post-1\" href=\"#this-is-the-first-post-1\"></a>",
      "</h1>"
    ].join("\n"));
  });

  const headingSamples: { level: number }[] = [
    { level: 1 },
    { level: 2 },
    { level: 3 },
    { level: 4 },
    { level: 5 },
    { level: 6 }
  ];
  headingSamples.forEach(({ level }) => {
    it(`compiles subheading ${level} correctly.`, async () => {
      const hrefRoot = "posts";
      const slug = "{slug}";
      const post = await getCompiledPostWithContent([
        `${"".padEnd(level, "#")} This is the first post`,
      ],  { slug, updateOptions: { hrefRoot } });

      expect(post).toBe([
        "",
        `<h${level} id="this-is-the-first-post">`,
        "  This is the first post",
        "  <a class=\"hash-link\" name=\"this-is-the-first-post\" href=\"#this-is-the-first-post\"></a>",
        `</h${level}>`
      ].join("\n"));
    });
  });

  it("compiles a heading link to contain a link which only includes the text - not the rest of the link.", async () => {
    const hrefRoot = "posts";
    const slug = "{slug}";
    const post = await getCompiledPostWithContent([
      "# [This is the first post](www.example.com)"
    ],  { slug, updateOptions: { hrefRoot } });

    expect(post).toBe([
      "",
      "<h1 id=\"this-is-the-first-post\">",
      "  <a href=\"www.example.com\">This is the first post</a>",
      "  <a class=\"hash-link\" name=\"this-is-the-first-post\" href=\"#this-is-the-first-post\"></a>",
      "</h1>"
    ].join("\n"));
  });

  it("compiles an inline hash link to link properly within the document.", async () => {
    const hrefRoot = "posts";
    const slug = "{slug}";
    const post = await getCompiledPostWithContent([
      "# A Post",
      "",
      "This is a [link](#destination)"
    ], { slug, updateOptions: { hrefRoot } });

    expect(post).toBe([
      "",
      "<h1 id=\"a-post\">",
      "  A Post",
      "  <a class=\"hash-link\" name=\"a-post\" href=\"#a-post\"></a>",
      "</h1><p>This is a <a href=\"#destination\">link</a></p>",
      ""
    ].join("\n"));
  });
});
