const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')
const WebpackBar = require('webpackbar')
const { WebpackManifestPlugin } = require('webpack-manifest-plugin')
const ESLintPlugin = require('eslint-webpack-plugin')
const isDev = process.env.NODE_ENV === 'development'
const config = {
  entry: ['./js/main.js', './scss/main.scss'],
  dirsToCopy: ['img'],
  containerUrl: 'http://localhost:8080/',
}
const generateCopyPatterns = () =>
  config.dirsToCopy.map((dir) => ({
    from: dir,
    to: dir,
  }))

module.exports = {
  context: path.resolve(__dirname, 'src'),
  entry: config.entry,
  output: {
    filename: isDev ? 'js/bundle.js' : 'js/bundle.[contenthash:8].js',
    path: path.resolve(__dirname, 'public/build'),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: isDev ? 'css/main.css' : 'css/main.[contenthash:8].css',
      chunkFilename: '[id].css',
    }),
    new CopyPlugin({
      patterns: generateCopyPatterns(),
    }),
    new ESLintPlugin({
      extensions: ['.js'],
      exclude: 'node_modules',
    }),
    new BrowserSyncPlugin({
      ui: false,
      notify: false,
      proxy: config.containerUrl,
      files: ['public/**/*.php'],
    }),
    new WebpackManifestPlugin({
      fileName: 'webpack.manifest.json',
      publicPath: '/build',
      filter: (file) => /\.(js|css)$/.test(file.name),
    }),
    ...(!isDev ? [new WebpackBar()] : []),
  ],
  optimization: {
    minimizer: [
      '...',
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: [
            'default',
            {
              svgo: false,
            },
          ],
        },
      }),
    ],
  },
  devtool: isDev ? 'source-map' : false,
  stats: 'errors-warnings',
  performance: {
    hints: false,
  },
}
