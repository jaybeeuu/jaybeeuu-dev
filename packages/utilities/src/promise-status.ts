import { echo, microEcho } from "./delay.js";
import { multiPartition } from "./multi-partition.js";
import { asError } from "./as-error.js";

export const PromiseStatusTuple = ["pending", "failed", "complete"] as const;
export const PromiseStatuses = PromiseStatusTuple as readonly string[];
export type PromiseStatus = typeof PromiseStatusTuple[number];

const pendingStatus = { status: "pending" } as const;
export type Pending  = typeof pendingStatus;

export interface Failed {
  status: "failed";
  error: Error | { [value: string]: Error };
}

export interface Complete<Value> {
  status: "complete";
  value: Value;
}

export const pending = (): Pending => pendingStatus;
export const failed = (error: Error | { [value: string]: Error }): Failed => ({ status: "failed", error });

export function complete(): Complete<never>
export function complete<Value>(value: Value): Complete<Value>
export function complete<Value>(value?: Value): Complete<Value> {
  return { status: "complete", value: value as Value };
}

export type PromiseState<Response = unknown> = Pending | Failed | Complete<Response>;

const isObjectWithProp = <Prop extends string>(candidate: unknown, prop: Prop): candidate is { [key in Prop]: unknown } => {
  return typeof candidate === "object" && candidate !== null && prop in candidate;
};

const isAnyPromiseState = (candidate: unknown): candidate is PromiseState => {
  return isObjectWithProp(candidate, "status")
    && typeof candidate.status === "string"
    && PromiseStatuses.includes(candidate.status);
};

const valueOrError = async <Value>(promise: Promise<Value>): Promise<Complete<Value> | Failed> => {
  try {
    return complete(await promise);
  } catch (maybeError) {
    const error = asError(maybeError);
    return failed(error);
  }
};

export interface MonitorPromiseOptions {
  timeoutDelay: number;
}

export async function* monitorPromise<Value> (
  promise: Promise<Value>,
  userOptions: Partial<MonitorPromiseOptions> = {}
): AsyncGenerator<PromiseState<Value>> {
  const options: MonitorPromiseOptions = {
    timeoutDelay: 5000,
    ...userOptions
  };
  const timeout = echo(failed(new Error("Request timed out.")), options.timeoutDelay);

  try {
    const value = valueOrError(promise);
    const firstResult = await Promise.race([value, microEcho(pending())]);

    yield firstResult;

    if (firstResult.status !== "pending") {
      return;
    }

    const nextResult = await Promise.race([value, timeout]);

    yield nextResult;
  }
  finally {
    timeout.clear();
  }
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

export const combinePromises = <Values extends object>(values: Values): PromiseState<ResolvedValues<Values>> => {
  const [simpleValues, promiseStates] = Object.entries(values).reduce<[[string, unknown][], [string, PromiseState][]]>(([simple, prom], [key, value]) => {
    if (isAnyPromiseState(value)) {
      prom.push(([key, value]));
    } else {
      simple.push([key, value]);
    }
    return [simple, prom];
  }, [[], []]);

  const [
    failedPromises,
    pendingPromises,
    completePromises
  ] = multiPartition(
    promiseStates,
    isPromiseStateEntry("failed"),
    isPromiseStateEntry("pending"),
    isPromiseStateEntry("complete")
  );

  if (failedPromises.length > 0) {
    const errors = Object.fromEntries(failedPromises.flatMap(([key, failedPromise]): [string, Error][] => {
      if (failedPromise.error instanceof Error) {
        return [[key, failedPromise.error]];
      } else {
        return Object.entries(failedPromise.error).map(([innerKey, error]) => [`${key}.${innerKey}`, error]);
      }
    }));
    return failed(errors);
  }

  if (pendingPromises.length > 0) {
    return pending();
  }

  return { status: "complete", value: Object.fromEntries([
    ...simpleValues,
    ...completePromises.map(([key, completePromise]) => [key, completePromise.value])
  ]) as ResolvedValues<Values> };
};
