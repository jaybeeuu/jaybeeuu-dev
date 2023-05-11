import fetch from "node-fetch";
import { Agent } from "node:https";
import type { TypeAssertion} from "@jaybeeuu/utilities";
import {
  assert,
  delay,
  is,
  isObject,
  monitorPromise
} from "@jaybeeuu/utilities";

export interface Version {
  commit: string;
  branch: string;
  commitDateTime: string;
  buildMode: string;
}

const isVersion = isObject<Version>({
  commit: is("string"),
  branch: is("string"),
  commitDateTime: is("string"),
  buildMode: is("string")
});

const assertIsVersion: TypeAssertion<Version> = assert(isVersion, "Version");

const assertValueURL = (url: string): void => {
  new URL(url);
};

export interface WaitUpOptions {
  url: string;
  commitHash: string;
  pollTime: number;
  timeoutDelay: number;
  insecureSSL: boolean;
}

const getCacheBustedUrl = (url: string): string => {
  const cacheBustedUrl = new URL(url);
  cacheBustedUrl.searchParams.set("_t", `${new Date().valueOf()}`);
  return cacheBustedUrl.toString();
};

const getVersion = async (
  url: string,
  abortSignal: AbortSignal,
  insecureSSL: boolean
): Promise<Version> => {
  const cacheBustedUrl = getCacheBustedUrl(url);
  const agent = new Agent({
    rejectUnauthorized: !insecureSSL
  });
  const response = await fetch(
    cacheBustedUrl,
    {
      agent,
      signal: abortSignal,
      headers: { "Cache-Control": "no-cache" }
    }
  );
  const json = await response.json();
  assertIsVersion(json);
  return json;
};

const pollForCommitHash = async (
  url: string,
  commitHash: string,
  pollTime: number,
  abortSignal: AbortSignal,
  insecureSSL: boolean
): Promise<Version> => {
  while (!abortSignal.aborted) {
    try {
      const version = await getVersion(url, abortSignal, insecureSSL);
      if (version.commit.startsWith(commitHash)) {
        return version;
      }
      console.log(`Found commit "${version.commit}": No match.`);
    } catch (error){
      console.log(error?.toString() ?? "Error");
    }
    await delay(pollTime);
  }

  throw new Error("Polling for version aborted.");
};

export const waitUp = async ({
  commitHash,
  pollTime,
  timeoutDelay,
  url,
  insecureSSL
}: WaitUpOptions): Promise<void> => {
  console.log(
    "Wait Up!\n",
    {
      commitHash,
      pollTime,
      timeoutDelay,
      url,
      insecureSSL
    }
  );
  assertValueURL(url);
  const abortController = new AbortController();
  const pollPromise = pollForCommitHash(
    url,
    commitHash,
    pollTime,
    abortController.signal,
    insecureSSL
  );

  const startTime = Date.now();

  for await (const promise of monitorPromise(pollPromise, { timeoutDelay: timeoutDelay })) {
    switch (promise.status) {
      case "pending":{
        console.log("Polling for commit hash.");
        break;
      }
      case "complete": {
        console.log(
          `Found expected version in ${Date.now() - startTime}ms.\n`,
          promise.value
        );
        return;
      }
      case "failed": {
        throw new Error(
          typeof promise.error.message === "string"
            ? promise.error.message
            : promise.error.message.message);
      }
    }
  }
};

