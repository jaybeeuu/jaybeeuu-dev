import type { Result } from "@jaybeeuu/utilities";
import { success } from "@jaybeeuu/utilities";
import path from "path";
import { recurseDirectory } from "../files/index.js";
import type { UpdateOptions } from "./types.js";
import type {
  MakePostUpdaterFailureReason,
  PostUpdaterFailureReason,
} from "./processors/index.js";
import { makePostUpdater } from "./processors/index.js";

export type UpdateFailureReason =
  | MakePostUpdaterFailureReason
  | PostUpdaterFailureReason;

export const update = async (
  options: UpdateOptions,
): Promise<Result<void, UpdateFailureReason>> => {
  const updatePostResult = await makePostUpdater(options);
  if (!updatePostResult.success) {
    return updatePostResult;
  }

  const postUpdater = updatePostResult.value;
  const resolvedSourceDir = path.resolve(options.sourceDir);

  for await (const markdownFileInfo of recurseDirectory(resolvedSourceDir, {
    include: [/\.md$/],
  })) {
    const updateResult = await postUpdater.processFile(markdownFileInfo);
    if (!updateResult.success) {
      return updateResult;
    }
  }

  await postUpdater.postProcess();

  return success();
};
