import { h, FunctionComponent } from "preact";
import { useApiCall } from "../../custom-hooks/useApiCall";
import { ApiCallStatus } from "../../utils/api";

const ApiRoot: FunctionComponent = () => {
  const message = useApiCall("/ping", []);
  return (
    <pre>
      {message.status === ApiCallStatus.FAILED ? JSON.stringify({
        status: message.status,
        error: message.error.message ?? message.error
      }, null, 2) : JSON.stringify(message, null, 2)}
    </pre>
  );
};

export default ApiRoot;