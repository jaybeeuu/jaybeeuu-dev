import path from "path";
import { fetch, Verbs } from "../../../../test/fetch";
import { cleanUpDirectories, setupDirectories } from "../../../../test/files";
import { useServer } from "../../../../test/server";
import { POST_REPO_DIRECTORY, POST_REPO_REMOTE } from "../../../env";

describe("refresh", () => {
  useServer();

  it("clones the repo is one does not already exist.", async () => {
    await cleanUpDirectories();
    const testFiles = path.join(__dirname, "test-files/no-local-repo");
    await setupDirectories(testFiles);

    const response = await fetch("/refresh", { method: Verbs.POST })
      .then((response) => response.json());

    expect(response).toBe("Success!");
    expect(POST_REPO_DIRECTORY).toMatchDirectory(POST_REPO_REMOTE);
  });
});