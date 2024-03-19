import antfu from '@antfu/eslint-config'
import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat()

export default antfu(
  {
    stylistic: false,
    markdown: false,
    gitignore: { strict: true },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
  },

  {
    ignores: ['**/dist/**', '**/node_modules/**'],
  },

  // Legacy config
  ...compat.config({
    extends: ['plugin:prettier/recommended'],
  }),

  {
    rules: {
      'unused-imports/no-unused-imports': 'error',
      'antfu/if-newline': 'off',
      'antfu/consistent-list-newline': 'off',
      'ts/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
)
