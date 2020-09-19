import { post as postHooks } from "@bickley-wallace/e2e-hooks";
import { h, FunctionComponent } from "preact";
import { ManifestContext } from "./manifest";
import { useContext } from "preact/hooks";
import { withRequest } from "./with-request";
import { useTextRequest } from "../custom-hooks/use-request";
import { asRoute } from "./as-route";

import "./night-owl.css";

const PostComponent = withRequest<string>(({ response: post }) => (
  <article className={postHooks.article} dangerouslySetInnerHTML={{ __html: post }}/>
));

export type PostProps = { path: string, slug: string };

const Post: FunctionComponent<PostProps> = ({ slug }) => {
  const manifest = useContext(ManifestContext);
  const postMeta = manifest[slug];
  const postRequest = useTextRequest(`/posts/${postMeta.fileName}`);

  return <PostComponent request={postRequest} />;
};

Post.displayName = "Post";

export const PostRoute = asRoute(Post);
