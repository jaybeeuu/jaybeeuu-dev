import { h, FunctionComponent } from "preact";
import { sideBar } from "@bickley-wallace/e2e-hooks";
import { PostManifest } from "@bickley-wallace/compost";
import { useFetchAsset } from "../custom-hooks/use-fetch";
import { FetchStatus } from "../utils/fetch";

const SideBar: FunctionComponent = () => {
  const call = useFetchAsset<PostManifest>("/posts/manifest.json");
  return (
    <div className={sideBar.block}>
      {call.status !== FetchStatus.COMPLETE ? (
        <pre>{ JSON.stringify(call, null, 2) }</pre>
      ) : (
        <ul>
          {Object.values(call.response).map((meta) => (
            <li className={sideBar.post.id(meta.slug)} key={meta.slug}>
              <h3><a href={meta.href} className={sideBar.post.link}>{meta.title}</a></h3>
              <h4>{meta.lastUpdateDate}</h4>
              <summary className={sideBar.post.abstract}>{meta.abstract}</summary>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

SideBar.displayName = "SideBar";

export default SideBar;
