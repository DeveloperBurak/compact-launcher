const path = require("path");
const merge = require("webpack-merge");
const base = require("./webpack.base.config");

module.exports = (env) => {
  return merge(base(env), {
    entry: {
      background: "./src/background.js",
      collapsed: "./src/views/collapsed.js",
      app: "./src/views/app.js",
      expanded: "./src/views/expanded.js",
      settings: "./src/views/settings.js",
      tools: "./src/views/tools.js"
    },
    output: {
      filename: "[name].js",
      path: path.resolve(__dirname, "../app"),
    },
  });
};
