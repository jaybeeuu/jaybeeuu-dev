import path from "path";
import { PostMetaData } from "./types";
import { FileInfo, canAccess, readTextFile } from "../../files";
import { Result, failure, success } from "../../results";
import { MARKDOWN_FILE_EXTENSION } from "./constants";

export type PostMetaFileData = Pick<PostMetaData, "abstract" | "title">;

const isPostMetaFile = (x: any): x is PostMetaFileData => {
  if (typeof x !== "object") {
    return false;
  }

  return typeof x.abstract === "string"
    && typeof x.title === "string";
};

export const getMetaFileContent = async (markdownFileInfo: FileInfo): Promise<Result<PostMetaFileData>> => {
  const metaFileName = markdownFileInfo.fileName.replace(MARKDOWN_FILE_EXTENSION, ".json");
  const metaFilePath = path.join(markdownFileInfo.absolutePath, metaFileName);

  if (! await canAccess(metaFilePath)) {
    return failure(`Metafile ${metaFileName} for the post ${markdownFileInfo.fileName} was missing.`);
  }

  const metaFileContent = await readTextFile(metaFilePath);
  const metadata = JSON.parse(metaFileContent);

  if (isPostMetaFile(metadata)) {
    return success(metadata);
  } else {
    return failure(
      `Metadata for ${markdownFileInfo.fileName} in ${metaFileName} does not contain the expected information.`
    );
  }
};
