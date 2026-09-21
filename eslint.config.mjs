import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // `public/` holds vendored assets (the pdf.js worker) that are not ours to lint.
  globalIgnores([".next/**", "out/**", "build/**", "public/**", "next-env.d.ts"]),
]);

export default eslintConfig;
