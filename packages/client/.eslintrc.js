module.exports = {
  env: {
    es6: true,
    browser: true
  },
  plugins: [
    "@typescript-eslint",
    "react",
    "jest"
  ],
  settings: {
    react: {
      pragma: "React",
      version: "detect"
    },
    "import/resolver": {
      webpack: {
        "config": "./config/webpack.config.js"
      }
    }
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:jest/all"
  ],
  rules: {
    "no-unused-vars": "off",
    "semi": ["error", "always"],
    "quotes": ["error", "double"],
    "no-console": "error",

    "react/prop-types": "off",

    "jest/prefer-expect-assertions": "off"
  },
  overrides: [
    {
      files: [
        "*.ts",
        "*.tsx"
      ],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: "./tsconfig.json"
      },
      extends: [
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
      ],
      rules: {
        "@typescript-eslint/no-unused-vars": ["error"],
        "@typescript-eslint/explicit-function-return-type": ["error", { allowExpressions: true }],
      },
    },
    {
      files: [
        "config/**/*.js"
      ],
      env: {
        node: true,
        browser: false
      },
      rules: {
        "no-console": "off"
      }
    },
    {
      files: [
        "src/env.js"
      ],
      parserOptions: {
        sourceType: "module"
      },
      globals: {
        ["process"]: "readonly"
      }
    },
    {
      files: [
        "**/*.spec.ts"
      ],
      env: {
        "jest/globals": true
      }
    }
  ]
};