const path = require('path')
const { merge } = require('webpack-merge')
const base = require('./webpack.base.config')
const css = require('./webpack.css.config')

const ElectronReloadPlugin = require('webpack-electron-reload')({
  path: path.join(__dirname, '..', 'app', 'background.js'),
})
const env = 'development'

module.exports = [
  css,
  merge(base(env), {
    target: 'electron-main',
    plugins: [ElectronReloadPlugin()],
  }),
]
