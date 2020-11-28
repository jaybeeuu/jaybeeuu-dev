export const hasOwnProperty = <Obj extends {}, Property extends PropertyKey>(
  obj: Obj,
  prop: Property
): obj is Obj & Record<Property, unknown> => {
  return Object.prototype.hasOwnProperty.call(obj, prop);
};

const hasPropertyOfType = <Obj extends {}, Property extends PropertyKey, PropertyType>(
  obj: Obj,
  property: Property,
  typeString: string
): obj is Obj & Record<Property, PropertyType> => {
  return hasOwnProperty(obj, property) && typeof obj[property] === typeString;
};

export const hasStringProperty = <Obj extends {}, Property extends PropertyKey>(
  obj: Obj,
  property: Property
): obj is Obj & { [Key in Property]: string } => {
  return hasPropertyOfType<Obj, Property, string>(obj, property, "string");
};
