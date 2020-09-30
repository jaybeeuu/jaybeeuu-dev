import { log } from "@bickley-wallace/utilities";
import { ComponentChildren, Fragment, h, JSX } from "preact";
import { useErrorBoundary } from "preact/hooks";

const hasMessage = (candidate: unknown): candidate is { message: string } => {
  return candidate && typeof candidate === "object" && "message" in candidate;
};


const getMessage = (error: unknown): string => {
  if (hasMessage(error)) {
    return String(error.message);
  }
  return String(error);
};

interface ErrorBaoundaryProps {
  children: ComponentChildren;
}

export const ErrorBoundary = ({ children }: ErrorBaoundaryProps): JSX.Element => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const [error, resetError]: [unknown, () => void] = useErrorBoundary((err) => log.error(err));

  if (error) {
    return (
      <div>
        <p>{getMessage(error)}</p>
        <button onClick={resetError}>Try again</button>
      </div>
    );
  } else {
    return <Fragment>{children}</Fragment>;
  }
};
ErrorBoundary.displayName = "ErrorBoundary";
