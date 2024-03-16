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

export interface ImageDetails {
  alt: string;
  placeholder: string;
  position?: string;
  src: string;
}

const createGetImageDetails = (
  getImportPlaceholder: () => Promise<string>,
  getImportImage: () => Promise<string>,
  alt: string,
  position?: string
): (() => Promise<ImageDetails>) => {
  let details: ImageDetails | null = null;
  return async () => {
    if (!details) {
      const [placeholder, src] = await Promise.all([
        getImportPlaceholder(),
        getImportImage(),
      ]);

      details = {
        placeholder,
        src,
        alt,
        position,
      };
    }
    return details;
  };
};

export const images: { [image in ImageName]: () => Promise<ImageDetails> } = {
  bath: createGetImageDetails(
    async () => (await import("./bath.background.jpg?placeholder")).default,
    async () => (await import("./bath.background.jpg?background")).default,
    "Bath"
  ),
  "black-tusk": createGetImageDetails(
    async () =>
      (await import("./black-tusk.background.jpg?placeholder")).default,
    async () =>
      (await import("./black-tusk.background.jpg?background")).default,
    "Black Tusk"
  ),
  "christmas-trail": createGetImageDetails(
    async () =>
      (await import("./christmas-trail.background.jpg?placeholder")).default,
    async () =>
      (await import("./christmas-trail.background.jpg?background")).default,
    "Christmas Trail"
  ),
  "crabapple-drive": createGetImageDetails(
    async () =>
      (await import("./crabapple-drive.background.jpg?placeholder")).default,
    async () =>
      (await import("./crabapple-drive.background.jpg?background")).default,
    "Crabapple Drive"
  ),
  "english-bay-park": createGetImageDetails(
    async () =>
      (await import("./english-bay-park.background.jpg?placeholder")).default,
    async () =>
      (await import("./english-bay-park.background.jpg?background")).default,
    "English Bay Park",
    "20% 100%"
  ),
  fagus: createGetImageDetails(
    async () => (await import("./fagus.background.jpg?placeholder")).default,
    async () => (await import("./fagus.background.jpg?background")).default,
    "Fagus"
  ),
  galaxy: createGetImageDetails(
    async () => (await import("./galaxy.background.jpg?placeholder")).default,
    async () => (await import("./galaxy.background.jpg?background")).default,
    "Galaxy"
  ),
  "great-northern-highway": createGetImageDetails(
    async () =>
      (await import("./great-northern-highway.background.jpg?placeholder"))
        .default,
    async () =>
      (await import("./great-northern-highway.background.jpg?background"))
        .default,
    "Great Northern Highway"
  ),
  "green-lake": createGetImageDetails(
    async () =>
      (await import("./green-lake.background.jpg?placeholder")).default,
    async () =>
      (await import("./green-lake.background.jpg?background")).default,
    "Green Lake",
    "50% 40%"
  ),
  "harmony-ridge": createGetImageDetails(
    async () =>
      (await import("./harmony-ridge.background.jpg?placeholder")).default,
    async () =>
      (await import("./harmony-ridge.background.jpg?background")).default,
    "Harmony Ridge"
  ),
  "jersey-cream": createGetImageDetails(
    async () =>
      (await import("./jersey-cream.background.jpg?placeholder")).default,
    async () =>
      (await import("./jersey-cream.background.jpg?background")).default,
    "Jersey Cream"
  ),
  kew: createGetImageDetails(
    async () => (await import("./kew.background.jpg?placeholder")).default,
    async () => (await import("./kew.background.jpg?background")).default,
    "Kew"
  ),
  "lamberts-castle": createGetImageDetails(
    async () =>
      (await import("./lamberts-castle.background.jpg?placeholder")).default,
    async () =>
      (await import("./lamberts-castle.background.jpg?background")).default,
    "Lamberts Castle",
    "50% 25%"
  ),
  "lions-gate-bridge": createGetImageDetails(
    async () =>
      (await import("./lions-gate-bridge.background.jpg?placeholder")).default,
    async () =>
      (await import("./lions-gate-bridge.background.jpg?background")).default,
    "Lions Gate Bridge"
  ),
  moon: createGetImageDetails(
    async () => (await import("./moon.background.jpg?placeholder")).default,
    async () => (await import("./moon.background.jpg?background")).default,
    "Moon"
  ),
  nullarbor: createGetImageDetails(
    async () =>
      (await import("./nullarbor.background.jpg?placeholder")).default,
    async () => (await import("./nullarbor.background.jpg?background")).default,
    "Nullarbor"
  ),
  "rainbow-park": createGetImageDetails(
    async () =>
      (await import("./rainbow-park.background.jpg?placeholder")).default,
    async () =>
      (await import("./rainbow-park.background.jpg?background")).default,
    "Rainbow Park"
  ),
  "royal-exhibition-hall": createGetImageDetails(
    async () =>
      (await import("./royal-exhibition-hall.background.jpg?placeholder"))
        .default,
    async () =>
      (await import("./royal-exhibition-hall.background.jpg?background"))
        .default,
    "Royal Exhibition Hall"
  ),
  ship: createGetImageDetails(
    async () => (await import("./ship.background.jpg?placeholder")).default,
    async () => (await import("./ship.background.jpg?background")).default,
    "Ship"
  ),
  "sydney-harbour-bridge": createGetImageDetails(
    async () =>
      (await import("./sydney-harbour-bridge.background.jpg?placeholder"))
        .default,
    async () =>
      (await import("./sydney-harbour-bridge.background.jpg?background"))
        .default,
    "Sydney Harbour Bridge"
  ),
  sydney: createGetImageDetails(
    async () => (await import("./sydney.background.jpg?placeholder")).default,
    async () => (await import("./sydney.background.jpg?background")).default,
    "Sydney"
  ),
  tree: createGetImageDetails(
    async () => (await import("./tree.background.jpg?placeholder")).default,
    async () => (await import("./tree.background.jpg?background")).default,
    "Tree"
  ),
};
