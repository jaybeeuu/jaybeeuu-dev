import type { PostManifest, PostMetaData } from "@jaybeeuu/compost";
import { assertIsNotNullish } from "@jaybeeuu/utilities";
import { fetchJson, fetchText } from "../utils/request";
import type {
  DerivationContext,
  DerivedValue,
  PrimitiveValue,
  ActionContext
} from "@jaybeeuu/recoilless";
import type { Image } from "./images/index";
import type { Theme } from "./services/theme";
import { getMediaTheme, persistedTheme } from "./services/theme";

export const postsManifest: DerivedValue<Promise<PostManifest>> = {
  name: "postManifest",
  derive: async (): Promise<PostManifest> => {
    return fetchJson<PostManifest>("/blog/manifest.json");
  }
};

export const currentPostSlug: PrimitiveValue<string | null> = {
  name: "currentPostSlug",
  initialValue: null
};

export const currentPostMeta: DerivedValue<Promise<PostMetaData>> = {
  name: "currentPostMeta",
  derive: async ({ get }): Promise<PostMetaData> => {
    const manifest = await get(postsManifest);
    const slug = get(currentPostSlug);

    const entry = manifest[slug!];

    assertIsNotNullish(entry, `Slug "${String(slug)}" does not exist in the manifest.`);

    return entry;
  }
};

export const currentPostHtml: DerivedValue<Promise<string>> = {
  name: "currentPostHtml",
  derive: async ({ get }): Promise<string> => {
    const postMeta = await get(currentPostMeta);
    return fetchText(postMeta.href);
  }
};

export const theme: PrimitiveValue<Theme> = {
  name: "theme",
  initialValue: persistedTheme.get() ?? getMediaTheme()
};

export type ThemedImages<
  Theem extends string,
  ImageName extends string
> = {
  [theme in Theem]: ImageName;
}

export const backgroundImages: PrimitiveValue<ThemedImages<Theme, Image> | null> = {
  name: "backgroundImage",
  initialValue: null
};

export const titleBarHeight: PrimitiveValue<number> = {
  name: "titleBarHeight",
  initialValue: 0
};

const titleBarOffset: PrimitiveValue<number> = {
  name: "titleBarOffset",
  initialValue: 0
};

export interface ScrollPosition {
  x: number;
  y: number;
}

const mainContentScroll: PrimitiveValue<ScrollPosition> = {
  name: "mainContentScroll",
  initialValue: {
    x: 0,
    y: 0
  }
};

export const titleBarStyle = {
  name: "titleBarStyle",
  derive: ({ get }: DerivationContext<string>): string => {
    const offset  = get(titleBarOffset);
    const scroll  = get(mainContentScroll);
    return offset > 0
      ? `top: ${ Math.max(scroll.y - offset, 0)}px;`
      :   "position: -webkit-sticky;\n"
        + "position: sticky;\n"
        + "top: 0;";
  }
};

export const onMainContentScroll = (
  { get, set }: ActionContext,
  scroll: ScrollPosition
): void => {
  const previousScroll = get(mainContentScroll);
  const elementHeight = get(titleBarHeight);
  const previousOffset = get(titleBarOffset);

  const scrolledBy = scroll.y - previousScroll.y;
  const goingDown = scrolledBy > 0;
  const newOffset = goingDown
    ? Math.min(
      elementHeight + 500,
      previousOffset + scrolledBy
    )
    : Math.max(0, previousOffset + scrolledBy);

  set(mainContentScroll, scroll);
  set(titleBarOffset, newOffset);
};

export const hideTitleBar = (
  { get, set }: ActionContext
): void => {
  const elementHeight = get(titleBarHeight);
  set(titleBarOffset, elementHeight + 500);
};
