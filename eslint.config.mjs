import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import unusedImports from "eslint-plugin-unused-imports";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  // Override default ignores
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),

  // Custom rules
  {
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      // Variabili e import non utilizzati
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],

      // No console.log in production (warn so you can use it in dev)
      "no-console": ["warn", { allow: ["warn", "error"] }],

      // No debugger
      "no-debugger": "error",

      // No var, always let/const
      "no-var": "error",
      "prefer-const": "error",

      // No duplicate imports
      "no-duplicate-imports": "error",

      // Enforce === instead of ==
      eqeqeq: ["error", "always"],

      // No empty functions
      "no-empty-function": "warn",

      // No eval
      "no-eval": "error",

      // No implied eval
      "no-implied-eval": "error",

      // No alert/confirm/prompt
      "no-alert": "error",

      // TypeScript specific
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
    },
  },
]);

export default eslintConfig;
