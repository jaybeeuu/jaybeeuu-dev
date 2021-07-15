interface HookBlock<Block extends string> {
  (): `e2e__${Block}`;

  element: <Element extends string>(
    element: Element
  ) => `${Block}__${Element}`;

  modifiedElement: <
    Element extends string,
    Modifier extends string
  >(
    element: Element,
    modifier: Modifier
  ) => `${Block}__${Element}--${Modifier}`;

  modifier: <Modifier extends string>(
    modifier: Modifier
  ) => `${Block}--${Modifier}`;
}

const makeHookBlock = <Block extends string>(
  block: Block
): HookBlock<Block> => {
  const blockClass = `e2e__${block}` as const;

  const getBlock: HookBlock<Block> = (): `e2e__${Block}` => {
    return blockClass;
  };

  getBlock.element = <Element extends string>(
    element: Element
  ): `${Block}__${Element}` => `${block}__${element}`;

  getBlock.modifiedElement = <
    Element extends string,
    Modifier extends string
  >(
    element: Element,
    modifier: Modifier
  ): `${Block}__${Element}--${Modifier}` => `${block}__${element}--${modifier}`;

  getBlock.modifier = <Modifier extends string>(
    modifier: Modifier
  ): `${Block}--${Modifier}` => `${block}--${modifier}`;

  return getBlock;
};

const carouselBlock = makeHookBlock("carousel");
const scrollTrack = carouselBlock.element("scroll-track");

const activeScrollTrack = carouselBlock.modifiedElement(
  "scroll-track",
  "active"
);

