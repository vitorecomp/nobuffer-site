var path = require("path");
var webpack = require("webpack");
const PugPlugin = require("pug-plugin");

const baseConfig = require("./webpack.config.js");

module.exports = {
  ...baseConfig,
  output: {
    path: path.join(__dirname, "../build-dev/website"),
    clean: true,
  },
};
