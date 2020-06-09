import { h, FunctionComponent } from "preact";
import { useApiCall } from "../../custom-hooks/useApiCall";
import { ApiCallStatus } from "../../utils/api";
import { titleBar } from "@bickley-wallace/e2e-hooks";

const ApiRoot: FunctionComponent = () => {
  const call = useApiCall("/posts", []);
  return (
    <pre className={titleBar.apiResults}>
      {call.status === ApiCallStatus.FAILED ? JSON.stringify({
        status: call.status,
        error: call.error.message ?? call.error
      }, null, 2) : JSON.stringify(call, null, 2)}
    </pre>
  );
};

export default ApiRoot;