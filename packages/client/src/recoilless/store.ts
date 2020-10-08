import {
  DerivedValueState,
  GetDependency,
  isDerivedValue,
  PrimitiveValueState,
  RemoveFromStore,
  ValueState,
  Value
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


export class Store {
  private readonly values: { [name:string]: ValueState<any> } = {};

  private removeValue = <Val>(value: Value<Val>): void => {
    delete this.values[value.name];
  };

  public getValue = <Val>(value: Value<Val>): ValueState<Val> => {
    if(!(value.name in this.values)) {
      this.values[value.name] = createValue(
        value,
        () => this.removeValue(value),
        this.getValue
      );
    }
    return this.values[value.name] as ValueState<Val>;
  }
}
