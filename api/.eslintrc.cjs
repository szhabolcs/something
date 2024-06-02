/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  ignorePatterns: ['dist'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json']
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'deprecation', 'prettier'],
  rules: {
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    'no-case-declarations': 'off',
    'deprecation/deprecation': 'error',
    'no-console': 'warn'
  },
  ignorePatterns: ['.eslintrc.cjs', 'dist', 'drizzle.config.ts', 'node_modules']
};
