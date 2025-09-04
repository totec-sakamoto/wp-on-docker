/**
 * @file Webpack configuration
 * @description Handles JS/Sass bundling, asset copying, manifest generation, linting, and live reload.
 */

const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')
const WebpackBar = require('webpackbar')
const { WebpackManifestPlugin } = require('webpack-manifest-plugin')
const ESLintPlugin = require('eslint-webpack-plugin')
const isDev = process.env.NODE_ENV === 'development'

/**
 * @typedef {Object} ThemeConfig
 * @property {string[]} entry - Entry points for JS and Sass
 * @property {string[]} dirsToCopy - Asset directories to copy
 * @property {string} containerUrl - Proxy URL for BrowserSync
 */

/** @type {ThemeConfig} */
const config = {
  entry: ['./js/main.js', './scss/main.scss'],
  dirsToCopy: ['img'],
  containerUrl: 'http://localhost:8080/',
}

/**
 * Generates copy patterns for asset directories.
 * @returns {Array<Object>} Copy patterns for CopyPlugin
 */
const generateCopyPatterns = () =>
  config.dirsToCopy.map((dir) => ({
    from: dir,
    to: dir,
  }))

module.exports = {
  // Set context to 'src' directory for cleaner imports
  context: path.resolve(__dirname, 'src'),

  // Entry points for JS and Sass
  entry: config.entry,

  // Output configuration
  output: {
    filename: isDev ? 'js/bundle.js' : 'js/bundle.[contenthash:8].js',
    path: path.resolve(__dirname, 'public/build'),
    clean: true, // Clean output directory before emit
  },

  // Module rules for handling different file types
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
        type: 'asset/resource', // Emits files as separate assets
      },
    ],
  },

  // Plugins for additional functionality
  plugins: [
    // Extract CSS to separate files
    new MiniCssExtractPlugin({
      filename: isDev ? 'css/main.css' : 'css/main.[contenthash:8].css',
      chunkFilename: '[id].css',
    }),

    // Copy asset directories to output
    new CopyPlugin({
      patterns: generateCopyPatterns(),
    }),

    // Lint JS files
    new ESLintPlugin({
      extensions: ['.js'],
      exclude: 'node_modules',
    }),

    // Enable live reload with BrowserSync
    new BrowserSyncPlugin(
      {
        ui: false,
        notify: false,
        proxy: config.containerUrl,
        files: ['public/**/*'],
      },
      { reload: false },
    ),

    // Generate manifest for asset mapping
    new WebpackManifestPlugin({
      fileName: 'webpack.manifest.json',
      publicPath: '/build',
      filter: (file) => /\.(js|css)$/.test(file.name),
      generate: (_, files) => {
        // Custom manifest structure for WordPress enqueue
        const manifest = {}
        files.forEach((file) => {
          const name = file.name.replace(/^src\//, '')
          manifest[name] = file.path
        })
        return manifest
      },
    }),

    // Show build progress bar in production
    ...(!isDev ? [new WebpackBar()] : []),
  ],

  // Optimization settings
  optimization: {
    minimizer: [
      '...', // Use default minimizers (Terser for JS)
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: [
            'default',
            {
              svgo: false, // Disable SVG optimization for CSS
            },
          ],
        },
      }),
    ],
  },

  // Enable source maps in development
  devtool: isDev ? 'source-map' : false,

  // Show only errors and warnings
  stats: 'errors-warnings',

  // Disable performance hints
  performance: {
    hints: false,
  },
}
