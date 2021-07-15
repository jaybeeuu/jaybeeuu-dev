export type ElementIdentifier<Block extends string, Element extends string> = `${Block}__${Element}`
export type ModifierIdentifier<Block extends string, Modifier extends string> = `${Block}--${Modifier}`

export type HookBlock<Prefix extends string, Block extends string> = {
  (): ElementIdentifier<Prefix, Block>;
  element: <Element extends string>(element: Element) => ElementIdentifier<ElementIdentifier<Prefix, Block>, Element>;
  childBlock: <NewBlock extends string>(block: NewBlock) => HookBlock<ElementIdentifier<Prefix, Block>, NewBlock>
  modifier: <Modifier extends string>(modifier: Modifier) => ModifierIdentifier<ElementIdentifier<Prefix, Block>, Modifier>;
  makeModifierFactory: () => <Modifier extends string>(modifier: Modifier) => ModifierIdentifier<ElementIdentifier<Prefix, Block>, Modifier>;
}

const hookBlockFactory = <Prefix extends string>(
  prefix: Prefix
) => <Block extends string>(
  block: Block
): HookBlock<Prefix, Block> => {
  const blockClass = `${prefix}__${block}` as const;

  const getBlock: HookBlock<Prefix, Block> = (): ElementIdentifier<Prefix, Block> => {
    return blockClass;
  };

  getBlock.childBlock = hookBlockFactory(blockClass);

  getBlock.element = <Element extends string>(
    element: Element
  ): ElementIdentifier<typeof blockClass, Element> => {
    return `${blockClass}__${element}` as const;
  };

  getBlock.makeModifierFactory = () => <Modifier extends string>(
    modifier: Modifier
  ): ModifierIdentifier<typeof blockClass, Modifier> => {
    return `${blockClass}--${modifier}` as const;
  };

  getBlock.modifier = getBlock.makeModifierFactory();

  return getBlock;
};

export const makeHookBlock = <Block extends string>(
  block: Block
): HookBlock<"e2e", Block> => {
  return hookBlockFactory("e2e")(block);
};

const asClassSelector = <Identifier extends string>(
  identifier: Identifier
): `.${Identifier}` => {
  return `.${identifier}` as const;
};

export type Hook = string | ((identifier: string) => string) | HookMap;

export type HookMap = {
  [element: string]: Hook;
};

type ClassSelectors<Hooks extends HookMap> = {
  [Key in keyof Hooks]: Hooks[Key] extends string
    ? `.${Hooks[Key]}`
    : Hooks[Key] extends (...args: any) => any
      ? (...args: Parameters<Hooks[Key]>) => `.${ReturnType<Hooks[Key]>}`
      : ClassSelectors<Extract<Hooks[Key], HookMap>>;
}

export const makeClassSelectors = <Hooks extends HookMap>(hooks: Hooks): ClassSelectors<Hooks> => {
  return Object.entries(hooks).reduce<Record<string, unknown>>((
    acc,
    [name, hook]
  ) => {
    switch(typeof hook) {
      case "function": {
        acc[name] = (identifier: string) => asClassSelector(hook(identifier));
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
  }, { }) as ClassSelectors<Hooks>;
};
