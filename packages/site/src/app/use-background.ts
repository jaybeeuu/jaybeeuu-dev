import { useValue } from "@jaybeeuu/preact-recoilless";
import { useEffect } from "preact/hooks";
import type { BackgroundImages } from "./state.js";
import { backgroundImages } from "./state.js";

export const useBackgrounds = (images: BackgroundImages): void => {
  const [, setImages] = useValue(backgroundImages);
  useEffect(() => {
    setImages(images);
  }, []);
};
