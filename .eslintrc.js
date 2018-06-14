module.exports = {
  'extends': [
    'airbnb-base/legacy'
  ],
  'rules': {
    'spaced-comment': [ 2, 'always', { 'exceptions': [ '-', '+' ] } ],
    'no-restricted-syntax': [ 'off' ],
    'object-property-newline': [ 'off', { 'allowMultiplePropertiesPerLine': true } ],
    'linebreak-style': [ 'off' ],
    'no-console': [ 'off' ],
    'no-underscore-dangle': [ 'off' ],
    'consistent-return': ['off'],
    'vars-on-top': ['off'],
    'comma-dangle': [ 'error', {
        'arrays': 'never',
        'objects': 'never',
        'imports': 'never',
        'exports': 'never',
        'functions': 'ignore',
    }],
    'func-names': ['off'],
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
    log: false,
    importScripts: false,
  }
}
