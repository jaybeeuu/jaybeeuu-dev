import * as bath from "./gen/bath";
import * as blackTusk from "./gen/black-tusk";
import * as christmasTrail from "./gen/christmas-trail";
import * as crabappleDrive from "./gen/crabapple-drive";
import * as englishBayPark from "./gen/english-bay-park";
import * as fagus from "./gen/fagus";
import * as galaxy from "./gen/galaxy";
import * as greatNorthernHighway from "./gen/great-northern-highway";
import * as greenLake from "./gen/green-lake";
import * as harmonyRidge from "./gen/harmony-ridge";
import * as jerseyCream from "./gen/jersey-cream";
import * as kew from "./gen/kew";
import * as lionsGateBridge from "./gen/lions-gate-bridge";
import * as moon from "./gen/moon";
import * as nullarbor from "./gen/nullarbor";
import * as rainbowPark from "./gen/rainbow-park";
import * as royalExhibitionHall from "./gen/royal-exhibition-hall";
import * as ship from "./gen/ship";
import * as sydneyHarbourBridge from "./gen/sydney-harbour-bridge";
import * as sydney from "./gen/sydney";
import * as tree from "./gen/tree";

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

export type ImageVersion =
  | "fullRes"
  | "lowRes"
  | "blurred";

export type ImageVersionUrls<
  Version extends string
> = {
  [version in Version]: string;
};

export type ImageUrls<
  ImageName extends string,
  Version extends string
> = {
  [image in ImageName]: ImageVersionUrls<Version>;
};

export const imageUrls: ImageUrls<Image, ImageVersion> = {
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
