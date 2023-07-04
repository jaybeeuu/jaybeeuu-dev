import { render } from "@testing-library/preact";
import type { PromiseState } from "packages/utilities/lib";
import type { JSX } from "preact";
import { h } from "preact";
import type { FailedProps } from "./with-promise";
import { withPromise } from "./with-promise";

const Pending = (): JSX.Element => (
  <div>Pending</div>
);
const Failed = ({ error }: FailedProps): JSX.Element => (
  <div>{
    error instanceof Error
      ? error.message
      : Object.entries(error).map(
        ([source, err]) => `${source}: ${err.message}`
      )
  }</div>
);

interface ContentProps {
  message: string;
  value?: number;
}
const Content = ({ message, value = 0 }: ContentProps): JSX.Element => (
  <div>
    {message} {value}
  </div>
);

const ContentWithPromise = withPromise({ Pending, Failed, Content });

describe("withPromise", () => {
  it("renders the pending component when the promise is yet to complete.", async () => {
    const { findByText } = render(
      <ContentWithPromise message={{ status: "pending" }} />
    );

    await expect(findByText("Pending")).resolves.toBeVisible();
  });

  it("renders the content component when the promise completes.", async () => {
    const { findByText } = render(
      <ContentWithPromise
        message={{ status: "complete", value: "{message}" }}
        value={1}
      />
    );

    await expect(findByText("{message} 1")).resolves.toBeVisible();
  });

  it("renders the failed component when the promise fails.", async () => {
    const { findByText } = render(
      <ContentWithPromise message={{ status: "failed", error: new Error("Whoops!") }} />
    );

    await expect(findByText("message: Whoops!")).resolves.toBeVisible();
  });

  it("renders the pending component when at least one of the promises is pending.", async () => {
    const { findByText } = render(
      <ContentWithPromise
        message={{ status: "complete", value: "{message}" }}
        value={{ status: "pending" }}
      />
    );

    await expect(findByText("Pending")).resolves.toBeVisible();
  });

  it.each<PromiseState<string>>([
    { status: "pending" },
    { status: "complete", value: "{message}" }
  ])("$#: renders the failed component when at least one of the promises has failed (the other had $status).", async (otherPromise) => {
    const { findByText } = render(
      <ContentWithPromise
        message={otherPromise}
        value={{ status: "failed", error: new Error("Whoops!") }}
      />
    );

    await expect(findByText("value: Whoops!")).resolves.toBeVisible();
  });

  it("renders the content component when all promises have completed.", async () => {
    const { findByText } = render(
      <ContentWithPromise
        message={{ status: "complete", value: "{message}" }}
        value={{ status: "complete", value: 1 }}
      />
    );

    await expect(findByText("{message} 1")).resolves.toBeVisible();
  });
});
