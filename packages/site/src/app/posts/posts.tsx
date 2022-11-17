import type { JSX } from "preact";
import { h } from "preact";
import type { PostManifest, PostMetaData } from "@jaybeeuu/compost";
import { postList as e2eHooks } from "@jaybeeuu/e2e-hooks";
import { useValue } from "@jaybeeuu/preact-recoilless";
import classNames from "classnames";
import { Link } from "preact-router/match";
import { asRoute } from "../as-route";
import { useBackgrounds as useBackgrounds } from "../use-background";
import { usePageInfo } from "../use-page-info";
import { postsManifest } from "../state";
import { withPromise as withPromise } from "../with-promise";

import css from "./posts.module.css";

const compareDateString = (
  left: PostMetaData,
  right: PostMetaData
): number => Date.parse(right.publishDate) - Date.parse(left.publishDate);

const PostList = withPromise(({ manifest }: { manifest: PostManifest }) => {
  usePageInfo({ title: "Blog posts", description: "Index of my blog posts" });
  const manifestValues = Object.values(manifest);
  return (
    <div className={classNames(css.componentRoot, e2eHooks.block)}>
      {manifestValues.length === 0
        ? "Nothing to see? Write some posts..."
        : manifestValues.sort(compareDateString).map((meta) => (
          <Link
            href={`/blog/${meta.slug}`}
            className={classNames(
              css.post,
              e2eHooks.link,
              e2eHooks.sluggedLink(meta.slug)
            )}
            key={meta.slug}
            data-slug={meta.slug}
          >
            <h2 className={css.title}>
              {meta.title}
            </h2>
            <p className={css.date}>
              {new Date(meta.publishDate).toLocaleDateString()}
            </p>
            <summary>{meta.abstract}</summary>
          </Link>
        ))}
    </div>
  );
});
PostList.displayName = "PostList";

export const PostsRoute = asRoute((): JSX.Element => {
  useBackgrounds({ dark: "great-northern-highway", light: "kew" });
  const manifest = useValue(postsManifest);
  return <PostList manifest={manifest} />;
});
