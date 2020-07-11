import path from "path";
import rmfr from "rmfr";
import { advanceTo } from "jest-date-mock";
import { writeTextFiles, readTextFile } from "../../src/files";
import { PostManifest } from "../../src/posts/src/types";
import { update } from "../../src/posts";

const jestWorkerId = +(process.env.JEST_WORKER_ID || 0);
const sourceDir = path.resolve(`./fs/test/${jestWorkerId.toString()}/src`);
const outputDir = path.resolve(`./fs/test/${jestWorkerId.toString()}/out`);
const manifestFileName = "post-mainfest.json";

const getOutputFile = async (filePath: string): Promise<string> => {
  const resolvedManifestFilePath = path.resolve(outputDir, filePath);
  return readTextFile(resolvedManifestFilePath);
};

const getPostManifest = async (): Promise<PostManifest> => {
  return JSON.parse(await getOutputFile(manifestFileName));
};

const getPost = (href: string): Promise<string> => {
  return getOutputFile(`.${href}`);
};

const compilePosts = async (): Promise<void> => {
  await update({
    outputDir,
    sourceDir,
    manifestFileName
  });
};

const cleanUpDirectories = (...directories: string[]): Promise<void[]> => Promise.all(
  directories.map((directory) => rmfr(directory))
);

describe("refresh", () => {
  it("makes the post available in the manifest on /post, after a refresh from a blank slate.", async () => {
    await cleanUpDirectories(sourceDir, outputDir);

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
        fileName: expect.stringMatching(new RegExp(`${slug}-[A-z0-9]{6}.html`)),
        href: expect.stringMatching(new RegExp(`/posts/${slug}-[A-z0-9]{6}.html`))
      }
    });
  });

  it("makes the posts available, after a refresh from a blank slate.", async () => {
    await cleanUpDirectories();

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
});