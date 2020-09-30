import { h, VNode } from "preact";
import { PostManifest } from "@bickley-wallace/compost";
import { sideBar as e2eHooks } from "@bickley-wallace/e2e-hooks";
import classNames from "classnames";
import { Link } from "preact-router";

import { useValue } from "../recoilless/use-value";
import { postsManifest } from "./state";
import { ThemeToggle } from "./theme-toggle";
import { withPromise as withPromise } from "./with-promise";

import css from "./side-bar.module.css";

const PostList = withPromise(({ value: manifest }: { value: PostManifest }) => {
  return (
    <ul>
      {Object.values(manifest).map((meta) => (
        <li className={e2eHooks.post.id(meta.slug)} key={meta.slug}>
          <h3>
            <Link href={`/post/${meta.slug}`} className={e2eHooks.post.link}>{meta.title}</Link>
          </h3>
          <h4>{meta.lastUpdateDate}</h4>
          <summary className={e2eHooks.post.abstract}>{meta.abstract}</summary>
        </li>
      ))}
    </ul>
  );
});

PostList.displayName = "SideBarWithManifest";

export const Sidebar = (): VNode<any> => {
  const manifest = useValue(postsManifest);
  return (
    <div className={classNames(css.element, e2eHooks.block)}>
      <ThemeToggle />
      <PostList promise={manifest} />;
    </div>
  );
};
Sidebar.displayName  = "Sidebar";

