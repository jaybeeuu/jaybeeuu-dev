import globals from "globals";

export const node = {
  languageOptions: {
    globals: {
      ...globals.node,
    },
  },
};

export const browser = {
  languageOptions: {
    globals: {
      ...globals.browser,
    },
  },
};
