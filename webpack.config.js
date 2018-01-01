const path = require('path');
const { CheckerPlugin } = require('awesome-typescript-loader');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');

const env = process.env.NODE_ENV || 'development';
const isDebug = env === 'development';

module.exports = {
  entry: {
    messengerEntryFunction: './src/messenger-entry-function/index.ts',
    processQueryFunction: './src/process-query-function/index.ts',
    messengerReplyFunction: './src/messenger-reply-function/index.ts',
    'dispatch-notif': './src/cron/dispatch-notif.ts',
    'update-next-episode-cache': './src/cron/update-next-episode-cache.ts',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  devtool: isDebug ? 'eval' : 'source-map',
  output: {
    filename: '[name].js',
    libraryTarget: 'commonjs',
    path: path.resolve(__dirname, 'build'),
  },
  externals: {
    'aws-sdk': 'aws-sdk',
  },
  target: 'node',
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        // here TypeScript compiles to ESNext and babel transforms to node v6.10
        use: ['babel-loader', 'awesome-typescript-loader'],
      },
    ],
  },
  plugins: [new CheckerPlugin(), new LodashModuleReplacementPlugin({ paths: true })],
};
