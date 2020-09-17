import { h, FunctionComponent } from "preact";
import { useMemo } from "preact/hooks";
import { PostManifest } from "@bickley-wallace/compost";
import { createContext, VNode, ComponentChildren } from "preact";
import { Request } from "../utils/request";
import { useJsonRequest } from "../custom-hooks/use-request";
import { withRequest } from "./with-request";

export const ManifestContext = createContext<PostManifest>({});

const makeContentComponent = (
  content: ComponentChildren
): FunctionComponent<{ request: Request<PostManifest> }> => withRequest<PostManifest>(
  ({ response }) => (
    <ManifestContext.Provider value={response}>
      {content}
    </ManifestContext.Provider>
  )
);

export const Manifest = ({ children }: { children: ComponentChildren }): VNode => {
  const request = useJsonRequest<PostManifest>("/posts/manifest.json");
  const ContentComponent = useMemo(
    () => makeContentComponent(children),
    [children]
  );
  return (
    <div>
      <ContentComponent request={request} />
    </div>
  );
};

