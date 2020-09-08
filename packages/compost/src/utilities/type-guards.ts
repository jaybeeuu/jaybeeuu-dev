export const hasOwnProperty = <Obj extends {}, Property extends PropertyKey>(
  obj: Obj,
  prop: Property
): obj is Obj & Record<Property, unknown> => {
  return Object.prototype.hasOwnProperty.call(obj, prop);
};

export const hasPropertyOfType = <Obj extends {}, Property extends PropertyKey>(
  obj: Obj,
  property: Property,
  typeString: string
): obj is Obj & Record<Property, typeof typeString> => {
  return hasOwnProperty(obj, property) && typeof obj[property] === typeString;
};
