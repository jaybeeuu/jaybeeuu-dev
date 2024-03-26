import type { TypeAssertion, CheckedBy } from "@jaybeeuu/is";
import { assert, is, isLiteral, isUnionOf } from "@jaybeeuu/is";

const isTheme = isUnionOf(isLiteral("light"), isLiteral("dark"));
export type Theme = CheckedBy<typeof isTheme>;

type MediaThemeListener = (newTheme: Theme) => void;
type Unsubscribe = () => void;

const themeMediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

const themeFromQueryMatch = (matches: boolean): Theme => {
  return matches ? "dark" : "light";
};

export const getMediaTheme = (): Theme => {
  return themeFromQueryMatch(themeMediaQuery.matches);
};

export const listenToMediaTheme = (
  listener: MediaThemeListener,
): Unsubscribe => {
  const handler = (event: MediaQueryListEvent): void => {
    const newTheme = themeFromQueryMatch(event.matches);
    listener(newTheme);
  };

  themeMediaQuery.addEventListener("change", handler);
  return () => {
    themeMediaQuery.removeEventListener("change", handler);
  };
};

const localStorageValue = <Value extends string>(
  key: string,
  assertIsValue: TypeAssertion<Value | null>,
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
    },
  };
};

export const persistedTheme = (() => {
  const storageValue = localStorageValue<Theme>(
    "THEME",
    assert(isUnionOf(isTheme, is("null"))),
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
    },
  };
})();
