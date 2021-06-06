import { useValue } from "@jaybeeuu/preact-recoilless";
import { useEffect } from "preact/hooks";
import type { BackgroundImages } from "./state";
import { backgroundImages } from "./state";

export const useBackgrounds = (images: BackgroundImages): void => {
  const [, setImages] = useValue(backgroundImages);
  useEffect(() => {
    setImages(images);
  }, []);
};
