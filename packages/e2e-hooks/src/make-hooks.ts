type HookMap = {
  block: string;
  [element: string]: string
};

type CompiledHookMap<HookMap> = {
  [Key in keyof HookMap]: string;
};

export const makeHooks = <Hooks extends HookMap>(hooks: Hooks): CompiledHookMap<Hooks> => {
  const block = hooks.block;
  return Object.entries(hooks).reduce<{ [key: string]: string }>((acc, [name, hook]) => {
    acc[name] = `e2e__${block}__${hook}`;
    return acc;
  }, {}) as CompiledHookMap<Hooks>;
};
