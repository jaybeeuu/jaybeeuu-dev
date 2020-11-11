import { h, VNode } from "preact";
import { PostManifest, PostMetaData } from "@bickley-wallace/compost";
import { postList as e2eHooks } from "@bickley-wallace/e2e-hooks";
import classNames from "classnames";
import { Link } from "preact-router";
import { useValue } from "../../recoilless/use-value";
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
    <div className={classNames(css.element, e2eHooks.block)}>
      <ul>
        {Object.values(manifest).sort(compareDateString).map((meta) => (
          <li className={e2eHooks.id(meta.slug)} key={meta.slug}>
            <h3>
              <Link href={`/posts/${meta.slug}`} className={e2eHooks.link}>{meta.title}</Link>
            </h3>
            <h4>{meta.lastUpdateDate ?? meta.publishDate}</h4>
            <summary className={e2eHooks.abstract}>{meta.abstract}</summary>
          </li>
        ))}
      </ul>
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
