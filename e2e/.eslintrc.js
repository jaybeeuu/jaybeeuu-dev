module.exports = {
  env: {
    node: true,
    "cypress/globals": true
  },
  plugins: [
    "cypress"
  ],
  settings: {
  },
  extends: [
    "eslint:recommended",
  ],
  rules: {
    "no-unused-vars": "off",
    "semi": ["error", "always"],
    "quotes": ["error", "double"],
    "no-console": "error"
  },
  overrides: [
  ]
};