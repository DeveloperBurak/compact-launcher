// eslint-disable-next-line import/no-unresolved
const { run } = require('parallel-webpack');

const config = require.resolve('./webpack.app.config');
run(config, {
  watch: true,
  stats: true,
  maxConcurrentWorkers: 2,
});
