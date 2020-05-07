type HookMap = { [name: string]: string };
type CompiledHookMap<HookMap> = { [Key in keyof HookMap]: string };

export const getMakeHooks = <Hooks extends HookMap>(hooks: Hooks): () => CompiledHookMap<Hooks> => {
  return () => Object.entries(hooks).reduce<{ [key: string]: string }>((acc, [name, hook]) => {
    acc[name] = `e2e__${hook}`;
    return acc;
  }, {}) as CompiledHookMap<Hooks>;
};
