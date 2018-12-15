const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const entry = path.resolve(__dirname, 'src', 'example', 'index.js');
const dist = path.resolve(__dirname, '.dist', 'example');

module.exports = {
  entry,
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  },
  devServer: {
    contentBase: dist,
    compress: true,
    port: 8081,
    host: '0.0.0.0',
    disableHostCheck: true
  },
  output: {
    path: dist,
    filename: 'example.js'
  },
  plugins: [new HtmlWebpackPlugin()],
  mode: 'development'
};
