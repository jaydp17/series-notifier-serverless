const path = require('path');
const { CheckerPlugin } = require('awesome-typescript-loader');

module.exports = {
  entry: {
    messengerEntryFunction: './src/messenger-entry-function/index.ts',
    processQueryFunction: './src/process-query-function/index.ts',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  devtool: 'inline-source-map',
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
    loaders: [
      {
        test: /\.ts$/,
        loader: 'awesome-typescript-loader',
      },
    ],
  },
  plugins: [new CheckerPlugin()],
};
