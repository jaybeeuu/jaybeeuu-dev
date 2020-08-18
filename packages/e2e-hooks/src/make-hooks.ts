export type HookBlock = {
  (): string;
  element: (element: string) => string;
  childBlock: (block: string) => HookBlock
  modifier: (modifier: string) => string;
}

const hookBlockFactory = (prefix: string) => (block: string): HookBlock => {
  const blockClass = `${prefix}__${block}`;
  const getBlock = (): string => blockClass;
  getBlock.childBlock = hookBlockFactory(blockClass);
  getBlock.element = (element: string) => `${blockClass}__${element}`;
  getBlock.modifier = (modifier: string) => `${blockClass}--${modifier}`;
  return getBlock;
};

export const makeHookBlock = (block: string): HookBlock => hookBlockFactory("e2e")(block);

const asClassSelector = (identifier: string): string => `.${identifier}`;

export type Hook = string | ((identifier: string) => string) | HookMap;

export type HookMap = {
  block: string;
  [element: string]: Hook;
};

export const makeClassSelectors = <Hooks extends HookMap>(hooks: Hooks): Hooks => {
  return Object.entries(hooks).reduce<{ [hook: string]: Hook }>((acc, [name, hook]) => {
    switch(typeof hook) {
      case "function": {
        acc[name] = (identifier: string): string => asClassSelector(hook(identifier));
        break;
      }
      case "object": {
        acc[name] = makeClassSelectors(hook);
        break;
      }
      case "string": {
        acc[name] = asClassSelector(hook);
        break;
      }
      default: throw new Error(`Unable to make type ${typeof hook} into a class selector.`);
    }

    return acc;
  }, { }) as Hooks;
};
