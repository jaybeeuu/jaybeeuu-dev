import { echoDelayed, multiPartition } from "@bickley-wallace/utilities";
import { asError } from "../utils/as-error";

const promiseStatusesTuple = ["pending", "slow", "failed", "complete"] as const;
export const PromiseStatuses = new Set<string>(promiseStatusesTuple);
export type PromiseStatus = typeof promiseStatusesTuple[number];

export interface Pending {
  status: "pending";
}

export interface Slow {
  status: "slow";
}

export interface Failed {
  status: "failed";
  error: Error | Error[];
}

export interface Complete<Value> {
  status: "complete";
  value: Value;
}

const pending = (): Pending => ({ status: "pending" });
const slow = (): Slow => ({ status: "slow" });
const failed = (error: Error | Error[]): Failed => ({ status: "failed", error });

function complete(): Complete<never>
function complete<Value>(value: Value): Complete<Value>
function complete<Value>(value?: Value): Complete<Value> {
  return { status: "complete", value: value as Value };
}

export type PromiseState<Response = unknown> = Pending | Slow | Failed | Complete<Response>;

const isObjectWithProp = <Prop extends string>(candidate: unknown, prop: Prop): candidate is { [key in Prop]: unknown } => {
  return candidate && typeof candidate === "object" && prop in candidate;
};

const isAnyPromiseState = (candidate: unknown): candidate is PromiseState => {
  return isObjectWithProp(candidate, "status")
    && typeof candidate.status === "string"
    && PromiseStatuses.has(candidate.status);
};

const valueOrError = async <Value>(promise: Promise<Value>): Promise<Complete<Value> | Failed> => {
  try {
    return complete(await promise);
  } catch (maybeError) {
    const error = asError(maybeError);
    return failed(error);
  }
};

export async function* monitorPromise<Value> (
  promise: Promise<Value>
): AsyncGenerator<PromiseState<Value>> {
  const slowPromise = echoDelayed<PromiseState<Value>>(slow(), 500);
  const timeout = echoDelayed<PromiseState<Value>>(failed(new Error("Request timed out.")), 5000);

  yield pending();
  const value = valueOrError(promise);

  const nextResult = await Promise.race([value, timeout, slowPromise]);

  yield nextResult;

  if (nextResult.status !== "slow") {
    return;
  }

  yield await Promise.race([value, timeout]);
}

const isPromiseStateEntry = <Status extends PromiseStatus>(
  status: Status
) => (
  entry: [string, PromiseState]
): entry is [string, Extract<PromiseState, { status: Status }>] => {
  return entry[1].status === status;
};

type ResolvedValues<Values extends object> = {
  [Key in keyof Values]: Values[Key] extends PromiseState<infer Value>
    ? Value
    : Values[Key]
}

export const useCombinePromises = <Values extends object>(values: Values): PromiseState<ResolvedValues<Values>> => {
  const [simpleValues, promiseStates] = Object.entries(values).reduce(([simple, prom], [key, value]) => {
    if (isAnyPromiseState(value)) {
      prom.push(([key, value]));
    } else {
      simple.push([key, value]);
    }
    return [simple, prom];
  }, [[], []] as [[string, unknown][], [string, PromiseState][]]);

  const [
    failedPromises,
    slowPromises,
    pendingPromises,
    completePromises
  ] = multiPartition(
    promiseStates,
    isPromiseStateEntry("failed"),
    isPromiseStateEntry("slow"),
    isPromiseStateEntry("pending"),
    isPromiseStateEntry("complete")
  );

  if (failedPromises.length > 0) {
    return failed(failedPromises.flatMap(([, failedPromise]) => failedPromise.error));
  }

  if (slowPromises.length > 0) {
    return slow();
  }

  if (pendingPromises.length > 0) {
    return pending();
  }

  return { status: "complete", value: Object.fromEntries([
    ...simpleValues,
    ...completePromises.map(([key, completePromise]) => [key, completePromise.value])
  ]) as ResolvedValues<Values> };
};
