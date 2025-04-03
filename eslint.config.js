// functions/eslint.config.js
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // Ignore the TypeScript output directory (usually 'lib' for Functions)
  // and node_modules
  { ignores: ["lib/", "node_modules/"] },

  // Configuration for TypeScript files
  {
    files: ["**/*.{ts,tsx}"], // Keep tsx if you use it for some reason, else just ts
    extends: [
        js.configs.recommended,
        ...tseslint.configs.recommended,
        // If using specific stricter configs:
        // ...tseslint.configs.recommendedTypeChecked, // Requires parserOptions.project
        // ...tseslint.configs.stylisticTypeChecked,   // Requires parserOptions.project
    ],
    languageOptions: {
      ecmaVersion: 2020, // Or a newer version if needed
      sourceType: "module", // If using ES Modules in Node (requires Node >= 14 & "type": "module" in package.json or .mjs)
                            // OR sourceType: "commonjs", // If using require/module.exports (more common for older Functions)
      globals: {
        ...globals.node, // Use Node.js globals
      },
      // If using recommendedTypeChecked/stylisticTypeChecked, uncomment and point to tsconfig
      // parserOptions: {
      //   project: true,
      //   tsconfigRootDir: import.meta.dirname,
      // },
    },
    rules: {
      // Keep useful rules, remove React-specific ones
      "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }], // Warn about unused vars, allow underscore prefix to ignore
      // Add any other specific rules for your backend code
      // e.g., "@typescript-eslint/no-floating-promises": "error", // Good for async functions
    },
  },

  // (Optional) Add a separate block if you have plain .js files
  // {
  //   files: ["**/*.js"],
  //   extends: [js.configs.recommended],
  //   languageOptions: {
  //     globals: {
  //       ...globals.node,
  //     },
  //     sourceType: "commonjs" // Or "module" depending on your JS files
  //   },
  //   rules: {
  //      // JS-specific rules if needed
  //   }
  // }
);