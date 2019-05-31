module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'plugin:@typescript-eslint/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  rules: {
    '@typescript-eslint/interface-name-prefix': ['error', 'always'],
    
    '@typescript-eslint/explicit-function-return-type': ['off'], // TODO
    '@typescript-eslint/explicit-member-accessibility': ['off'], // TODO
    '@typescript-eslint/no-non-null-assertion': ['off'], // TODO
    '@typescript-eslint/no-angle-bracket-type-assertion': ['off'], // TODO
    'camelcase': ['off'], // TODO
    '@typescript-eslint/camelcase': ['off'], // TODO
    '@typescript-eslint/no-empty-interface': ['off'], // TODO
    '@typescript-eslint/no-object-literal-type-assertion': ['off'], // TODO
    '@typescript-eslint/no-unused-vars': ['off'], // TODO
    '@typescript-eslint/no-explicit-any': ['off'], // TODO
    '@typescript-eslint/type-annotation-spacing': ['off'], // TODO
    '@typescript-eslint/indent': ['off'], // TODO
    '@typescript-eslint/no-inferrable-types': ['off'], // TODO
    '@typescript-eslint/ban-types': ['off'], // TODO
    '@typescript-eslint/no-use-before-define': ['off'], // TODO
  }
}
