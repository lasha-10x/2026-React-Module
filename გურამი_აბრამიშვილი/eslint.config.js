import { defineConfig } from 'eslint/config';
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
export default defineConfig({ ignores: ["dist", "node_modules"] }, {
    files: ["**/*.{js,jsx}"],
    extends: [js.configs.recommended],
    languageOptions: {
        ecmaVersion: 2022,
        globals: { ...globals.browser, ...globals.node }
    },
    plugins: { "react-hooks": reactHooks },
    rules: {
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
        // No stray console.log in production code (PRD O2); console.error/warn are allowed
        "no-console": ["error", { allow: ["error", "warn"] }]
    }
});
