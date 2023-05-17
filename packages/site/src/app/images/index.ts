import bath from "./bath.background.jpg";
import blackTusk from "./black-tusk.background.jpg";
import christmasTrail from "./christmas-trail.background.jpg";
import crabappleDrive from "./crabapple-drive.background.jpg";
import englishBayPark from "./english-bay-park.background.jpg";
import fagus from "./fagus.background.jpg";
import galaxy from "./galaxy.background.jpg";
import greatNorthernHighway from "./great-northern-highway.background.jpg";
import greenLake from "./green-lake.background.jpg";
import harmonyRidge from "./harmony-ridge.background.jpg";
import jerseyCream from "./jersey-cream.background.jpg";
import kew from "./kew.background.jpg";
import lionsGateBridge from "./lions-gate-bridge.background.jpg";
import moon from "./moon.background.jpg";
import nullarbor from "./nullarbor.background.jpg";
import rainbowPark from "./rainbow-park.background.jpg";
import royalExhibitionHall from "./royal-exhibition-hall.background.jpg";
import ship from "./ship.background.jpg";
import sydneyHarbourBridge from "./sydney-harbour-bridge.background.jpg";
import sydney from "./sydney.background.jpg";
import tree from "./tree.background.jpg";

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

export const images: { [image in ImageName]: ImageDetails } = {
  bath: { ...bath, alt: "Bath" },
  "black-tusk": { ...blackTusk, alt: "Black Tusk" },
  "christmas-trail": { ...christmasTrail, alt: "Christmas Trail" },
  "crabapple-drive": { ...crabappleDrive, alt: "Crabapple Drive" },
  "english-bay-park": { ...englishBayPark, alt: "English Bay Park", position: "20% 100%" },
  fagus: { ...fagus, alt: "Fagus" },
  galaxy: { ...galaxy, alt: "Galaxy" },
  "great-northern-highway": { ...greatNorthernHighway, alt: "Great Northern Highway" },
  "green-lake": { ...greenLake, alt: "Green Lake", position: "50% 40%" },
  "harmony-ridge": { ...harmonyRidge, alt: "Harmony Ridge" },
  "jersey-cream": { ...jerseyCream, alt: "Jersey Cream" },
  kew: { ...kew, alt: "Kew" },
  "lions-gate-bridge": { ...lionsGateBridge, alt: "Lions Gate Bridge" },
  moon: { ...moon, alt: "Moon" },
  nullarbor: { ...nullarbor, alt: "Nullarbor" },
  "rainbow-park": { ...rainbowPark, alt: "Rainbow Park" },
  "royal-exhibition-hall": { ...royalExhibitionHall, alt: "Royal Exhibition Hall" },
  ship: { ...ship, alt: "Ship" },
  "sydney-harbour-bridge": { ...sydneyHarbourBridge, alt: "Sydney Harbour Bridge" },
  sydney: { ...sydney, alt: "Sydney" },
  tree: { ...tree, alt: "Tree" }
};
