import { h, VNode } from "preact";
import { PostManifest, PostMetaData } from "@bickley-wallace/compost";
import { postList as e2eHooks } from "@bickley-wallace/e2e-hooks";
import { useValue } from "@bickley-wallace/preact-recoiless";
import classNames from "classnames";
import { Link } from "preact-router";
import { asRoute } from "../as-route";
import { postsManifest } from "../state";
import { withPromise as withPromise } from "../with-promise";

import css from "./posts.module.css";
import { usePageInfo } from "../use-page-info";
import { useBackgrounds as useBackgrounds } from "../use-background";

const compareDateString = (
  left: PostMetaData,
  right: PostMetaData
): number => Date.parse(left.publishDate) - Date.parse(right.publishDate);

const PostList = withPromise(({ manifest }: { manifest: PostManifest }) => {
  usePageInfo({ title: "Blog posts", description: "Index of my blog posts" });

  return (
    <div className={classNames(css.componentRoot, e2eHooks.block)}>
      {Object.values(manifest).sort(compareDateString).map((meta) => (
        <Link
          href={`/posts/${meta.slug}`}
          className={classNames(css.post, e2eHooks.link(meta.slug))}
          key={meta.slug}
        >
          <div className={css.titleRow}>
            <h2>
              {meta.title}
            </h2>
            <span className={css.date}>{new Date(meta.lastUpdateDate ?? meta.publishDate).toLocaleDateString()}</span>
          </div>
          <summary>{meta.abstract}</summary>
        </Link>
      ))}
    </div>
  );
});
PostList.displayName = "PostList";

export const PostsRoute = asRoute((): VNode<any> => {
  const manifest = useValue(postsManifest);
  useBackgrounds({ dark: "greatNorthernHighway", light: "kew" });
  return <PostList manifest={manifest} />;
});
