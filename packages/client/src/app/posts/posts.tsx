import type { VNode } from "preact";
import { h } from "preact";
import type { PostManifest, PostMetaData } from "@bickley-wallace/compost";
import { postList as e2eHooks } from "@bickley-wallace/e2e-hooks";
import { useValue } from "@bickley-wallace/preact-recoilless";
import classNames from "classnames";
import { Link } from "preact-router";
import { asRoute } from "../as-route";
import { useBackgrounds as useBackgrounds } from "../use-background";
import { usePageInfo } from "../use-page-info";
import { postsManifest } from "../state";
import { withPromise as withPromise } from "../with-promise";

import css from "./posts.module.css";

const compareDateString = (
  left: PostMetaData,
  right: PostMetaData
): number => Date.parse(left.publishDate) - Date.parse(right.publishDate);

const PostList = withPromise(({ manifest }: { manifest: PostManifest }) => {
  usePageInfo({ title: "Blog posts", description: "Index of my blog posts" });
  const manifestValues = Object.values(manifest);
  return (
    <div className={classNames(css.componentRoot, e2eHooks.block)}>
      {manifestValues.length === 0
        ? "Nothing to see? Write some posts..."
        : manifestValues.sort(compareDateString).map((meta) => (
          <Link
            href={`/posts/${meta.slug}`}
            className={classNames(css.post, e2eHooks.link(meta.slug))}
            key={meta.slug}
          >
            <h2 className={css.title}>
              {meta.title}
            </h2>
            <p className={css.date}>
              {new Date(meta.lastUpdateDate ?? meta.publishDate).toLocaleDateString()}
            </p>
            <summary>{meta.abstract}</summary>
          </Link>
        ))}
    </div>
  );
});
PostList.displayName = "PostList";

export const PostsRoute = asRoute((): VNode<any> => {
  useBackgrounds({ dark: "greatNorthernHighway", light: "kew" });
  const manifest = useValue(postsManifest);
  return <PostList manifest={manifest} />;
});
