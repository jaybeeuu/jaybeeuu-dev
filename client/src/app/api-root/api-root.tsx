import React, { ReactElement } from "react";
import { useApiCall } from "../../custom-hooks/useApiCall";

const ApiRoot = (): ReactElement => {
  const message = useApiCall("/");
  return (
    <pre>
      {JSON.stringify(message, null, 2)}
    </pre>
  );
};

export default ApiRoot;