var path = require('path');
var webpack = require('webpack');
const PugPlugin = require('pug-plugin');

module.exports = {
  entry: {
    index: './src/main.pug',
  },
  output: {
    path: path.join(__dirname, '../build/website'),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(css|sass|scss)$/i,
        use: ['css-loader', 'postcss-loader', 'sass-loader'],
      },
      {
        test: /\.(ico|png|jp?g|webp|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'img/[name].[hash:8][ext][query]',
        },
      },
      {
        test: /\.glb$/i,
        type: 'asset/resource',
        generator: {
          filename: 'models/[name].[hash:8][ext][query]',
        },
      },
      {
        test: /\.pdf$/i,
        type: 'asset/resource',
        generator: {
          filename: 'files/[name].[hash:8][ext][query]',
        },
      },
    ],
  },
  devtool: 'eval',
  target: 'web',
  plugins: [
    new PugPlugin({
      js: {
        // output filename of extracted JS file from source script defined in Pug
        filename: 'assets/js/[name].[contenthash:8].js',
      },
      css: {
        // output filename of extracted CSS file from source style defined in Pug
        filename: 'assets/css/[name].[contenthash:8].css',
      },
      loaderOptions: {
        // also resolve source files referenced in <a href>, e.g. the resume PDF
        sources: [{ tag: 'a', attributes: ['href'] }],
      },
    }),
  ],
};
