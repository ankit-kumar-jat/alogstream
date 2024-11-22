/** @type {import('prettier').Config} */

export default {
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindConfig: "./tailwind.config.ts",
  tailwindFunctions: ["cva", "cn"],
  arrowParens: "avoid",
  bracketSameLine: false,
  bracketSpacing: true,
  embeddedLanguageFormatting: "auto",
  endOfLine: "lf",
  htmlWhitespaceSensitivity: "css",
  insertPragma: false,
  jsxSingleQuote: false,
  printWidth: 80,
  proseWrap: "always",
  quoteProps: "as-needed",
  requirePragma: false,
  semi: false,
  singleAttributePerLine: false,
  singleQuote: true,
  tabWidth: 2,
  useTabs: false,
  trailingComma: "all",
  overrides: [
    {
      files: ["**/*.json"],
      options: {
        useTabs: false,
      },
    },
    {
      files: ["**/*.mdx"],
      options: {
        proseWrap: "preserve",
        htmlWhitespaceSensitivity: "ignore",
      },
    },
  ],
};
