import { h, FunctionComponent, JSX, createRef, render } from "preact";
import { useEffect } from "preact/hooks";
import { PostMetaData } from "@bickley-wallace/compost";
import { post as e2eHooks } from "@bickley-wallace/e2e-hooks";
import { useValue } from "@bickley-wallace/preact-recoilless";
import classNames from "classnames";
import { withPromise } from "../with-promise";
import { asRoute } from "../as-route";
import { Icon } from "../icon";
import { currentPostHtml, currentPostMeta, currentPostSlug } from "../state";

import "./highlight-colours.css";
import "./highlight.css";

import css from "./post.module.css";
import { usePageInfo } from "../use-page-info";
import { useBackgrounds } from "../use-background";

const headingLinkSelector = "h1 a:empty, h2 a:empty, h3 a:empty, h4 a:empty, h5 a:empty, h6 a:empty";

const PostComponent = withPromise(({ postHtml, postMeta }: { postHtml: string, postMeta: PostMetaData }): JSX.Element => {
  const articleRef = createRef<HTMLElement>();
  usePageInfo({ title: postMeta.title, description: postMeta.abstract });
  useEffect(() => {
    const links = articleRef.current?.querySelectorAll(headingLinkSelector);
    links?.forEach((link) => {
      render(<Icon name="link"/>, link);
    });
    if (window.location.hash) {
      const hashLinkName = window.location.hash.replace("#", "");
      document.querySelector(`.hash-link[name="${hashLinkName}"]`)?.scrollIntoView();
    }
  }, [postHtml]);

  return (
    <div className={classNames(css.componentRoot, e2eHooks.article)}>
      <div>
        <h1 className={css.title}>{postMeta.title}</h1>
        <h4 className={css.date}>{new Date(postMeta.lastUpdateDate ?? postMeta.publishDate).toLocaleDateString()}</h4>
      </div>
      <article
        ref={articleRef}
        dangerouslySetInnerHTML={{ __html: postHtml }}
      />
    </div>
  );
});

export type PostProps = { path: string, slug: string };

const Post: FunctionComponent<PostProps> = ({ slug }) => {
  useBackgrounds({ dark: "moon", light: "blackTusk" });

  const [selectedSlug, setSlug] = useValue(currentPostSlug);
  useEffect(() => {
    setSlug(slug);
  }, [slug]);

  if (!selectedSlug) {
    return null;
  }

  const postMeta = useValue(currentPostMeta);
  const postHtml = useValue(currentPostHtml);
  return <PostComponent {...{ postMeta, postHtml }} />;
};

Post.displayName = "Post";

export const PostRoute = asRoute(Post);
