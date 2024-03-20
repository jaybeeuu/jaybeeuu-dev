import type { UpdateOptions } from "packages/compost/src/posts/src/types";
import {
  cleanUpDirectories,
  getCompiledPostWithContent,
  getOutputFile,
} from "./helpers";

describe("images", () => {
  it("includes image tags in the compiled html.", async () => {
    await cleanUpDirectories();
    const post = await getCompiledPostWithContent({
      content: [
        "# This post needs an image",
        "![Here is the image!](./some-image.jpg)",
      ],
      otherFiles: [
        { path: "./some-image.jpg", content: "this is an image, honest." },
      ],
    });

    expect(post).toStrictEqual(
      expect.stringMatching(/<img( (alt|src)=".*?")+ \/>/),
    );
  });

  it("gives the image tags the correct alt attribute.", async () => {
    await cleanUpDirectories();
    const post = await getCompiledPostWithContent({
      content: [
        "# This post needs an image",
        "![Here is the image!](./some-image.jpg)",
      ],
      otherFiles: [
        { path: "./some-image.jpg", content: "this is an image, honest." },
      ],
    });

    expect(post).toStrictEqual(
      expect.stringContaining('alt="Here is the image!"'),
    );
  });

  it("transforms the src of the image tags, placing it in the hrefRoot.", async () => {
    await cleanUpDirectories();
    const post = await getCompiledPostWithContent(
      {
        content: [
          "# This post needs an image",
          "![Here is the image!](./some-image.jpg)",
        ],
        otherFiles: [
          { path: "./some-image.jpg", content: "this is an image, honest." },
        ],
      },
      { hrefRoot: "posts-root" },
    );

    expect(post).toStrictEqual(
      expect.stringContaining('src="/posts-root/some-image-j8Ri3I.jpg"'),
    );
  });

  it("leaves https urls intact.", async () => {
    await cleanUpDirectories();
    const updateOptions: Partial<UpdateOptions> = { hrefRoot: "posts-root" };
    const post = await getCompiledPostWithContent(
      {
        content: [
          "# This post needs an image",
          "![Here is the image!](https://somwhere.net/some-image.jpg)",
        ],
        otherFiles: [
          { path: "./some-image.jpg", content: "this is an image, honest." },
        ],
      },
      updateOptions,
    );

    expect(post).toStrictEqual(
      expect.stringContaining('src="https://somwhere.net/some-image.jpg"'),
    );
  });

  it("leaves http urls intact.", async () => {
    await cleanUpDirectories();
    const updateOptions: Partial<UpdateOptions> = { hrefRoot: "posts-root" };
    const post = await getCompiledPostWithContent(
      {
        content: [
          "# This post needs an image",
          "![Here is the image!](http://somwhere.net/some-image.jpg)",
        ],
        otherFiles: [
          { path: "./some-image.jpg", content: "this is an image, honest." },
        ],
      },
      updateOptions,
    );

    expect(post).toStrictEqual(
      expect.stringContaining('src="http://somwhere.net/some-image.jpg"'),
    );
  });

  it("copies the image into the output dir in the right place.", async () => {
    await cleanUpDirectories();
    const updateOptions: Partial<UpdateOptions> = { hrefRoot: "posts-root" };
    void (await getCompiledPostWithContent(
      {
        content: [
          "# This post needs an image",
          "![Here is the image!](./some-image.jpg)",
        ],
        otherFiles: [
          { path: "./some-image.jpg", content: "this is an image, honest." },
        ],
      },
      updateOptions,
    ));

    await expect(
      getOutputFile("some-image-j8Ri3I.jpg", updateOptions),
    ).resolves.toBe("this is an image, honest.");
  });
});
