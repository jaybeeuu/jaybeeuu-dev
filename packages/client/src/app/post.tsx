import { post as postHooks } from "@bickley-wallace/e2e-hooks";
import { h, FunctionComponent, JSX } from "preact";
import { withPromise } from "./with-promise";
import { asRoute } from "./as-route";

import "./night-owl.css";
import { useValue } from "../recoilless/use-value";
import { currentPostHtml, currentPostSlug } from "./state";
import { useEffect } from "preact/hooks";

const PostComponent = withPromise(({ value: post }: { value: string }): JSX.Element => (
  <article className={postHooks.article} dangerouslySetInnerHTML={{ __html: post }}/>
));

export type PostProps = { path: string, slug: string };

const Post: FunctionComponent<PostProps> = ({ slug }) => {
  const [selectedSlug, setSlug] = useValue(currentPostSlug);
  useEffect(() => {
    setSlug(slug);
  }, [slug]);
  if (!selectedSlug) {
    return null;
  }

  const htmlPromise = useValue(currentPostHtml);
  return <PostComponent promise={htmlPromise} />;
};

Post.displayName = "Post";

export const PostRoute = asRoute(Post);
