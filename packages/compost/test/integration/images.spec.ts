import type { UpdateOptions } from "packages/compost/src/posts/src/types";
import {
  getCompiledPostWithContent, getOutputFile
} from "./helpers";

describe("images", () => {
  it("includes image tags in the compiled html.", async () => {
    const post = await getCompiledPostWithContent({
      content: [
        "# This post needs an image",
        "![Here is the image!](./some-image.jpg)"
      ],
      otherFiles: [
        { path: "./some-image.jpg", content: "this is an image, honest." }
      ]
    });

    expect(post).toStrictEqual(
      expect.stringMatching(
        /<img( (alt|src)=".*?")+ \/>/
      )
    );
  });

  it("gives the image tags the correct alt attribute.", async () => {
    const post = await getCompiledPostWithContent({
      content: [
        "# This post needs an image",
        "![Here is the image!](./some-image.jpg)"
      ],
      otherFiles: [
        { path: "./some-image.jpg", content: "this is an image, honest." }
      ]
    });

    expect(post).toStrictEqual(
      expect.stringContaining(
        "alt=\"Here is the image!\""
      )
    );
  });

  it("transforms the src of the image tags, placing it in the hrefRoot.", async () => {
    const post = await getCompiledPostWithContent({
      content: [
        "# This post needs an image",
        "![Here is the image!](./some-image.jpg)"
      ],
      otherFiles: [
        { path: "./some-image.jpg", content: "this is an image, honest." }
      ]
    }, { hrefRoot: "posts-root" });

    expect(post).toStrictEqual(
      expect.stringContaining(
        "src=\"posts-root/some-image-j8Ri3I.jpg\""
      )
    );
  });

  it("copies the image into the output dir in the right place.", async () => {
    const updateOptions: Partial<UpdateOptions> = { hrefRoot: "posts-root" };
    void await getCompiledPostWithContent({
      content: [
        "# This post needs an image",
        "![Here is the image!](./some-image.jpg)"
      ],
      otherFiles: [
        { path: "./some-image.jpg", content: "this is an image, honest." }
      ]
    }, updateOptions);

    expect(
      await getOutputFile("some-image-j8Ri3I.jpg", updateOptions)
    ).toBe(
      "this is an image, honest."
    );
  });
});
