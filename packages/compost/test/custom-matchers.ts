import { matcherHint, printExpected, printReceived } from "jest-matcher-utils";

expect.extend({
  stringContainingAll (received: unknown, ...expected: string[]): jest.CustomMatcherResult {
    const receivedString = typeof received === "string";
    const missingSubstrings = typeof received === "string"
      ? expected.filter((exp) => !received.includes(exp))
      : [];
    const pass = receivedString
      ? missingSubstrings.length === 0
      : this.isNot;

    return {
      pass,
      message: () => {
        return [
          matcherHint("toIncludeMultiple", undefined, undefined, { isNot: this.isNot }),
          "Expected string to contain all substrings:",
          `  ${printExpected(expected)}`,
          ...((pass && received) ? [
            "Missing:",
            `  ${printExpected(expected)}`
          ] : []),
          "Received:",
          `  ${printReceived(received)}`].join("\n");
      }
    };
  }
});

declare global {
  namespace jest {
    interface Expect {
      stringContainingAll(...expected: string[]): CustomMatcherResult
    }
  }
}
