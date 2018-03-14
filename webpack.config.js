const ExtractTextPlugin = require('extract-text-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const path = require('path');

const paths = {
    assets: 'src/main/resources/assets/',
    buildAssets: 'build/resources/main/assets/',
    buildPwaLib: 'build/resources/main/lib/pwa/'
};

const assetsPath = path.join(__dirname, paths.assets);
const buildAssetsPath = path.join(__dirname, paths.buildAssets);
const buildPwaLibPath = path.join(__dirname, paths.buildPwaLib);

module.exports = {
    entry: path.join(assetsPath, 'js/main.js'),
    output: {
        path: buildAssetsPath,
        filename: 'precache/bundle.js'
    },
    resolve: {
        extensions: ['.js', '.less', '.css']
    },
    module: {
        rules: [
            {
                test: /\.less$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    publicPath: '../',
                    use: [
                        { loader: 'css-loader', options: { sourceMap: true, importLoaders: 1 } },
                        { loader: 'postcss-loader', options: { sourceMap: true, config: { path: 'postcss.config.js' } } },
                        { loader: 'less-loader', options: { sourceMap: true } }
                    ]
                })
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
      new ExtractTextPlugin({
            filename: 'precache/bundle.css',
            allChunks: true,
            disable: false
        }),
        new WorkboxPlugin({
            globDirectory: buildAssetsPath,
            globPatterns: ['precache/**\/*'],
            globIgnores: [],
            swSrc: path.join(assetsPath, 'js/sw-dev.js'),
            swDest: path.join(buildPwaLibPath, 'sw-template.js')
        })
    ]

};
