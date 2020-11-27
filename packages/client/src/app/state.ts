import { PostManifest, PostMetaData } from "@bickley-wallace/compost";
import { fetchJson, fetchText } from "../utils/request";
import { DerivedValue, PrimitiveValue } from "@bickley-wallace/recoiless";

export const postsManifest: DerivedValue<Promise<PostManifest>> = {
  name: "postManifest",
  derive: async (): Promise<PostManifest> => {
    return fetchJson<PostManifest>("/posts/manifest.json");
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
    if (slug && slug in manifest) {
      return manifest[slug];
    }
    throw new Error(`Slug "${String(slug)}" does not exist in the manifest.`);
  }
};

export const currentPostHtml: DerivedValue<Promise<string>> = {
  name: "currentPostHtml",
  derive: async ({ get }): Promise<string> => {
    const postMeta = await get(currentPostMeta);
    return fetchText(postMeta.href);
  }
};

export type Theme = "light" | "dark";

export const theme: PrimitiveValue<Theme> = {
  name: "theme",
  initialValue: "dark"
};

export type Image
  = "bath"
  | "blackTusk"
  | "christmasTrail"
  | "crabappleDrive"
  | "englishBayPark"
  | "fagus"
  | "galaxy"
  | "greatNorthernHighway"
  | "greenLake"
  | "harmonyRidge"
  | "jerseyCream"
  | "kew"
  | "lionsGateBridge"
  | "moon"
  | "nullarbor"
  | "rainbowPark"
  | "royalExhibitionHall"
  | "ship"
  | "sydneyHarbourBridge"
  | "sydney"
  | "tree";

export type BackgroundImages = { light: Image, dark: Image };

export const backgroundImages: PrimitiveValue<BackgroundImages | null> = {
  name: "backgroundImage",
  initialValue: null
};
