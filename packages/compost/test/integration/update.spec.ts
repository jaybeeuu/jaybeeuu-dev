import path from "path";
import { advanceTo } from "jest-date-mock";
import { writeTextFiles, readTextFile, deleteDirectories } from "../../src/files";
import { PostManifest } from "../../src/posts/src/types";
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
  return JSON.parse(await getOutputFile(manifestFileName)) as PostManifest;
};

const getPost = (href: string): Promise<string> => {
  return getOutputFile(`.${href}`);
};

const compilePosts = async (): Promise<void> => {
  await update({
    outputDir,
    sourceDir,
    manifestFileName,
    watch: false
  });
};

describe("refresh", () => {
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

    await compilePosts();

    const manifest = await getPostManifest();

    expect(manifest).toStrictEqual({
      [slug]: {
        ...meta,
        publishDate: new Date(publishDate).toUTCString(),
        lastUpdateDate: null,
        slug,
        fileName: expect.stringMatching(new RegExp(`${slug}-[A-z0-9]{6}.html`)) as unknown,
        href: expect.stringMatching(new RegExp(`/${slug}-[A-z0-9]{6}.html`)) as unknown
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

  it("compiles a code block.", async () => {
    await deleteDirectories(sourceDir, outputDir);
    const slug = "first-post";
    const codeLine = "console.log(\"Here's a message\")";
    await writeTextFiles(
      sourceDir,
      [{
        path: `./${slug}.md`,
        content: [
          "# This is the first post",
          "This is the content",
          "```ts",
          codeLine,
          "```"
        ].join("\n")
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

    expect(post).toContain(
      "<pre><code><span class=\"hljs-built_in\">console</span>.log(<span class=\"hljs-string\">\"Here's a message\"</span>)</code></pre>"
    );
  });

  it("compiles a code block with no code type.", async () => {
    await deleteDirectories(sourceDir, outputDir);
    const slug = "first-post";
    const codeLine = "console.log(\"Here's a message\");";
    await writeTextFiles(
      sourceDir,
      [{
        path: `./${slug}.md`,
        content: [
          "# This is the first post",
          "This is the content",
          "```",
          codeLine,
          "```"
        ].join("\n")
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

    expect(post).toContain(codeLine);
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
});
