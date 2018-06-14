module.exports = {
  'extends': [
    'airbnb'
  ],
  'rules': {
    'spaced-comment': [ 2, 'always', { 'exceptions': [ '-', '+' ] } ],
    'no-restricted-syntax': [ 'off' ],
    'object-property-newline': [ 'off', { 'allowMultiplePropertiesPerLine': true } ],
    'linebreak-style': [ 'off' ],
    'no-console': [ 'off' ],
    'no-underscore-dangle': [ 'off' ],
    'no-prototype-builtins': ['off'],
    'comma-dangle': [ 'error', {
        'arrays': 'never',
        'objects': 'never',
        'imports': 'never',
        'exports': 'never',
        'functions': 'ignore',
    }],
    'import/no-extraneous-dependencies': [ 'off', { 'devDependencies': [ 'util/', '**/*.test.js', '**/*.spec.js' ] } ],
    // 'quotes': ['error', 'single'],
    // no support in 'babel-eslint'; should be 'error'
    'no-await-in-loop': [ 'off' ],
  },
  'env': {
    'browser': true
  }
}
