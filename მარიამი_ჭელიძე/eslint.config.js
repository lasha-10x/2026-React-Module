import { defineConfig } from 'eslint/config';
import eslint from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
export default defineConfig({ ignores: ["dist", "node_modules"] }, eslint.configs.recommended, ...tseslint.configs.recommended, {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
        ecmaVersion: 2022,
        globals: globals.browser
    },
    plugins: { "react-hooks": reactHooks },
    rules: {
        ...reactHooks.configs.recommended.rules
    }
});
