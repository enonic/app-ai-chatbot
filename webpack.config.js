const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// const { InjectManifest } = require('workbox-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');

const isDev = process.env.NODE_ENV !== 'production';

const paths = {
  assets: 'src/main/resources/assets/',
  buildLib: 'build/resources/main/lib/',
  buildAssets: 'build/resources/main/assets/',
  buildPwaLib: 'build/resources/main/lib/pwa/'
};

const assetsPath = path.join(__dirname, paths.assets);
const buildLibPath = path.join(__dirname, paths.buildLib);
const buildAssetsPath = path.join(__dirname, paths.buildAssets);
// const buildPwaLibPath = path.join(__dirname, paths.buildPwaLib);

module.exports = {
  entry: {
    chat: path.join(assetsPath, 'js/chat.js'),
    tool: path.join(assetsPath, 'js/tool/tool.js')
  },
  output: {
    path: buildAssetsPath,
    filename: 'precache/bundle.[name].js'
  },
  resolve: {
    extensions: ['.js', '.less', '.css']
  },
  module: {
    rules: [
      {
        test: /\.less$/,
        use: [
          { loader: MiniCssExtractPlugin.loader, options: { publicPath: '../' } },
          { loader: 'css-loader', options: { sourceMap: false, importLoaders: 1 } },
          { loader: 'postcss-loader', options: { sourceMap: false } },
          { loader: 'less-loader', options: { sourceMap: false } }
        ]
      },
      {
        test: /\.(eot|woff|woff2|ttf)$/,
        use: 'file-loader?name=precache/font/[name].[ext]'
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: 'file-loader?name=precache/img/[name].[ext]'
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'precache/bundle.css'
    }), /*
    new InjectManifest({
      swSrc: path.join(assetsPath, 'js/sw-dev.js'),
      swDest: path.join(buildPwaLibPath, 'sw-template.js')
    }),*/
    new CopyPlugin([
      { from: 'mercer/templates.js', to: buildLibPath },
      { from: 'mercer/actions.js', to: buildLibPath }
    ])
  ],
  devtool: isDev ? 'source-map' : false
};
