module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'prettier' // eslint-config-prettier 的缩写
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 12,
    parser: '@typescript-eslint/parser',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  // eslint-plugin-vue @typescript-eslint/eslint-plugin eslint-plugin-prettier的缩写
  plugins: ['vue', '@typescript-eslint', 'prettier'],
  globals: {
    defineProps: 'readonly',
    defineEmits: 'readonly',
    defineExpose: 'readonly',
    withDefaults: 'readonly'
  },
  rules: {
    'prettier/prettier': [2, { endOfLine: 'auto' }],
    'vue/require-default-prop': 0,
    'vue/require-prop-types': 0,
    'vue/v-on-event-hyphenation': 0,
    'vue/attribute-hyphenation': 0,
    'vue/multi-word-component-names': 0,
    'vue/no-v-html': 0,
    'vue/no-dupe-keys': 0,
    'vue/valid-template-root': 0,
    'vue/no-reserved-component-names': 0,
    '@typescript-eslint/ban-ts-comment': 0,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/no-empty-function': 0,
    'no-empty': 0,
    'no-prototype-builtins': 0
  }
}
