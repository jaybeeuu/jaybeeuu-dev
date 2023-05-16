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

export type Image =
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

export const imageUrls: { [image in Image]: ResponsiveImageOutput } = {
  bath,
  "black-tusk": blackTusk,
  "christmas-trail": christmasTrail,
  "crabapple-drive": crabappleDrive,
  "english-bay-park": englishBayPark,
  fagus,
  galaxy,
  "great-northern-highway": greatNorthernHighway,
  "green-lake": greenLake,
  "harmony-ridge": harmonyRidge,
  "jersey-cream": jerseyCream,
  kew,
  "lions-gate-bridge": lionsGateBridge,
  moon,
  nullarbor,
  "rainbow-park": rainbowPark,
  "royal-exhibition-hall": royalExhibitionHall,
  ship,
  "sydney-harbour-bridge": sydneyHarbourBridge,
  sydney,
  tree
};
