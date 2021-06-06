import type { Value } from "./value";
import type { Unsubscribe} from "./value-state";
import { ValueState } from "./value-state";

export interface DerivedValue<Val> {
  name: string;
  derive: Derive<Val>;
}

export type DerivationContext<Val> = {
  get: <DependencyValue>(dependency: Value<DependencyValue>) => DependencyValue;
  previousValue: Val | undefined;
}

export type Derive<Val> = (context: DerivationContext<Val>) => Val;
export type GetDependency = <Val>(value: Value<Val>) => ValueState<Val>;

export class DerivedValueState<Val> extends ValueState<Val> {
  private readonly derive: Derive<Val>;
  private readonly getDependency: GetDependency;
  private readonly registeredDependencies = new Set<ValueState<any>>();
  private readonly unsubscribes: Unsubscribe[] = [];

  constructor(
    { name, derive }: DerivedValue<Val>,
    removeFromStore: () => void,
    getDependency: GetDependency,
  ) {
    super(name, undefined as any, removeFromStore);
    this.getDependency = getDependency;
    this.derive = derive;
    this.deriveAgain();
  }

  private deriveAgain(): void {
    this.setValue(this.derive({
      get: (...args) => this.getDependencyValue(...args),
      previousValue: this.current
    }));
  }

  private getDependencyValue<Dependency>(dependency: Value<Dependency>): Dependency {
    const dependencyState = this.getDependency(dependency);

    if(!this.registeredDependencies.has(dependencyState)) {
      this.registeredDependencies.add(dependencyState);
      this.unsubscribes.push(
        dependencyState.subscribe(
          () => this.deriveAgain()
        )
      );
    }

    return dependencyState.current;
  }

  public subscribe(listener: (value: Val) => void): Unsubscribe {
    const unsubscribe = super.subscribe(listener);

    return () => {
      unsubscribe();
      if (this.subscriptionCount === 0) {
        this.unsubscribes.forEach((unsubscribeDependency) => unsubscribeDependency());
      }
    };
  }
}

export const isDerivedValue = <Val>(
  value: Value<Val>
): value is DerivedValue<Val> => {
  return "derive" in value && typeof value.derive === "function";
};
