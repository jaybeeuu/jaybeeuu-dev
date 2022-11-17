import bath from "./bath.jpg";
import blackTusk from "./black-tusk.jpg";
import christmasTrail from "./christmas-trail.jpg";
import crabappleDrive from "./crabapple-drive.jpg";
import englishBayPark from "./english-bay-park.jpg";
import fagus from "./fagus.jpg";
import galaxy from "./galaxy.jpg";
import greatNorthernHighway from "./great-northern-highway.jpg";
import greenLake from "./green-lake.jpg";
import harmonyRidge from "./harmony-ridge.jpg";
import jerseyCream from "./jersey-cream.jpg";
import kew from "./kew.jpg";
import lionsGateBridge from "./lions-gate-bridge.jpg";
import moon from "./moon.jpg";
import nullarbor from "./nullarbor.jpg";
import rainbowPark from "./rainbow-park.jpg";
import royalExhibitionHall from "./royal-exhibition-hall.jpg";
import ship from "./ship.jpg";
import sydneyHarbourBridge from "./sydney-harbour-bridge.jpg";
import sydney from "./sydney.jpg";
import tree from "./tree.jpg";

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

export const imageUrls: { [image in Image]: string } = {
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
