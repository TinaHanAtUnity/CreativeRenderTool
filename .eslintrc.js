module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    '@typescript-eslint/tslint',
  ],
  extends: [
    'plugin:@typescript-eslint/recommended',
  ],
  parserOptions: {
    project: 'tsconfig.json',
  },
  rules: {
    '@typescript-eslint/tslint/config': ['error', {
      'lintFile': './tslint.json'
    }],
    'keyword-spacing': ['error'],
    'no-irregular-whitespace': ['error'],
    'semi': ['error', 'always'],
    'no-multiple-empty-lines': ['error', {'max': 1, 'maxEOF': 1}],
    'eol-last': ['error', 'always'],
    '@typescript-eslint/interface-name-prefix': ['error', 'always'],
    'no-trailing-spaces': ['error'],
    'no-tabs': ['error'],
    
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
    '@typescript-eslint/indent': ['off'], // TODO
    '@typescript-eslint/no-inferrable-types': ['off'], // TODO
  }
}
