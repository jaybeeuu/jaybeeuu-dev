export type Unsubscribe = () => void;
export type RemoveFromStore = () => void;

export interface PrimitiveValue<Val> {
  name: string;
  initialValue: Val;
}

export interface DerivedValue<Val> {
  name: string;
  derive: Derive<Val>;
}

export type Value<Val> = PrimitiveValue<Val> | DerivedValue<Val>;

export class ValueState<Val> {
  private readonly listeners = new Set<(value: Val) => void>();
  public name: string;
  private value: Val;
  private removeFromStore: () => void;

  protected constructor(
    name: string,
    value: Val,
    removeFromStore: () => void
  ) {
    this.name = name;
    this.value = value;
    this.removeFromStore = removeFromStore;
  }

  protected setValue(newValue: Val): void {
    if (this.value === newValue) {
      return;
    }

    this.value = newValue;
    this.listeners.forEach((subscription) => subscription(this.value));
  }

  public get current(): Val {
    return this.value;
  }

  public subscribe(listener: (value: Val) => void): Unsubscribe {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
      if (this.subscriptionCount === 0) {
        this.removeFromStore();
      }
    };
  }

  protected get subscriptionCount(): number {
    return this.listeners.size;
  }
}

export class PrimitiveValueState<Val> extends ValueState<Val> {
  constructor(
    { name, initialValue }: PrimitiveValue<Val>,
    removeFromStore: () => void
  ) {
    super(name, initialValue, removeFromStore);
  }

  public setValue = (newValue: Val): void => {
    super.setValue(newValue);
  }
}

export type DerivationContext = {
  get: <Val>(dependency: Value<Val>) => Val;
}

export type Derive<Val> = (context: DerivationContext) => Val;
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
    const get = this.getDependencyValue.bind(this);
    this.setValue(this.derive({ get }));
  }

  private getDependencyValue<Dependency>(dependency: Value<Dependency>): Dependency {
    const dependencyState = this.getDependency(dependency);

    if(!this.registeredDependencies.has(dependencyState)) {
      this.registeredDependencies.add(dependencyState);
      this.unsubscribes.push(dependencyState.subscribe(() => this.deriveAgain()));
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

export const isPrimitiveValue = <Val>(
  value: Value<Val>
): value is PrimitiveValue<Val> => {
  return "initialValue" in value;
};
