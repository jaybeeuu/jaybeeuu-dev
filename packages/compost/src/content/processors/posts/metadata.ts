import { is, isObject } from "@jaybeeuu/is";
import type { PostMetaFileData } from "./types.js";

export const isPostMetaData = isObject<PostMetaFileData>({
  abstract: is("string"),
  publish: is("boolean"),
  title: is("string"),
});
