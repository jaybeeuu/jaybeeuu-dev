type Is<PossibleValues, Target extends PossibleValues> = (
  candidate: PossibleValues
) => candidate is Target;


export function multiPartition<Values, T1 extends Values, T2 extends Values>(
  array: Values[],
  isT1: Is<Values, T1>,
  isT2: Is<Values, T2>
): [T1[], T2[]];
export function multiPartition<Values, T1 extends Values, T2 extends Values, T3 extends Values>(
  array: Values[],
  isT1: Is<Values, T1>,
  isT2: Is<Values, T2>,
  isT3: Is<Values, T3>
): [T1[], T2[], T3[]];
export function multiPartition<Values, T1 extends Values, T2 extends Values, T3 extends Values, T4 extends Values>(
  array: Values[],
  isT1: Is<Values, T1>,
  isT2: Is<Values, T2>,
  isT3: Is<Values, T3>,
  isT4: Is<Values, T4>
): [T1[], T2[], T3[], T4[]];
export function multiPartition<Values, T1 extends Values, T2 extends Values, T3 extends Values, T4 extends Values, T5 extends Values>(
  array: Values[],
  isT1: Is<Values, T1>,
  isT2: Is<Values, T2>,
  isT3: Is<Values, T3>,
  isT4: Is<Values, T4>,
  isT5: Is<Values, T5>
): [T1[], T2[], T3[], T4[], T5[]];
export function multiPartition(
  array: any[],
  ...predicates: ((candidate: any) => boolean)[]
): any[][];
export function multiPartition(
  array: any[],
  ...predicates: ((candidate: any) => boolean)[]
): any[][] {
  return array.reduce<any[][]>((acc, value) => {
    const index = predicates.findIndex((predicate) => predicate(value));
    if (index >= 0) {
      acc[index].push(value);
    }
    return acc;
  }, Array.from(
    new Array<any[]>(predicates.length),
    () => []
  ));
}
