import { update as updateRepo } from "./repo/index";
import { update as updatePosts } from "./posts/index";

const doSomething = async (): Promise<void> => {
  await updateRepo();
  const updateResult = await updatePosts();
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(updateResult, null, 2));
};

doSomething();