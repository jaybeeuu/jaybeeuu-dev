import type { ImageLoader } from "./image-loader";
import { FetchImageLoader } from "./image-loader";
export type { ImageLoader };

export type ImageName =
  | "bath"
  | "black-tusk"
  | "christmas-trail"
  | "crabapple-drive"
  | "english-bay-park"
  | "fagus"
  | "galaxy"
  | "great-northern-highway"
  | "green-lake"
  | "harmony-ridge"
  | "jersey-cream"
  | "kew"
  | "lamberts-castle"
  | "lions-gate-bridge"
  | "moon"
  | "nullarbor"
  | "rainbow-park"
  | "royal-exhibition-hall"
  | "ship"
  | "sydney-harbour-bridge"
  | "sydney"
  | "tree";

export interface ImageDetails extends ResponsiveImageOutput {
  position?: string;
  alt: string;
  loader: ImageLoader;
}

const createGetImageDetails = (
  getResponsiveImage: () => Promise<ResponsiveImageOutput>,
  alt: string,
  position?: string
): () => Promise<ImageDetails> => {
  let details: ImageDetails | null = null;
  return async () => {
    if (!details){
      const responsiveImage = await getResponsiveImage();
      details = {
        ...responsiveImage,
        alt,
        loader: new FetchImageLoader(responsiveImage),
        position
      };
    }
    return details;
  };
};

export const images: { [image in ImageName]: () => Promise<ImageDetails> } = {
  bath: createGetImageDetails(
    async () => (await import("./bath.background.jpg")).default,
    "Bath"
  ),
  "black-tusk": createGetImageDetails(
    async () => (await import("./black-tusk.background.jpg")).default,
    "Black Tusk"
  ),
  "christmas-trail": createGetImageDetails(
    async () => (await import("./christmas-trail.background.jpg")).default,
    "Christmas Trail"
  ),
  "crabapple-drive": createGetImageDetails(
    async () => (await import("./crabapple-drive.background.jpg")).default,
    "Crabapple Drive"
  ),
  "english-bay-park": createGetImageDetails(
    async () => (await import("./english-bay-park.background.jpg")).default,
    "English Bay Park",
    "20% 100%"
  ),
  "fagus": createGetImageDetails(
    async () => (await import("./fagus.background.jpg")).default,
    "Fagus"
  ),
  "galaxy": createGetImageDetails(
    async () => (await import("./galaxy.background.jpg")).default,
    "Galaxy"
  ),
  "great-northern-highway": createGetImageDetails(
    async () => (await import("./great-northern-highway.background.jpg")).default,
    "Great Northern Highway"
  ),
  "green-lake": createGetImageDetails(
    async () => (await import("./green-lake.background.jpg")).default,
    "Green Lake",
    "50% 40%"
  ),
  "harmony-ridge": createGetImageDetails(
    async () => (await import("./harmony-ridge.background.jpg")).default,
    "Harmony Ridge"
  ),
  "jersey-cream": createGetImageDetails(
    async () => (await import("./jersey-cream.background.jpg")).default,
    "Jersey Cream"
  ),
  "kew": createGetImageDetails(
    async () => (await import("./kew.background.jpg")).default,
    "Kew"
  ),
  "lamberts-castle": createGetImageDetails(
    async () => (await import("./lamberts-castle.background.jpg")).default,
    "Lamberts Castle",
    "50% 25%"
  ),
  "lions-gate-bridge": createGetImageDetails(
    async () => (await import("./lions-gate-bridge.background.jpg")).default,
    "Lions Gate Bridge"
  ),
  "moon": createGetImageDetails(
    async () => (await import("./moon.background.jpg")).default,
    "Moon"
  ),
  "nullarbor": createGetImageDetails(
    async () => (await import("./nullarbor.background.jpg")).default,
    "Nullarbor"
  ),
  "rainbow-park": createGetImageDetails(
    async () => (await import("./rainbow-park.background.jpg")).default,
    "Rainbow Park"
  ),
  "royal-exhibition-hall":createGetImageDetails(
    async () => (await import("./royal-exhibition-hall.background.jpg")).default,
    "Royal Exhibition Hall"
  ),
  "ship": createGetImageDetails(
    async () => (await import("./ship.background.jpg")).default,
    "Ship"
  ),
  "sydney-harbour-bridge": createGetImageDetails(
    async () => (await import("./sydney-harbour-bridge.background.jpg")).default,
    "Sydney Harbour Bridge"
  ),
  "sydney": createGetImageDetails(
    async () => (await import("./sydney.background.jpg")).default,
    "Sydney"
  ),
  "tree": createGetImageDetails(
    async () => (await import("./tree.background.jpg")).default,
    "Tree"
  )
};
