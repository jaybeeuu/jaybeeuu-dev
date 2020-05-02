import { h, FunctionComponent } from "preact";
import { useApiCall } from "../../custom-hooks/useApiCall";

const ApiRoot: FunctionComponent = () => {
  const message = useApiCall("/ping");
  return (
    <pre>
      {JSON.stringify(message, null, 2)}
    </pre>
  );
};

export default ApiRoot;