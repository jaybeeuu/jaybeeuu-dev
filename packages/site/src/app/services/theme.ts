import type { TypeAssertion } from "@jaybeeuu/utilities";
import { assert, isInPrimitiveUnion, isNull, or } from "@jaybeeuu/utilities";

const themes = ["light", "dark"] as const;
export type Theme = typeof themes[number];

const isTheme = isInPrimitiveUnion(themes);

type MediaThemeListener = (newTheme: Theme) => void;
type Unsubscribe = () => void;

const themeFromQueryMatch = (matches: boolean): Theme => {
  return matches ? "dark" : "light";
};

const themeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

export const getMediaTheme = (): Theme => {
  return themeFromQueryMatch(themeMediaQuery.matches);
};

export const listenToMediaTheme = (listener: MediaThemeListener): Unsubscribe => {
  const handler = (event: MediaQueryListEvent): void => {
    const newTheme = themeFromQueryMatch(event.matches);
    listener(newTheme);
  };

  themeMediaQuery.addEventListener("change", handler);
  return () => themeMediaQuery.removeEventListener("change", handler);
};

const localStorageValue = <Value extends string>(
  key: string,
  assertIsValue: TypeAssertion<Value | null>
): {
  set: (value: Value) => void;
  get: () => Value | null;
  remove: () => void;
} => {
  return {
    set: (value: Value): void => {
      localStorage.setItem(key, value);
    },
    get: (): Value | null => {
      const persisted = localStorage.getItem(key);
      assertIsValue(persisted);
      return persisted;
    },
    remove: (): void => {
      localStorage.removeItem(key);
    }
  };
};

export const persistedTheme = (() => {
  const storageValue = localStorageValue<Theme>(
    "THEME",
    assert(
      or(isTheme, isNull),
      "Theme or null"
    )
  );
  return {
    set: (newTheme: Theme): void => {
      if (newTheme === getMediaTheme()) {
        storageValue.remove();
      } else {
        storageValue.set(newTheme);
      }
    },
    get: (): Theme | null => {
      return storageValue.get();
    }
  };
})();
