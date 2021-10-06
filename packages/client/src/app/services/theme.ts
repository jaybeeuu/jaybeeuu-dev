
export type Theme = "light" | "dark";

type MediaThemeListener = (newTheme: Theme) => void;
type Unsubscribe = () => void;

const themeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

const themeFromQueryMatch = (matches: boolean): Theme => {
  return matches ? "dark" : "light";
};

export const initialMediaTheme = themeFromQueryMatch(themeMediaQuery.matches);

export const listenToMediaTheme = (listener: MediaThemeListener): Unsubscribe => {
  const handler = (event: MediaQueryListEvent): void => {
    const newTheme = themeFromQueryMatch(event.matches);
    listener(newTheme);
  };

  themeMediaQuery.addEventListener("change", handler);
  return () => themeMediaQuery.removeEventListener("change", handler);
};
