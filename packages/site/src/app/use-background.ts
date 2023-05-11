import { useValue } from "@jaybeeuu/preact-recoilless";
import { useEffect } from "preact/hooks";
import type { Image } from "./images/index";
import type { Theme } from "./services/theme";
import type { ThemedImages } from "./state";
import { backgroundImages } from "./state";

export const useBackgrounds = (images: ThemedImages<Theme, Image>): void => {
  const [, setImages] = useValue(backgroundImages);
  useEffect(() => {
    setImages(images);
  }, []);
};
