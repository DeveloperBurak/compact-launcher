const path = require('path');
// eslint-disable-next-line import/no-unresolved
const ElectronReloadPlugin = require('webpack-electron-reload')({
  path: path.join(__dirname, '..', 'app', 'background.js'),
});

// eslint-disable-next-line import/no-unresolved, import/no-extraneous-dependencies
const { merge } = require('webpack-merge');
const base = require('./webpack.base.config');
const css = require('./webpack.css.config');

const env = 'development';

module.exports = [
  css,
  merge(base(env), {
    target: 'electron-main',
    plugins: [ElectronReloadPlugin()],
  }),
];
