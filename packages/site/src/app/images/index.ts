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
}

export const images: { [image in ImageName]: () => Promise<ImageDetails> } = {
  bath: async () => ({ ...(await import("./bath.background.jpg")).default, alt: "Bath" }),
  "black-tusk": async () => ({ ...(await import("./black-tusk.background.jpg")).default, alt: "Black Tusk" }),
  "christmas-trail": async () => ({ ...(await import("./christmas-trail.background.jpg")).default, alt: "Christmas Trail" }),
  "crabapple-drive": async () => ({ ...(await import("./crabapple-drive.background.jpg")).default, alt: "Crabapple Drive" }),
  "english-bay-park": async () => ({ ...(await import("./english-bay-park.background.jpg")).default, alt: "English Bay Park", position: "20% 100%" }),
  "fagus": async () => ({ ...(await import("./fagus.background.jpg")).default, alt: "Fagus" }),
  "galaxy": async () => ({ ...(await import("./galaxy.background.jpg")).default, alt: "Galaxy" }),
  "great-northern-highway": async () => ({ ...(await import("./great-northern-highway.background.jpg")).default, alt: "Great Northern Highway" }),
  "green-lake": async () => ({ ...(await import("./green-lake.background.jpg")).default, alt: "Green Lake", position: "50% 40%" }),
  "harmony-ridge": async () => ({ ...(await import("./harmony-ridge.background.jpg")).default, alt: "Harmony Ridge" }),
  "jersey-cream": async () => ({ ...(await import("./jersey-cream.background.jpg")).default, alt: "Jersey Cream" }),
  "kew": async () => ({ ...(await import("./kew.background.jpg")).default, alt: "Kew" }),
  "lions-gate-bridge": async () => ({ ...(await import("./lions-gate-bridge.background.jpg")).default, alt: "Lions Gate Bridge" }),
  "moon": async () => ({ ...(await import("./moon.background.jpg")).default, alt: "Moon" }),
  "nullarbor": async () => ({ ...(await import("./nullarbor.background.jpg")).default, alt: "Nullarbor" }),
  "rainbow-park": async () => ({ ...(await import("./rainbow-park.background.jpg")).default, alt: "Rainbow Park" }),
  "royal-exhibition-hall": async () => ({ ...(await import("./royal-exhibition-hall.background.jpg")).default, alt: "Royal Exhibition Hall" }),
  "ship": async () => ({ ...(await import("./ship.background.jpg")).default, alt: "Ship" }),
  "sydney-harbour-bridge": async () => ({ ...(await import("./sydney-harbour-bridge.background.jpg")).default, alt: "Sydney Harbour Bridge" }),
  "sydney": async () => ({ ...(await import("./sydney.background.jpg")).default, alt: "Sydney" }),
  "tree": async () => ({ ...(await import("./tree.background.jpg")).default, alt: "Tree" })
};
