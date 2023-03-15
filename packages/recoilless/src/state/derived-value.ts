import type { Listener, Unsubscribe, ValueState } from "./value-state.js";
import { WatchableValue } from "./watchable-value.js";
import type { Value } from "./value.js";

export interface DerivedValue<Val> {
  name: string;
  derive: Derive<Val>;
}

export interface DerivationContext<Val> {
  get: <DependencyValue>(dependency: Value<DependencyValue>) => DependencyValue;
  previousValue: Val | undefined;
}

export type Derive<Val> = (context: DerivationContext<Val>) => Val;
export type GetDependency = <Val>(value: Value<Val>) => ValueState<Val>;

export class DerivedValueState<Val> implements ValueState<Val> {
  readonly #dependencyUnsubscribes: Unsubscribe[] = [];
  readonly #derive: Derive<Val>;
  readonly #getDependency: GetDependency;
  readonly #registeredDependencies = new Set<ValueState<any>>();
  readonly #value: WatchableValue<Val>;
  readonly #name: string;

  constructor(
    { name, derive }: DerivedValue<Val>,
    removeFromStore: () => void,
    getDependency: GetDependency
  ) {
    this.#derive = derive;
    this.#getDependency = getDependency;
    this.#name = name;

    const firstValue = this.#derive({
      get: (...args) => this.#getDependencyValue(...args),
      previousValue: undefined
    });

    this.#value = new WatchableValue(firstValue, () => {
      removeFromStore();
      this.#dependencyUnsubscribes.forEach(
        (unsubscribeDependency) => unsubscribeDependency()
      );
    });
  }

  #deriveAgain(): void {
    this.#value.set(this.#derive({
      get: (...args) => this.#getDependencyValue(...args),
      previousValue: this.current
    }));
  }

  #getDependencyValue<Dependency>(dependency: Value<Dependency>): Dependency {
    const dependencyState = this.#getDependency(dependency);

    if (!this.#registeredDependencies.has(dependencyState)) {
      this.#registeredDependencies.add(dependencyState);
      this.#dependencyUnsubscribes.push(
        dependencyState.subscribe(
          () => this.#deriveAgain()
        )
      );
    }

    return dependencyState.current;
  }

  public get current(): Val {
    return this.#value.current;
  }

  public get name(): string {
    return this.#name;
  }

  public subscribe(listener: Listener<Val>): Unsubscribe {
    return this.#value.subscribe(listener);
  }
}

export const isDerivedValue = <Val>(
  value: Value<Val>
): value is DerivedValue<Val> => {
  return "derive" in value && typeof value.derive === "function";
};
