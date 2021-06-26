import {
  compilePosts,
  getPost,
  getPostManifest,
  outputDir,
  sourceDir
} from "./helpers";

import { advanceTo } from "jest-date-mock";
import {
  deleteDirectories,
  writeTextFiles
} from "../../src/files/index";

describe("file-selection", () => {
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
});
