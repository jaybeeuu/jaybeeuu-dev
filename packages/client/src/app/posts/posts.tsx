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

const compareDateString = (
  left: PostMetaData,
  right: PostMetaData
): number => Date.parse(left.publishDate) - Date.parse(right.publishDate);

const PostList = withPromise(({ manifest }: { manifest: PostManifest }) => {
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
  return (
    <PostList manifest={manifest} />
  );
});
