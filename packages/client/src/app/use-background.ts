import { useValue } from "@bickley-wallace/preact-recoiless";
import { useEffect } from "preact/hooks";
import { backgroundImages, BackgroundImages } from "./state";

export const useBackgrounds = (images: BackgroundImages): void => {
  const [, setImages] = useValue(backgroundImages);
  useEffect(() => {
    setImages(images);
  });
};
