import { h, FunctionComponent, JSX, createRef, render, RefObject } from "preact";
import { useEffect, useLayoutEffect } from "preact/hooks";
import classNames from "classnames";
import { PostMetaData } from "@bickley-wallace/compost";
import { assertIsString } from "@bickley-wallace/utilities";
import { post as e2eHooks } from "@bickley-wallace/e2e-hooks";
import { useValue } from "@bickley-wallace/preact-recoilless";
import { asRoute } from "../as-route";
import { Icon } from "../icon";
import { currentPostHtml, currentPostMeta, currentPostSlug } from "../state";
import { useBackgrounds } from "../use-background";
import { usePageInfo } from "../use-page-info";
import { withPromise } from "../with-promise";

import "./highlight-colours.css";
import "./highlight.css";

import css from "./post.module.css";

const headingLinkSelector = "h1 a:empty, h2 a:empty, h3 a:empty, h4 a:empty, h5 a:empty, h6 a:empty";

const useHashLinks = (postHtml: string, articleRef: RefObject<HTMLElement>): void => {
  useLayoutEffect(() => {
    const currentArticle = articleRef.current;
    if (!currentArticle) {
      return;
    }
    const links = currentArticle.querySelectorAll("a");
    Array.from(links ?? [])
      .filter((link) => link.getAttribute("href")?.startsWith("#"))
      .forEach((link) => {
        link.addEventListener("click", (e) => {
          const href = link.getAttribute("href");
          assertIsString(href);
          window.location.hash = href;
          const destinationElement = currentArticle.querySelector(href);
          destinationElement?.scrollIntoView({ behavior: "smooth" });
          e.stopPropagation();
          e.preventDefault();
        });
      });
  }, [postHtml]);
};

const PostComponent = withPromise(({ postHtml, postMeta }: { postHtml: string, postMeta: PostMetaData }): JSX.Element => {
  const articleRef = createRef<HTMLElement>();
  usePageInfo({ title: postMeta.title, description: postMeta.abstract });
  useLayoutEffect(() => {
    const links = articleRef.current?.querySelectorAll(headingLinkSelector);

    links?.forEach((link) => {
      render(<Icon name="link"/>, link);
    });

    if (window.location.hash) {
      document.querySelector(window.location.hash)?.scrollIntoView();
    }
  }, [postHtml]);

  useHashLinks(postHtml, articleRef);

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
