export type Unsubscribe = () => void;
export type RemoveFromStore = () => void;

export interface PrimitiveValueSeed<Val> {
  name: string;
  initialValue: Val;
}

export interface DerivedValueSeed<Val> {
  name: string;
  derive: Derive<Val>;
}

export type ValueSeed<Val> = PrimitiveValueSeed<Val> | DerivedValueSeed<Val>;

export class Value<Val> {
  private readonly listeners = new Set<(value: Val) => void>();
  private name: string;
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

export class PrimitiveValue<Val> extends Value<Val> {
  constructor(
    { name, initialValue }: PrimitiveValueSeed<Val>,
    removeFromStore: () => void
  ) {
    super(name, initialValue, removeFromStore);
  }

  public setValue = (newValue: Val): void => {
    super.setValue(newValue);
  }
}

export type DerivationContext = {
  get: <Val>(dependency: ValueSeed<Val>) => Val;
}

export type Derive<Val> = (context: DerivationContext) => Val;
export type GetDependency = <Val>(valueSeed: ValueSeed<Val>) => Value<Val>;

export class DerivedValue<Val> extends Value<Val> {
  private readonly derive: Derive<Val>;
  private readonly getDependency: GetDependency;
  private readonly registeredDependencies = new Set<Value<any>>();
  private readonly unsubscribes: Unsubscribe[] = [];

  constructor(
    { name, derive }: DerivedValueSeed<Val>,
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

  private getDependencyValue<DependencyValue>(dependencySeed: ValueSeed<DependencyValue>): DependencyValue {
    const dependency = this.getDependency(dependencySeed);

    if(!this.registeredDependencies.has(dependency)) {
      this.registeredDependencies.add(dependency);
      this.unsubscribes.push(dependency.subscribe(() => this.deriveAgain()));
    }

    return dependency.current;
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

export const isDerivedValueSeed = <Value>(
  valueSeed: ValueSeed<Value>
): valueSeed is DerivedValueSeed<Value> => {
  return "derive" in valueSeed && typeof valueSeed.derive === "function";
};

export const isPrimitiveValueSeed = <Value>(
  valueSeed: ValueSeed<Value>
): valueSeed is PrimitiveValueSeed<Value> => {
  return "initialValue" in valueSeed;
};
