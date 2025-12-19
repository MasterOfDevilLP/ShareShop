const prettier = require("eslint-config-prettier");
const eslintPluginPrettier = require("eslint-plugin-prettier");

module.exports = [
  {
    files: ["*.js"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2025,
        sourceType: "module",
      },
    },
    plugins: {
      prettier: eslintPluginPrettier,
    },
    extends: ["plugin:prettier/recommended", "prettier"],
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
      eqeqeq: ["warn", "always"],
      "prettier/prettier": "error",
    },
  },
  {
    files: ["*.html", "*.htm"],
    languageOptions: {
      parser: "html-eslint-parser",
    },
    rules: {
      "prettier/prettier": "error",
    },
  },
  {
    files: ["*.css"],
    rules: {
      "prettier/prettier": "error",
    },
  },
];
