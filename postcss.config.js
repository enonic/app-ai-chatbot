const isDev = process.env.NODE_ENV !== 'production';

module.exports = {
  parser: false,
  map: { inline: isDev },
  plugins: {
    'postcss-normalize': {},
    autoprefixer: {},
    ...(isDev
      ? {}
      : {
        'css-mqpacker': {},
        'postcss-discard-comments': {},
        cssnano: {discardUnused: true}
      })
  }
};
