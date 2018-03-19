module.exports = {
  'extends': [
    'airbnb-base/legacy',
    'prettier'
  ],
  'plugins': [
    'prettier',
  ],
  'rules': {
    'spaced-comment': [ 2, 'always', { 'exceptions': [ '-', '+' ] } ],
    'no-restricted-syntax': [ 'off' ],
    'object-property-newline': [ 'off', { 'allowMultiplePropertiesPerLine': true } ],
    'linebreak-style': 'off',
    'no-underscore-dangle': [ 'off' ],
    'comma-dangle': [ 'error', {
        'arrays': 'never',
        'objects': 'never',
        'imports': 'never',
        'exports': 'never',
        'functions': 'ignore',
    }],
    'func-names': ['off'],
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
    'node': true
  },
  'globals': {
    __: false,
    api: false,
    app: false,
    CONFIG: false,
    resolve: false,
  }
}
