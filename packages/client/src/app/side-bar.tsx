import classNames from "classnames";
import { h, FunctionComponent } from "preact";
import { sideBar as e2eHooks } from "@bickley-wallace/e2e-hooks";
import { ManifestContext } from "./manifest";
import { Link } from "preact-router";
import { useContext } from "preact/hooks";

import css from "./side-bar.module.css";

export const SideBar: FunctionComponent = () => {
  const manifest = useContext(ManifestContext);

  return (
    <div className={classNames(css.block, e2eHooks.block)}>
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
    </div>
  );
};

SideBar.displayName = "SideBar";
