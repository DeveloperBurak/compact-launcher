const childProcess = require('child_process');
const electron = require('electron');
const webpack = require('webpack');
const config = require('./webpack.app.config');

const compiler = webpack(config);

compiler.run((err) => {
  if (!err) {
    childProcess.spawn(electron, ['.'], { stdio: 'inherit' });
  }
});
