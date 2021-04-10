import path from "path";
import { advanceTo } from "jest-date-mock";
import { writeTextFiles, readTextFile, deleteDirectories } from "../../src/files";
import { PostManifest, UpdateOptions } from "../../src/posts/src/types";
import { update } from "../../src/posts";
import { Result } from "../../src/results";
import { UpdateFailureReason } from "packages/compost/src/posts/src/update";

const jestWorkerId = +(process.env.JEST_WORKER_ID || 0);
const sourceDir = path.resolve(`./fs/test/${jestWorkerId.toString()}/src`);
const outputDir = path.resolve(`./fs/test/${jestWorkerId.toString()}/out`);
const manifestFileName = "mainfest.post.json";

const getOutputFile = async (filePath: string): Promise<string> => {
  const resolvedManifestFilePath = path.resolve(outputDir, filePath);
  return readTextFile(resolvedManifestFilePath);
};

const getPostManifest = async (): Promise<PostManifest> => {
  const fileName = path.join("posts", manifestFileName);
  const fileContent = await getOutputFile(fileName);
  return JSON.parse(fileContent) as PostManifest;
};

const getPost = (href: string): Promise<string> => {
  return getOutputFile(`.${href}`);
};

const compilePosts = async (options?: Partial<UpdateOptions>): Promise<Result<PostManifest, UpdateFailureReason>> => {
  return update({
    hrefRoot: "posts",
    manifestFileName,
    outputDir: path.join(outputDir, "posts"),
    sourceDir,
    watch: false,
    additionalWatchPaths: "",
    includeUnpublished: false,
    ...options
  });
};

describe("compile", () => {
  it("makes the post available in the manifest on /post, after a refresh from a blank slate.", async () => {
    await deleteDirectories(sourceDir, outputDir);

    const publishDate = "2020-03-11";
    advanceTo(publishDate);
    const slug = "first-post";
    const meta = {
      title: "This is the first post",
      abstract: "This is the very first post.",
      publish: true
    };
    await writeTextFiles(
      sourceDir,
      [{
        path: `./${slug}.md`,
        content: "# This is the first post\n\nIt has some content."
      }, {
        path: `./${slug}.post.json`,
        content: JSON.stringify(meta, null, 2)
      }]
    );
    const hrefRoot = "posts";
    await compilePosts({ hrefRoot });

    const manifest = await getPostManifest();

    expect(manifest).toStrictEqual({
      [slug]: {
        ...meta,
        publishDate: new Date(publishDate).toUTCString(),
        lastUpdateDate: null,
        slug,
        fileName: expect.stringMatching(new RegExp(`${slug}-[A-z0-9]{6}.html`)) as unknown,
        href: expect.stringMatching(new RegExp(`/${hrefRoot}/${slug}-[A-z0-9]{6}.html`)) as unknown
      }
    });
  });

  it("makes the posts available, after a refresh from a blank slate.", async () => {
    await deleteDirectories(sourceDir, outputDir);

    const slug = "first-post";
    const postContent = "It has some content";
    await writeTextFiles(
      sourceDir,
      [{
        path: `./${slug}.md`,
        content: `# This is the first post\n\n${postContent}.`
      }, {
        path: "./first-post.post.json",
        content: JSON.stringify({
          title: "This is the first post",
          abstract: "This is the very first post.",
          publish: true
        }, null, 2)
      }]
    );

    await compilePosts();

    const manifest = await getPostManifest();

    const post = await getPost(manifest[slug].href);

    expect(post).toContain(postContent);
  });

  it("ignores unpublished articles.", async () => {
    await deleteDirectories(sourceDir, outputDir);

    const slug = "unfinished-post";
    await writeTextFiles(
      sourceDir,
      [{
        path: `./${slug}.md`,
        content: "# This a work inn progress.\n\nSome COntent."
      }, {
        path: `./${slug}.post.json`,
        content: JSON.stringify({
          title: "This an unfinished post",
          abstract: "Still a work in progress.",
          publish: false
        }, null, 2)
      }]
    );

    await compilePosts();

    const manifest = await getPostManifest();
    expect(manifest[slug]).not.toBeDefined();
  });

  it("ignores markdown files with no .post.json.", async () => {
    await deleteDirectories(sourceDir, outputDir);

    const slug = "not-a-post";
    await writeTextFiles(
      sourceDir,
      [{
        path: `./${slug}.md`,
        content: "# This is not a post.\n\nSome Content."
      }]
    );

    await compilePosts();

    const manifest = await getPostManifest();
    expect(manifest[slug]).not.toBeDefined();
  });

  it("ignores unpublished articles unless told to include them with the option.", async () => {
    await deleteDirectories(sourceDir, outputDir);

    const slug = "unfinished-post";
    await writeTextFiles(
      sourceDir,
      [{
        path: `./${slug}.md`,
        content: "# This a work inn progress.\n\nSome content."
      }, {
        path: `./${slug}.post.json`,
        content: JSON.stringify({
          title: "This an unfinished post",
          abstract: "Still a work in progress.",
          publish: false
        }, null, 2)
      }]
    );

    await compilePosts({ includeUnpublished: true });

    const manifest = await getPostManifest();
    expect(manifest[slug]).toBeDefined();
  });

  it("recurses the all the directories.", async () => {
    await deleteDirectories(sourceDir, outputDir);

    const slug = "first-post";
    const postContent = "It has some content";
    await writeTextFiles(
      sourceDir,
      [{
        path: `./sub-directory/${slug}.md`,
        content: [
          "# This is the first post",
          postContent
        ].join("\n")
      }, {
        path: `./sub-directory/${slug}.post.json`,
        content: JSON.stringify({
          title: "This is the first post",
          abstract: "This is the very first post.",
          publish: true
        }, null, 2)
      }]
    );

    await compilePosts();

    const manifest = await getPostManifest();

    const post = await getPost(manifest[slug].href);

    expect(post).toContain(postContent);
  });

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
    const manifest = await getPostManifest();
    return await getPost(manifest[slug].href);
  };

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
