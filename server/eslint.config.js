import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        process: 'readonly',
        console: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
      'no-underscore-dangle': 'off',
      'consistent-return': 'off',
      'no-param-reassign': ['error', { props: false }],
    },
  },
];
