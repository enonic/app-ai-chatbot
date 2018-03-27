module.exports = {
  'extends': [
    'airbnb',
    'prettier'
  ],
  'plugins': [
    'prettier',
  ],
  'rules': {
    'spaced-comment': [ 2, 'always', { 'exceptions': [ '-', '+' ] } ],
    'no-restricted-syntax': [ 'off' ],
    'object-property-newline': [ 'off', { 'allowMultiplePropertiesPerLine': true } ],
    'linebreak-style': [ 'off' ],
    'no-console': [ 'off' ],
    'no-underscore-dangle': [ 'off' ],
    'comma-dangle': [ 'error', {
        'arrays': 'never',
        'objects': 'never',
        'imports': 'never',
        'exports': 'never',
        'functions': 'ignore',
    }],
    'import/no-extraneous-dependencies': [ 'off', { 'devDependencies': [ 'util/', '**/*.test.js', '**/*.spec.js' ] } ],
    'prettier/prettier': ['error', {
      'singleQuote': true,
      'printWidth': 80,
      'tabWidth': 2
    }],
    // 'quotes': ['error', 'single'],
    // no support in 'babel-eslint'; should be 'error'
    'no-await-in-loop': [ 'off' ],
  },
  'env': {
    'browser': true
  }
}
