import {
  cleanUpDirectories,
  getCompiledPostWithContent,
  getOutputFile
} from "./helpers";

describe("links", () => {
  it("compiles an inline hash link to link properly within the document.", async () => {
    await cleanUpDirectories();
    const hrefRoot = "posts";
    const slug = "{slug}";
    const post = await getCompiledPostWithContent({
      slug,
      content: [
        "This is a [link](#destination)"
      ]
    }, { hrefRoot });

    expect(post).toBe([
      "<p>This is a <a href=\"#destination\">link</a></p>",
      ""
    ].join("\n"));
  });

  it("compiles an inline link to another post properly within the document.", async () => {
    await cleanUpDirectories();

    const post = await getCompiledPostWithContent({
      slug: "{slug}",
      content: [
        "This is a [link](./other-post.md)"
      ],
      otherFiles: [
        { path: "./other-post.md", content: "This is a post." },
        {
          path: "./other-post.post.json",
          content: JSON.stringify({
            abstract: "{abstract}",
            publish: true,
            title: "{title}"
          })
        }
      ]
    }, { hrefRoot: "posts" });

    expect(post).toBe([
      "<p>This is a <a href=\"/posts/other-post\">link</a></p>",
      ""
    ].join("\n"));
  });

  it("compiles an inline link to a markdown file which is not a post properly within the document.", async () => {
    await cleanUpDirectories();

    const post = await getCompiledPostWithContent({
      slug: "{slug}",
      content: [
        "This is a [link](./not-a-post.md)"
      ],
      otherFiles: [{
        path: "./not-a-post.md", content: "This is not a post."
      }]
    }, { hrefRoot: "posts" });

    expect(post).toBe([
      "<p>This is a <a href=\"/posts/not-a-post-0d2O72.md\">link</a></p>",
      ""
    ].join("\n"));
  });

  it(
    "compiles relative links to files which exist to hashed assets and copies them to the assets dir (see image)",
    async () => {
      await cleanUpDirectories();
      const updateOptions = { hrefRoot: "posts" };

      void await getCompiledPostWithContent({
        slug: "{slug}",
        content: [
          "This is a [link](./not-a-post.md)"
        ],
        otherFiles: [{
          path: "./not-a-post.md", content: "This is not a post."
        }]
      });

      await expect(
        getOutputFile("not-a-post-0d2O72.md", updateOptions)
      ).resolves.toBe(
        "This is not a post."
      );
    }
  );
});
