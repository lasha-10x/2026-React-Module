import js from '@eslint/js';
import { defineConfig } from 'eslint/config';

import reactHooks from 'eslint-plugin-react-hooks';

export default defineConfig([
  { ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'tests/**'] },
  {
    files: ['src/**/*.{js,jsx}', 'vite.config.js'],
    extends: [js.configs.recommended],
    plugins: { 'react-hooks': reactHooks },
    rules: {

      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
]);
