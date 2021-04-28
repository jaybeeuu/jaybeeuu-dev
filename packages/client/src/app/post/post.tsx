import { h, FunctionComponent, JSX, createRef, render, RefObject } from "preact";
import { useEffect, useLayoutEffect } from "preact/hooks";
import classNames from "classnames";
import { PostMetaData } from "@bickley-wallace/compost";
import { assertIsString } from "@bickley-wallace/utilities";
import { post as e2eHooks } from "@bickley-wallace/e2e-hooks";
import { useAction, useValue } from "@bickley-wallace/preact-recoilless";
import { asRoute } from "../as-route";
import { Icon } from "../icon";
import { currentPostHtml, currentPostMeta, currentPostSlug, hideTitleBar as hideTitleBarAction } from "../state";
import { useBackgrounds } from "../use-background";
import { usePageInfo } from "../use-page-info";
import { withPromise } from "../with-promise";

import "./highlight-colours.css";
import "./highlight.css";

import css from "./post.module.css";

const useHashLinks = (postHtml: string, articleRef: RefObject<HTMLElement>): void => {
  const hideTitleBar = useAction(hideTitleBarAction);
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
          requestAnimationFrame(() => hideTitleBar());
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
    const links = articleRef.current?.querySelectorAll(".hash-link");

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
