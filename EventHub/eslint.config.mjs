import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react/no-unescaped-entities": "off",
      "react/jsx-key": "warn",
      "react-hooks/rules-of-hooks": "warn",
      "react/no-unstable-nested-components": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores(["node_modules/**", ".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

