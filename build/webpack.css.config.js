const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'production',
  entry: './src/stylesheets/main.scss',
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.css', '.scss'],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '../app/assets/css/main.css',
    }),
  ],
};
