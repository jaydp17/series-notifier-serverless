const path = require('path');
const slsw = require('serverless-webpack');
const webpack = require('webpack');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const _ = require('lodash');

const env = process.env.NODE_ENV || 'development';
const isDebug = env === 'development';
const isProd = !isDebug;

const entries = _.isEmpty(slsw.lib.entries) ? './src/messenger-entry-function/index.ts' : slsw.lib.entries;

module.exports = {
  entry: entries,
  resolve: {
    extensions: ['.ts', '.js'],
    // webpack defaults to `module` and `main`, but that's
    // not really what node.js supports, so we reset it
    mainFields: ['main'],
  },
  devtool: isProd ? 'source-map' : 'cheap-module-eval-source-map',
  mode: isProd ? 'production' : 'development',
  target: 'node',
  node: false,
  output: {
    libraryTarget: 'commonjs2',
    path: path.join(process.cwd(), '.webpack'),
    filename: '[name].js',
  },
  externals: ['aws-sdk'],
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          configFile: path.join(__dirname, './.babelrc'),
          cacheDirectory: true,
          cacheCompression: false,
        },
      },
    ],
  },
  optimization: {
    // the below makes sure webpack doesn't touch NODE_ENV
    // because the default behavior for webpack is to set NODE_ENV = 'development' | 'production' depending on the mode at compile time
    nodeEnv: false,
    // minimize: false,
    // concatenateModules: false,
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.IS_OFFLINE': JSON.stringify(!isProd),
      'process.env.IS_LOCAL': JSON.stringify(!isProd),
    }),
    new LodashModuleReplacementPlugin({ paths: true }),
  ],
};
