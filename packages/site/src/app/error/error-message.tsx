import type { VNode } from "preact";
import { h } from "preact";

import css from "./error-message.module.css";

export interface ErrorComponentProps {
  heading: string;
  message: string | string[];
}

export const ErrorMessage = ({
  heading,
  message
}: ErrorComponentProps): VNode => {
  return (
    <div className={css.componentRoot} role="alert">
      <h1>{heading}</h1>
      {
        Array.isArray(message)
          ? (
            message.map((msg, index) => (
              <p
                className={css.message}
                key={index}
              >
                {msg}
              </p>
            ))
          )
          : <p className={css.message}>{message}</p>
      }
    </div>
  );
};
ErrorMessage.displayName = "ErrorMessage";
