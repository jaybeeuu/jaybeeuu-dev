import React, { FunctionComponent } from "react";

interface ApiRootProps {
  message: string
}

const ApiRoot: FunctionComponent<ApiRootProps> = ({ message }) => (
  <pre>
    {message}
  </pre>
);

export default ApiRoot;