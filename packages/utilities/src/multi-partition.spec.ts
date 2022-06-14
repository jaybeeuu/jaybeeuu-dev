import { multiPartition } from "./multi-partition.js";

describe("multi-partition", () => {
  it("partitions an array into 3 partitions.", () => {
    const input = [1, 2, 3, 2, 1, 3];
    const result = multiPartition(
      input,
      (value: number): value is 1 => value === 1,
      (value: number): value is 2 => value === 2,
      (value: number): value is 3 => value === 3,
    );
    expect(result).toStrictEqual([
      [1, 1], [2, 2], [3, 3]
    ]);
  });

  it("copes with an empty array.", () => {
    const input: number[] = [];
    const result = multiPartition(
      input,
      (value: number): value is 1 => value === 1,
      (value: number): value is 2 => value === 2,
      (value: number): value is 3 => value === 3,
    );
    expect(result).toStrictEqual([
      [], [], []
    ]);
  });

  it("discards values which don't match a predicate.", () => {
    const input: number[] = [1, 2, 3, 5];
    const result = multiPartition(
      input,
      (value: number): value is 1 => value === 1,
      (value: number): value is 2 => value === 2,
      (value: number): value is 3 => value === 3,
    );
    expect(result).toStrictEqual([
      [1], [2], [3]
    ]);
  });
});
