import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
export default defineConfig({
    ignores: ['dist/**', 'node_modules/**']
}, {
    files: ['**/*.{js,jsx}'],
    extends: [js.configs.recommended],
    languageOptions: {
        globals: globals.browser
    },
    plugins: {
        'react-hooks': reactHooks,
        'react-refresh': reactRefresh
    },
    rules: {
        ...reactHooks.configs.flat.recommended.rules,
        'react-hooks/set-state-in-effect': 'off',
        'react-refresh/only-export-components': 'off'
    }
});
