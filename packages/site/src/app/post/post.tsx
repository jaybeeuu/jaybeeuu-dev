import type { JSX, RefObject } from "preact";
import { h, createRef, render } from "preact";
import { useEffect, useLayoutEffect } from "preact/hooks";
import classNames from "classnames";
import type { PostMetaData } from "@jaybeeuu/compost";
import { assertIsNotNullish, assertIsString } from "@jaybeeuu/utilities";
import { post as e2eHooks } from "@jaybeeuu/e2e-hooks";
import { useAction, useValue } from "@jaybeeuu/preact-recoilless";
import { asRoute } from "../as-route";
import { Icon } from "../icon";
import { currentPostHtml, currentPostMeta, currentPostSlug, hideTitleBar as hideTitleBarAction } from "../state";
import { useBackgrounds } from "../use-background";
import { usePageInfo } from "../use-page-info";
import { withPromise } from "../with-promise";

import css from "./post.module.css";

const useHashLinks = (postHtml: string, articleRef: RefObject<HTMLElement>): void => {
  const hideTitleBar = useAction(hideTitleBarAction);
  useLayoutEffect(() => {
    const currentArticle = articleRef.current;
    if (!currentArticle) {
      return;
    }
    const links = currentArticle.querySelectorAll("a");
    Array.from(links)
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
      const title = link.getAttribute("title");
      assertIsNotNullish(title);
      render(
        <Icon
          title={title}
          name="link"
        />,
        link
      );
    });

    if (window.location.hash) {
      document.querySelector(window.location.hash)?.scrollIntoView();
    }
  }, [postHtml]);

  useHashLinks(postHtml, articleRef);

  return (
    <div className={classNames(css.componentRoot, e2eHooks.article)}>
      <div>
        <article ref={articleRef} className={css.article}>
          <h1 className={css.title}>{postMeta.title}</h1>
          <div className={css.date}>
            {new Date(postMeta.publishDate).toLocaleDateString()}
            {postMeta.lastUpdateDate ? ` (updated ${new Date(postMeta.lastUpdateDate).toLocaleDateString()})` : null}
          </div>
          <div
            dangerouslySetInnerHTML={{ __html: postHtml }}
          />
        </article>
      </div>
    </div>
  );
});
PostComponent.displayName = "PostComponent";

export interface PostProps {
  slug: string;
}

const Post = ({ slug }: PostProps): JSX.Element | null => {
  useBackgrounds({ dark: "moon", light: "black-tusk" });

  const [selectedSlug, setSlug] = useValue(currentPostSlug);
  useEffect(() => setSlug(slug), [slug]);

  if (!selectedSlug) {
    return null;
  }

  const postMeta = useValue(currentPostMeta);
  const postHtml = useValue(currentPostHtml);
  return <PostComponent {...{ postMeta, postHtml }} />;
};
Post.displayName = "Post";

export const PostRoute = asRoute(Post);

