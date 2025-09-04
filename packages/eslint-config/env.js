import globals from "globals";

/**
 * @type {import("eslint").Linter.Config}
 */
export const node = {
  languageOptions: {
    globals: {
      ...globals.node,
    },
  },
};

/**
 * @type {import("eslint").Linter.Config}
 */
export const browser = {
  languageOptions: {
    globals: {
      ...globals.browser,
    },
  },
};
