import bathPlaceholder from "./bath.jpg?placeholder";
import blackTuskPlaceholder from "./black-tusk.jpg?placeholder";
import christmasTrailPlaceholder from "./christmas-trail.jpg?placeholder";
import crabappleDrivePlaceholder from "./crabapple-drive.jpg?placeholder";
import englishBayParkPlaceholder from "./english-bay-park.jpg?placeholder";
import fagusPlaceholder from "./fagus.jpg?placeholder";
import galaxyPlaceholder from "./galaxy.jpg?placeholder";
import greatNorthernHighwayPlaceholder from "./great-northern-highway.jpg?placeholder";
import greenLakePlaceholder from "./green-lake.jpg?placeholder";
import harmonyRidgePlaceholder from "./harmony-ridge.jpg?placeholder";
import jerseyCreamPlaceholder from "./jersey-cream.jpg?placeholder";
import kewPlaceholder from "./kew.jpg?placeholder";
import lambertsCastlePlaceholder from "./lamberts-castle.jpg?placeholder";
import lionsGateBridgePlaceholder from "./lions-gate-bridge.jpg?placeholder";
import moonPlaceholder from "./moon.jpg?placeholder";
import nullarborPlaceholder from "./nullarbor.jpg?placeholder";
import rainbowParkPlaceholder from "./rainbow-park.jpg?placeholder";
import royalExhibitionHallPlaceholder from "./royal-exhibition-hall.jpg?placeholder";
import shipPlaceholder from "./ship.jpg?placeholder";
import sydneyHarbourBridgePlaceholder from "./sydney-harbour-bridge.jpg?placeholder";
import sydneyPlaceholder from "./sydney.jpg?placeholder";
import treePlaceholder from "./tree.jpg?placeholder";

import bathBackground from "./bath.jpg?background";
import blackTuskBackground from "./black-tusk.jpg?background";
import christmasTrailBackground from "./christmas-trail.jpg?background";
import crabappleDriveBackground from "./crabapple-drive.jpg?background";
import englishBayParkBackground from "./english-bay-park.jpg?background";
import fagusBackground from "./fagus.jpg?background";
import galaxyBackground from "./galaxy.jpg?background";
import greatNorthernHighwayBackground from "./great-northern-highway.jpg?background";
import greenLakeBackground from "./green-lake.jpg?background";
import harmonyRidgeBackground from "./harmony-ridge.jpg?background";
import jerseyCreamBackground from "./jersey-cream.jpg?background";
import kewBackground from "./kew.jpg?background";
import lambertsCastleBackground from "./lamberts-castle.jpg?background";
import lionsGateBridgeBackground from "./lions-gate-bridge.jpg?background";
import moonBackground from "./moon.jpg?background";
import nullarborBackground from "./nullarbor.jpg?background";
import rainbowParkBackground from "./rainbow-park.jpg?background";
import royalExhibitionHallBackground from "./royal-exhibition-hall.jpg?background";
import shipBackground from "./ship.jpg?background";
import sydneyHarbourBridgeBackground from "./sydney-harbour-bridge.jpg?background";
import sydneyBackground from "./sydney.jpg?background";
import treeBackground from "./tree.jpg?background";

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

export const images: { [image in ImageName]: ImageDetails } = {
  bath: {
    placeholder: bathPlaceholder,
    src: bathBackground,
    alt: "Bath",
  },
  "black-tusk": {
    placeholder: blackTuskPlaceholder,
    src: blackTuskBackground,
    alt: "Black Tusk",
  },
  "christmas-trail": {
    placeholder: christmasTrailPlaceholder,
    src: christmasTrailBackground,
    alt: "Christmas Trail",
  },
  "crabapple-drive": {
    placeholder: crabappleDrivePlaceholder,
    src: crabappleDriveBackground,
    alt: "Crabapple Drive",
  },
  "english-bay-park": {
    placeholder: englishBayParkPlaceholder,
    src: englishBayParkBackground,
    alt: "English Bay Park",
    position: "20% 100%",
  },
  fagus: {
    placeholder: fagusPlaceholder,
    src: fagusBackground,
    alt: "Fagus",
  },
  galaxy: {
    placeholder: galaxyPlaceholder,
    src: galaxyBackground,
    alt: "Galaxy",
  },
  "great-northern-highway": {
    placeholder: greatNorthernHighwayPlaceholder,
    src: greatNorthernHighwayBackground,
    alt: "Great Northern Highway",
  },
  "green-lake": {
    placeholder: greenLakePlaceholder,
    src: greenLakeBackground,
    alt: "Green Lake",
    position: "50% 40%",
  },
  "harmony-ridge": {
    placeholder: harmonyRidgePlaceholder,
    src: harmonyRidgeBackground,
    alt: "Harmony Ridge",
  },
  "jersey-cream": {
    placeholder: jerseyCreamPlaceholder,
    src: jerseyCreamBackground,
    alt: "Jersey Cream",
  },
  kew: {
    placeholder: kewPlaceholder,
    src: kewBackground,
    alt: "Kew",
  },
  "lamberts-castle": {
    placeholder: lambertsCastlePlaceholder,
    src: lambertsCastleBackground,
    alt: "Lamberts Castle",
    position: "50% 25%",
  },
  "lions-gate-bridge": {
    placeholder: lionsGateBridgePlaceholder,
    src: lionsGateBridgeBackground,
    alt: "Lions Gate Bridge",
  },
  moon: {
    placeholder: moonPlaceholder,
    src: moonBackground,
    alt: "Moon",
  },
  nullarbor: {
    placeholder: nullarborPlaceholder,
    src: nullarborBackground,
    alt: "Nullarbor",
  },
  "rainbow-park": {
    placeholder: rainbowParkPlaceholder,
    src: rainbowParkBackground,
    alt: "Rainbow Park",
  },
  "royal-exhibition-hall": {
    placeholder: royalExhibitionHallPlaceholder,
    src: royalExhibitionHallBackground,
    alt: "Royal Exhibition Hall",
  },
  ship: {
    placeholder: shipPlaceholder,
    src: shipBackground,
    alt: "Ship",
  },
  "sydney-harbour-bridge": {
    placeholder: sydneyHarbourBridgePlaceholder,
    src: sydneyHarbourBridgeBackground,
    alt: "Sydney Harbour Bridge",
  },
  sydney: {
    placeholder: sydneyPlaceholder,
    src: sydneyBackground,
    alt: "Sydney",
  },
  tree: {
    placeholder: treePlaceholder,
    src: treeBackground,
    alt: "Tree",
  },
};
