import { cleanUpDirectories, getCompiledPostWithContent } from "./helpers";

import { describe, expect, it } from "@jest/globals";
describe("compile", () => {
  it("compiles a post tto include some basic content.", async () => {
    await cleanUpDirectories();
    const postContent = "This is the content";
    const post = await getCompiledPostWithContent([
      "# This is the first post",
      "",
      postContent,
    ]);
    expect(post).toContain(postContent);
  });

  describe("code blocks", () => {
    it("compiles a code block.", async () => {
      await cleanUpDirectories();
      const codeLine = 'console.log("Here\'s a message")';
      const post = await getCompiledPostWithContent(["```ts", codeLine, "```"]);

      expect(post).toContain(
        [
          '<pre class="language-ts"><code><span class="token builtin">console</span><span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span><span class="token string">"Here\'s a message"</span><span class="token punctuation">)</span>',
          "</code></pre>",
        ].join("\n"),
      );
    });

    it("compiles a code block with no code type.", async () => {
      await cleanUpDirectories();
      const codeLine = 'console.log("Here\'s a message");';
      const post = await getCompiledPostWithContent(["```", codeLine, "```"]);

      expect(post).toContain(codeLine);
    });

    it("compiles a code block with no code type, adding the correct class to the pre tag.", async () => {
      await cleanUpDirectories();
      const codeLine = 'console.log("Here\'s a message");';
      const post = await getCompiledPostWithContent(["```", codeLine, "```"]);

      expect(post).toContain('<pre class="language-none">');
    });

    it("includes the relevant classes and html tags for line numbers when the option is passed in.", async () => {
      await cleanUpDirectories();
      const codeLine = 'console.log("Here\'s a message");';
      const post = await getCompiledPostWithContent(
        ["```", codeLine, codeLine, codeLine, "```"],
        { codeLineNumbers: true },
      );

      expect(post).toContain('<pre class="language-none line-numbers">');
      expect(post).toContain(
        '<span aria-hidden="true" class="line-number-rows"><span></span><span></span><span></span></span></code>',
      );
    });
  });

  describe("heading links", () => {
    it("compiles a heading to contain a link.", async () => {
      await cleanUpDirectories();
      const hrefRoot = "posts";
      const slug = "{slug}";
      const post = await getCompiledPostWithContent(
        {
          slug,
          content: ["# This is the first post"],
        },
        { hrefRoot },
      );

      expect(post).toBe(
        [
          "",
          '<h1 id="this-is-the-first-post">',
          "  This is the first post",
          '  <a class="hash-link" title="This is the first post" href="#this-is-the-first-post"></a>',
          "</h1>",
        ].join("\n"),
      );
    });

    it("compiles a heading to contain a unique link.", async () => {
      await cleanUpDirectories();
      const hrefRoot = "posts";
      const slug = "{slug}";
      const post = await getCompiledPostWithContent(
        {
          slug,
          content: ["# This is the first post", "# This is the first post"],
        },
        { hrefRoot },
      );

      expect(post).toBe(
        [
          "",
          '<h1 id="this-is-the-first-post">',
          "  This is the first post",
          '  <a class="hash-link" title="This is the first post" href="#this-is-the-first-post"></a>',
          "</h1>",
          '<h1 id="this-is-the-first-post-1">',
          "  This is the first post",
          '  <a class="hash-link" title="This is the first post" href="#this-is-the-first-post-1"></a>',
          "</h1>",
        ].join("\n"),
      );
    });

    const headingSamples: { level: number }[] = [
      { level: 1 },
      // { level: 2 },
      // { level: 3 },
      // { level: 4 },
      // { level: 5 },
      // { level: 6 },
    ];
    describe.each(headingSamples)("$#: Heading $level", ({ level }) => {
      it(`compiles subheading ${level} correctly.`, async () => {
        await cleanUpDirectories();
        const hrefRoot = "posts";
        const slug = "{slug}";
        const post = await getCompiledPostWithContent(
          {
            slug,
            content: [`${"".padEnd(level, "#")} This is the first post`],
          },
          { hrefRoot },
        );

        expect(post).toBe(
          [
            "",
            `<h${level} id="this-is-the-first-post">`,
            "  This is the first post",
            '  <a class="hash-link" title="This is the first post" href="#this-is-the-first-post"></a>',
            `</h${level}>`,
          ].join("\n"),
        );
      });

      it("compiles a heading link to contain a link which only includes the text - not the rest of the link.", async () => {
        await cleanUpDirectories();
        const hrefRoot = "posts";
        const slug = "{slug}";
        const post = await getCompiledPostWithContent(
          {
            slug,
            content: [
              `${"".padEnd(level, "#")} [This is the #1 post](www.example.com)`,
            ],
          },
          { hrefRoot },
        );

        expect(post).toBe(
          [
            "",
            `<h${level} id="this-is-the-1-post">`,
            '  <a href="www.example.com">This is the #1 post</a>',
            '  <a class="hash-link" title="This is the #1 post" href="#this-is-the-1-post"></a>',
            `</h${level}>`,
          ].join("\n"),
        );
      });
    });

    it("removes the first h1's if the remove-h1 flag is passed true.", async () => {
      await cleanUpDirectories();
      const post = await getCompiledPostWithContent(
        {
          content: ["# [This is the first post](www.example.com)"],
        },
        { removeH1: true },
      );

      expect(post).toBe("");
    });

    it("compiles a strike through correctly.", async () => {
      await cleanUpDirectories();
      const hrefRoot = "posts";
      const slug = "{slug}";
      const post = await getCompiledPostWithContent(
        {
          slug,
          content: ["~~This is struck through~~"],
        },
        { hrefRoot },
      );

      expect(post).toContain("<p><del>This is struck through</del></p>");
    });
  });
});
