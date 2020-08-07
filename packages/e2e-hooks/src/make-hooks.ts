type HookMap = {
  block: string;
  [element: string]: string
};

type CompiledHookMap<Hooks extends HookMap> = {
  [elment in keyof Hooks]: string;
};

export const makeHooks = <Hooks extends HookMap>(hooks: Hooks): CompiledHookMap<Hooks> => {
  const { block, ...elements } = hooks;
  const compiledBlock = `e2e__${block}`;

  return Object.entries(elements).reduce<{ [element: string]: string }>((acc, [name, hook]) => {
    acc[name] = `e2e__${block}__${hook}`;
    return acc;
  }, { block: compiledBlock }) as CompiledHookMap<Hooks>;
};
