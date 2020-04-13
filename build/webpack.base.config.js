const path = require('path');
const fs = require('fs');
const nodeExternals = require('webpack-node-externals');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');

const translateEnvToMode = (env) => {
  if (env === 'production') {
    return 'production';
  }
  return 'development';
};

module.exports = (env) => ({
  target: 'electron-renderer',
  devtool: 'source-map',
  mode: translateEnvToMode(env),
  node: {
    __dirname: false,
    __filename: false,
  },
  entry: async () => {
    const files = fs.readdirSync('./src/views/').filter((name) => name.match(/\.js$/));
    const entries = {};
    files.forEach((name) => {
      entries[name] = `./src/views/${name}`;
    });
    entries['background.js'] = './src/background.js';
    return entries;
  },
  output: {
    filename: '[name]',
    path: path.resolve(__dirname, '../app'),
  },
  externals: [nodeExternals()],
  resolve: {
    alias: {
      env: path.resolve(__dirname, `../config/env_${env}.json`),
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new FriendlyErrorsWebpackPlugin({
      clearConsole: env === 'development',
    }),
  ],
});
