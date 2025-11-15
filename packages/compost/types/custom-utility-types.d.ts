type RecursivePartial<Target> = {
  [Property in keyof Target]?: Target[Property] extends (infer Base)[]
    ? RecursivePartial<Base>[]
    : Target[Property] extends object
      ? RecursivePartial<Target[Property]>
      : Target[Property];
};
