import type { Listener, Unsubscribe, ValueState } from "./value-state.js";
import { WatchableValue } from "./watchable-value.js";
import type { Value } from "./value.js";
import type { StoreRemovalSchedule, UnscheduleRemoval } from "./store-removal-strategies.js";
import { makeScheduler } from "./store-removal-strategies.js";

export interface DerivedValue<Val> {
  name: string;
  derive: Derive<Val>;
  removalSchedule?: StoreRemovalSchedule;
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
  readonly #registeredDependencies = new Set<ValueState<unknown>>();
  readonly #value: WatchableValue<Val>;
  readonly #name: string;

  readonly #unscheduleRemoval: UnscheduleRemoval = () => {};

  constructor(
    { derive, removalSchedule, name }: DerivedValue<Val>,
    removeFromStore: () => void,
    getDependency: GetDependency,
    defaultRemovalSchedule: StoreRemovalSchedule
  ) {
    this.#derive = derive;
    this.#getDependency = getDependency;
    this.#name = name;

    const firstValue = this.#derive({
      get: (...args) => this.#getDependencyValue(...args),
      previousValue: undefined
    });

    const {
      schedule: scheduleRemoval,
      unschedule: unscheduleRemoval
    } = makeScheduler(
      removalSchedule ?? defaultRemovalSchedule,
      () => {
        removeFromStore();
        this.#dependencyUnsubscribes.forEach(
          (unsubscribeDependency) => { unsubscribeDependency(); }
        );
      }
    );
    this.#unscheduleRemoval = unscheduleRemoval;
    this.#value = new WatchableValue(
      firstValue,
      () => { scheduleRemoval(); },
      name
    );
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
          () => { this.#deriveAgain(); }
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
    this.#unscheduleRemoval();
    return this.#value.subscribe(listener);
  }
}
