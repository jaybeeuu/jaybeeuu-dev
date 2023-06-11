import type { JSX } from "preact";
import { h } from "preact";

import css from "./error-message.module.css";
import classNames from "classnames";

export interface ErrorComponentProps {
  className?: string;
  heading: string;
  message: string | string[];
}

export const ErrorMessage = ({
  className,
  heading,
  message
}: ErrorComponentProps): JSX.Element => {
  return (
    <div className={classNames(css.componentRoot, className)} role="alert">
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
