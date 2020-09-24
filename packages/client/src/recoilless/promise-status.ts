import { echoDelayed } from "@bickley-wallace/utilities";
import { asError } from "../utils/as-error";

export type PromiseState = "pending" | "slow" | "failed" | "complete";

export interface Pending {
  status: "pending";
}

export interface Slow {
  status: "slow";
}

export interface Failed {
  status: "failed";
  error: Error;
}

export interface Complete<Value> {
  status: "complete";
  value: Value;
}

export type PromiseStatus<Response> = Pending | Slow | Failed | Complete<Response>;

const valueOrError = async <Value>(promise: Promise<Value>): Promise<Complete<Value> | Failed> => {
  try {
    return {
      status: "complete",
      value: await promise
    };
  } catch (error) {
    return { status: "failed", error: asError(error) };
  }
};

export async function* monitorPromise<Value> (
  promise: Promise<Value>
): AsyncGenerator<PromiseStatus<Value>> {
  const longRunning = echoDelayed<PromiseStatus<Value>>({ status: "slow" }, 500);
  const timeout = echoDelayed<PromiseStatus<Value>>({ status: "failed", error: new Error("Request timed out.") }, 5000);

  yield { status: "pending" };
  const value = valueOrError(promise);

  const nextResult = await Promise.race([value, timeout, longRunning]);

  yield nextResult;

  if (nextResult.status !== "slow") {
    return;
  }

  yield await Promise.race([value, timeout]);
}
