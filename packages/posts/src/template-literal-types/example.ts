type Hook<Block extends string> = `e2e__${Block}`;

interface HookBlock<Block extends string> {
  (): Hook<Block>;

  element: <Element extends string>(
    element: Element,
  ) => `${Hook<Block>}__${Element}`;

  modifiedElement: <Element extends string, Modifier extends string>(
    element: Element,
    modifier: Modifier,
  ) => `${Hook<Block>}__${Element}--${Modifier}`;

  modifier: <Modifier extends string>(
    modifier: Modifier,
  ) => `${Hook<Block>}--${Modifier}`;
}

const makeHookBlock = <Block extends string>(
  block: Block,
): HookBlock<Block> => {
  const blockClass: Hook<Block> = `e2e__${block}`;

  const getBlock = (): Hook<Block> => {
    return blockClass;
  };

  getBlock.element = <Element extends string>(
    element: Element,
  ): `${Hook<Block>}__${Element}` => `${blockClass}__${element}`;

  getBlock.modifiedElement = <Element extends string, Modifier extends string>(
    element: Element,
    modifier: Modifier,
  ): `${Hook<Block>}__${Element}--${Modifier}` =>
    `${blockClass}__${element}--${modifier}`;

  getBlock.modifier = <Modifier extends string>(
    modifier: Modifier,
  ): `${Hook<Block>}--${Modifier}` => `${blockClass}--${modifier}`;

  return getBlock;
};

const carouselBlock = makeHookBlock("carousel");

const dotButton = carouselBlock.element("dot-button");
