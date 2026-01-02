import type { PostManifest, PostManifestEntry } from "@jaybeeuu/posts/types";
import { isPostManifest } from "@jaybeeuu/posts/types";
import type { Result } from "@jaybeeuu/utilities";
import { failure, success } from "@jaybeeuu/utilities";
import { fetchJson, fetchText } from "../utils/request.js";
import type {
  DerivationContext,
  DerivedValue,
  PrimitiveValue,
  ActionContext,
} from "@jaybeeuu/recoilless";
import type { ImageName } from "./images/index.js";
import type { Theme } from "./services/theme.js";
import { getMediaTheme, persistedTheme } from "./services/theme.js";

export const postsManifest: DerivedValue<Promise<PostManifest>> = {
  name: "postManifest",
  derive: async (): Promise<PostManifest> => {
    return fetchJson("/blog/post-manifest.json", isPostManifest);
  },
  removalSchedule: { schedule: "delayed", delay: 500 },
};

export const currentPostSlug: PrimitiveValue<string | null> = {
  name: "currentPostSlug",
  initialValue: null,
};

export type PostFailureReasons = "post-does-not-exist" | "no-slug-set";

export type PostMetaDataLookupResult = Result<
  PostManifestEntry,
  PostFailureReasons
>;

export const currentPostMeta: DerivedValue<Promise<PostMetaDataLookupResult>> =
  {
    name: "currentPostMeta",
    derive: async ({
      get,
    }): Promise<Result<PostManifestEntry, PostFailureReasons>> => {
      const manifest = await get(postsManifest);
      const slug = get(currentPostSlug);
      if (!slug) {
        return failure("no-slug-set");
      }
      const entry = manifest.entries[slug];
      return entry
        ? success(entry)
        : failure("post-does-not-exist", `The slug "${slug}" is not a post.`);
    },
  };

export type PostHtmlLookupResult = Result<string, PostFailureReasons>;

export const currentPostHtml: DerivedValue<Promise<PostHtmlLookupResult>> = {
  name: "currentPostHtml",
  derive: async ({ get }): Promise<Result<string, PostFailureReasons>> => {
    const postMeta = await get(currentPostMeta);

    return postMeta.success
      ? success(await fetchText(postMeta.value.href))
      : postMeta;
  },
};

export const theme: PrimitiveValue<Theme> = {
  name: "theme",
  initialValue: persistedTheme.get() ?? getMediaTheme(),
};

export interface BackgroundImages {
  light: ImageName;
  dark: ImageName;
}

export const backgroundImages: PrimitiveValue<BackgroundImages | null> = {
  name: "backgroundImage",
  initialValue: null,
};

export const titleBarHeight: PrimitiveValue<number> = {
  name: "titleBarHeight",
  initialValue: 0,
};

const titleBarOffset: PrimitiveValue<number> = {
  name: "titleBarOffset",
  initialValue: 0,
};

export interface ScrollPosition {
  x: number;
  y: number;
}

const mainContentScroll: PrimitiveValue<ScrollPosition> = {
  name: "mainContentScroll",
  initialValue: {
    x: 0,
    y: 0,
  },
};

export const titleBarStyle = {
  name: "titleBarStyle",
  derive: ({ get }: DerivationContext<string>): string => {
    const offset = get(titleBarOffset);
    const scroll = get(mainContentScroll);
    return offset > 0
      ? `top: ${Math.max(scroll.y - offset, 0)}px;`
      : "position: -webkit-sticky;\n" + "position: sticky;\n" + "top: 0;";
  },
};

export const onMainContentScroll = (
  { get, set }: ActionContext,
  scroll: ScrollPosition,
): void => {
  const previousScroll = get(mainContentScroll);
  const elementHeight = get(titleBarHeight);
  const previousOffset = get(titleBarOffset);

  const scrolledBy = scroll.y - previousScroll.y;
  const goingDown = scrolledBy > 0;
  const newOffset = goingDown
    ? Math.min(elementHeight + 500, previousOffset + scrolledBy)
    : Math.max(0, previousOffset + scrolledBy);

  set(mainContentScroll, scroll);
  set(titleBarOffset, newOffset);
};

export const hideTitleBar = ({ get, set }: ActionContext): void => {
  const elementHeight = get(titleBarHeight);
  set(titleBarOffset, elementHeight + 500);
};
