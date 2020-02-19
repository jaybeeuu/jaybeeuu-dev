import React, { ReactElement } from "react";
import { useApiCall } from "../../custom-hooks/useApiCall";

const ApiRoot = (): ReactElement => {
  const message = useApiCall("/");
  return (
    <pre>
      {message}
    </pre>
  );
};

export default ApiRoot;