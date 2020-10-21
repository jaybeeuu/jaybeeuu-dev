import path from "path";
import { advanceTo } from "jest-date-mock";
import { writeTextFiles, readTextFile, deleteDirectories } from "../../src/files";
import { PostManifest, UpdateOptions } from "../../src/posts/src/types";
import { update } from "../../src/posts";

const jestWorkerId = +(process.env.JEST_WORKER_ID || 0);
const sourceDir = path.resolve(`./fs/test/${jestWorkerId.toString()}/src`);
const outputDir = path.resolve(`./fs/test/${jestWorkerId.toString()}/out`);
const manifestFileName = "mainfest.json";

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

const compilePosts = async (options?: Partial<UpdateOptions>): Promise<void> => {
  await update({
    hrefRoot: "posts",
    manifestFileName,
    outputDir: path.join(outputDir, "posts"),
    sourceDir,
    watch: false,
    additionalWatchPaths: "",
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
      abstract: "This is the very first post."
    };
    await writeTextFiles(
      sourceDir,
      [{
        path: `./${slug}.md`,
        content: "# This is the first post\n\nIt has some content."
      }, {
        path: `./${slug}.json`,
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
        path: "./first-post.json",
        content: JSON.stringify({
          title: "This is the first post",
          abstract: "This is the very first post."
        }, null, 2)
      }]
    );

    await compilePosts();

    const manifest = await getPostManifest();

    const post = await getPost(manifest[slug].href);

    expect(post).toContain(postContent);
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
        path: `./sub-directory/${slug}.json`,
        content: JSON.stringify({
          title: "This is the first post",
          abstract: "This is the very first post."
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
        path: `./${slug}.json`,
        content: JSON.stringify({ title: "{title}", abstract: "abstract" }, null, 2)
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
      "<pre class=\"hljs\"><code><span class=\"hljs-built_in\">console</span>.log(<span class=\"hljs-string\">\"Here's a message\"</span>)</code></pre>"
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

    expect(post).toContain([
      "",
      "<h1>",
      `  <a class="hash-link" name="this-is-the-first-post" href="/${hrefRoot}/${slug}#this-is-the-first-post"></a>`,
      "  This is the first post",
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

    expect(post).toContain([
      "",
      "<h1>",
      `  <a class="hash-link" name="this-is-the-first-post" href="/${hrefRoot}/${slug}#this-is-the-first-post"></a>`,
      "  This is the first post",
      "</h1>",
      "<h1>",
      `  <a class="hash-link" name="this-is-the-first-post-1" href="/${hrefRoot}/${slug}#this-is-the-first-post-1"></a>`,
      "  This is the first post",
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

      expect(post).toContain([
        "",
        `<h${level}>`,
        `  <a class="hash-link" name="this-is-the-first-post" href="/${hrefRoot}/${slug}#this-is-the-first-post"></a>`,
        "  This is the first post",
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

    expect(post).toContain([
      "",
      "<h1>",
      `  <a class="hash-link" name="this-is-the-first-post" href="/${hrefRoot}/${slug}#this-is-the-first-post"></a>`,
      "  <a href=\"www.example.com\">This is the first post</a>",
      "</h1>"
    ].join("\n"));
  });
});
