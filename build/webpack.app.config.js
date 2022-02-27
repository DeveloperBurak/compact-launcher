const base = require('./webpack.base.config');
const css = require('./webpack.css.config');

const env = 'development';

module.exports = [css, base(env)];
