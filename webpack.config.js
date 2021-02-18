const nodeExternals = require('webpack-node-externals');
const path = require('path');

module.exports = {
  target: 'node',
  externals: [
    nodeExternals({modulesFromFile: true,})
  ],
  entry: {
    './src/index': './src/index.js',
    './src/development': './src/development.js',
  },
  node: {
    fs: 'empty',
    child_process: 'empty',
  },
  output: {
    path: __dirname + "/dist",
    filename: '[name].js',
    libraryTarget: 'commonjs2',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  }
};
