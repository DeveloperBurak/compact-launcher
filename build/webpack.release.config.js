const base = require('./webpack.base.config');
const css = require('./webpack.css.config');

module.exports = [css, base('production')];
