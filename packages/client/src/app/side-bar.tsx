import { h, FunctionComponent } from "preact";
import { sideBar } from "@bickley-wallace/e2e-hooks";
import { ManifestContext } from "./manifest";
import { Link } from "preact-router";
import { useContext } from "preact/hooks";

export const SideBar: FunctionComponent = () => {
  const manifest = useContext(ManifestContext);

  return (
    <div className={sideBar.block}>
      <ul>
        {Object.values(manifest).map((meta) => (
          <li className={sideBar.post.id(meta.slug)} key={meta.slug}>
            <h3>
              <Link href={`/post/${meta.slug}`} className={sideBar.post.link}>{meta.title}</Link>
            </h3>
            <h4>{meta.lastUpdateDate}</h4>
            <summary className={sideBar.post.abstract}>{meta.abstract}</summary>
          </li>
        ))}
      </ul>
    </div>
  );
};

SideBar.displayName = "SideBar";
