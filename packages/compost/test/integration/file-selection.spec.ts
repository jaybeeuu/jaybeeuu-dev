import {
  cleanUpDirectories,
  compilePosts,
  getPost,
  getPostManifest,
  writePostFiles
} from "./helpers";

describe("file-selection", () => {
  it("ignores unpublished articles.", async () => {
    await cleanUpDirectories();

    const slug = "unfinished-post";
    await writePostFiles({
      slug,
      content: [
        "# This a work in progress.",
        "Some Content."
      ],
      meta: {
        title: "This an unfinished post",
        abstract: "Still a work in progress.",
        publish: false
      }
    });

    await compilePosts();

    const manifest = await getPostManifest();

    expect(manifest[slug]).not.toBeDefined();
  });

  it("ignores markdown files with no .post.json.", async () => {
    await cleanUpDirectories();

    const slug = "not-a-post";
    await writePostFiles({
      slug,
      content: [
        "# This is not a post.",
        "Some Content."
      ],
      meta: null
    });

    await compilePosts();

    const manifest = await getPostManifest();
    expect(manifest[slug]).not.toBeDefined();
  });

  it("ignores unpublished articles unless told to include them with the option.", async () => {
    await cleanUpDirectories();

    const slug = "unfinished-post";
    await writePostFiles({
      slug,
      content: [
        "# This a work in progress.",
        "Some content."
      ],
      meta: {
        title: "This an unfinished post",
        abstract: "Still a work in progress.",
        publish: false
      }
    });

    await compilePosts({ includeUnpublished: true });

    const manifest = await getPostManifest();
    expect(manifest[slug]).toBeDefined();
  });

  it("recurses the all the directories.", async () => {
    await cleanUpDirectories();

    const slug = "first-post";
    const postContent = "It has some content";
    await writePostFiles({
      slug,
      path: "./sub-directory",
      content: [
        "# This is the first post",
        postContent
      ],
      meta: {
        title: "This is the first post",
        abstract: "This is the very first post.",
        publish: true
      }
    });

    await compilePosts();

    const post = await getPost(slug);

    expect(post).toContain(postContent);
  });
});
