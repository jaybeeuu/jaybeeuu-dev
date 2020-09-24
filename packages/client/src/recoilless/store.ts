import {
  DerivedValue,
  GetDependency,
  isDerivedValueSeed,
  PrimitiveValue,
  RemoveFromStore,
  Value,
  ValueSeed
} from "./state";

const createValue = <Val>(
  valueSeed: ValueSeed<Val>,
  removeFromStore: RemoveFromStore,
  getDependency: GetDependency
): Value<Val> => {
  if (isDerivedValueSeed(valueSeed)) {
    return new DerivedValue(valueSeed, removeFromStore, getDependency);
  }

  return new PrimitiveValue(valueSeed, removeFromStore);
};


export class Store {
  private readonly values: { [name:string]: Value<any> } = {};

  private removeValue = <Val>(valueSeed: ValueSeed<Val>): void => {
    delete this.values[valueSeed.name];
  };

  public getValue = <Val>(valueSeed: ValueSeed<Val>): Value<Val> => {
    if(!(valueSeed.name in this.values)) {
      this.values[valueSeed.name] = createValue(
        valueSeed,
        () => this.removeValue(valueSeed),
        this.getValue
      );
    }
    return this.values[valueSeed.name] as Value<Val>;
  }
}
