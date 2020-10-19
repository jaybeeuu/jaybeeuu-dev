import { h, FunctionComponent, JSX, createRef, render } from "preact";
import { post as e2eHooks } from "@bickley-wallace/e2e-hooks";
import { useEffect } from "preact/hooks";
import { useValue } from "../../recoilless/use-value";
import { withPromise } from "../with-promise";
import { asRoute } from "../as-route";
import { currentPostHtml, currentPostSlug } from "../state";

import "./night-owl.css";
import { Icon } from "../icon";

const headingLinkSelector = "h1 a:empty, h2 a:empty, h3 a:empty, h4 a:empty, h5 a:empty, h6 a:empty";

const PostComponent = withPromise(({ value: post }: { value: string }): JSX.Element => {
  const articleRef = createRef<HTMLElement>();

  useEffect(() => {
    const links = articleRef.current?.querySelectorAll(headingLinkSelector);
    links?.forEach((link) => {
      render(<Icon name="link"/>, link);
    });
  }, [post]);

  return (
    <article
      ref={articleRef}
      className={e2eHooks.article}
      dangerouslySetInnerHTML={{ __html: post }}
    />
  );
});

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
