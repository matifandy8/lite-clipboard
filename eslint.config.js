import logux from '@logux/eslint-config'
import tseslintPlugin from '@typescript-eslint/eslint-plugin'
import tseslintParser from '@typescript-eslint/parser'

export default [
  ...logux,
  {
    ignores: ['dist/**', '**/*.js', '**/*.d.ts']
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslintParser
    },
    plugins: {
      '@typescript-eslint': tseslintPlugin
    },
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-unused-vars': 'off',
      'n/no-unsupported-features/node-builtins': 'off',
      'no-throw-literal': 'off',
      'perfectionist/sort-imports': 'off',
      'perfectionist/sort-named-exports': 'off',
      'perfectionist/sort-named-imports': 'off',
      'perfectionist/sort-objects': 'off',
      'prefer-let/prefer-let': 'off'
    }
  }
]
