import {
  DerivedValueState,
  GetDependency,
  isDerivedValue,
  PrimitiveValueState,
  RemoveFromStore,
  ValueState,
  Value,
  PrimitiveValue,
  DerivedValue
} from "./state";

const createValue = <Val>(
  value: Value<Val>,
  removeFromStore: RemoveFromStore,
  getDependency: GetDependency
): ValueState<Val> => {
  if (isDerivedValue(value)) {
    return new DerivedValueState(value, removeFromStore, getDependency);
  }

  return new PrimitiveValueState(value, removeFromStore);
};

export interface GetValue {
  <Val>(value: DerivedValue<Val>): DerivedValueState<Val>;
  <Val>(value: PrimitiveValue<Val>): PrimitiveValueState<Val>;
}

export class Store {
  private readonly values: { [name:string]: ValueState<any> } = {};

  private removeValue = <Val>(value: Value<Val>): void => {
    delete this.values[value.name];
  };

  private getDependency: GetDependency = <Val>(
    value: Value<Val>
  ): ValueState<Val> => {
    if(!(value.name in this.values)) {
      this.values[value.name] = createValue(
        value,
        () => this.removeValue(value),
        this.getDependency
      );
    }

    return this.values[value.name] as ValueState<Val>;
  }

  public getValue: GetValue = this.getDependency as GetValue;
}
