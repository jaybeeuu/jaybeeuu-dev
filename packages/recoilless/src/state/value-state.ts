export type Unsubscribe = () => void;
export type RemoveFromStore = () => void;

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

  public get subscriptionCount(): number {
    return this.listeners.size;
  }
}
