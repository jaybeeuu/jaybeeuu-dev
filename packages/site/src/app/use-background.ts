import { useValue } from "@jaybeeuu/preact-recoilless";
import { useEffect } from "preact/hooks";
import type { ThemedImages } from "./state";
import { backgroundImages } from "./state";

export const useBackgrounds = (images: ThemedImages): void => {
  const [, setImages] = useValue(backgroundImages);
  useEffect(() => {
    setImages(images);
  }, []);
};
