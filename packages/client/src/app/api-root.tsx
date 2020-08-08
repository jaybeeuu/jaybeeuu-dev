import { h, FunctionComponent } from "preact";
import { sideBar } from "@bickley-wallace/e2e-hooks";
import { useApiCall } from "../custom-hooks/use-api-call";
import { ApiCallStatus } from "../utils/api";

const ApiRoot: FunctionComponent = () => {
  const call = useApiCall("/posts/manifest.json");
  return (
    <pre className={sideBar.apiResults}>
      {call.status === ApiCallStatus.FAILED ? JSON.stringify({
        status: call.status,
        error: call.error.message ?? call.error
      }, null, 2) : JSON.stringify(call, null, 2)}
    </pre>
  );
};

export default ApiRoot;