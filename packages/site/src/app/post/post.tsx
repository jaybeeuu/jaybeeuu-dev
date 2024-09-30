import type { PostMetaData } from "@jaybeeuu/compost";
import { post as e2eHooks } from "@jaybeeuu/e2e-hooks";
import { useAction, useValue } from "@jaybeeuu/preact-recoilless";
import type { TypeAssertion } from "@jaybeeuu/is";
import { assert, assertIsNotNullish, is } from "@jaybeeuu/is";
import classNames from "classnames";
import type { JSX, RefObject } from "preact";
import { createRef, h, render, Fragment } from "preact";
import { useEffect, useLayoutEffect } from "preact/hooks";
import { FouOhFour } from "../four-oh-four";
import { asRoute } from "../as-route";
import { Icon } from "../icon";
import type { PostHtmlLookupResult, PostMetaDataLookupResult } from "../state";
import {
  currentPostHtml,
  currentPostMeta,
  currentPostSlug,
  hideTitleBar as hideTitleBarAction,
} from "../state";
import { useBackgrounds } from "../use-background";
import { usePageInfo } from "../use-page-info";
import { withPromise } from "../with-promise";
import css from "./post.module.css";

const assertIsString: TypeAssertion<string> = assert(is("string"));

const useHashLinks = (
  postHtml: string,
  articleRef: RefObject<HTMLElement>,
): void => {
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
          requestAnimationFrame(() => {
            hideTitleBar();
          });
          e.stopPropagation();
          e.preventDefault();
        });
      });
  }, [postHtml]);
};

interface PostComponentProps {
  postHtml: string;
  postMeta: PostMetaData;
}

const Post = withPromise(
  ({ postHtml, postMeta }: PostComponentProps): JSX.Element => {
    const articleRef = createRef<HTMLElement>();
    usePageInfo({ title: postMeta.title, description: postMeta.abstract });
    useLayoutEffect(() => {
      const links = articleRef.current?.querySelectorAll(".hash-link");

      links?.forEach((link) => {
        const title = link.getAttribute("title");
        assertIsNotNullish(title);
        render(<Icon title={title} name="link" />, link);
      });

      if (window.location.hash) {
        document.querySelector(window.location.hash)?.scrollIntoView();
      }
    }, [postHtml]);

    useHashLinks(postHtml, articleRef);

    return (
      <div className={classNames(css.componentRoot, e2eHooks.block)}>
        <div>
          <article ref={articleRef} className={css.article}>
            <hgroup className={e2eHooks.header}>
              <h1 className={css.title}>{postMeta.title}</h1>
              <div className={css.metaDataRow}>
                <span>
                  <time
                    dateTime={new Date(
                      postMeta.publishDate,
                    ).toLocaleDateString()}
                  >
                    {new Date(postMeta.publishDate).toLocaleDateString()}
                  </time>
                  {postMeta.lastUpdateDate ? (
                    <Fragment>
                      &nbsp;
                      <time dateTime={postMeta.lastUpdateDate}>
                        (updated{" "}
                        {new Date(postMeta.lastUpdateDate).toLocaleDateString()}
                        )
                      </time>
                    </Fragment>
                  ) : null}
                </span>
                <span>{postMeta.readingTime.text}</span>
              </div>
            </hgroup>
            <div
              className={e2eHooks.article}
              dangerouslySetInnerHTML={{ __html: postHtml }}
            />
          </article>
        </div>
      </div>
    );
  },
);
Post.displayName = "PostComponent";

interface PostLookupResultProps {
  postHtmlLookupResult: PostHtmlLookupResult;
  postMetaLookupResult: PostMetaDataLookupResult;
}

const PostLookupResult = withPromise(
  ({
    postHtmlLookupResult,
    postMetaLookupResult,
  }: PostLookupResultProps): JSX.Element => {
    if (postHtmlLookupResult.success && postMetaLookupResult.success) {
      return (
        <Post
          postHtml={postHtmlLookupResult.value}
          postMeta={postMetaLookupResult.value}
        />
      );
    }

    return <FouOhFour />;
  },
);
PostLookupResult.displayName = "PostLookupResult";

export interface PostLookupProps {
  slug: string;
}

const PostLookup = ({ slug }: PostLookupProps): JSX.Element | null => {
  useBackgrounds({ dark: "moon", light: "black-tusk" });

  const [, setSlug] = useValue(currentPostSlug);
  useEffect(() => {
    setSlug(slug);
  }, [slug]);
  const postMetaLookupResult = useValue(currentPostMeta);
  const postHtmlLookupResult = useValue(currentPostHtml);

  return (
    <PostLookupResult
      postMetaLookupResult={postMetaLookupResult}
      postHtmlLookupResult={postHtmlLookupResult}
    />
  );
};
PostLookup.displayName = "PostLookup";

export const PostRoute = asRoute(PostLookup);
