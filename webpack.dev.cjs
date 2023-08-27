const { merge } = require('webpack-merge');
const common = require('./webpack.common.cjs');

module.exports = merge(common, {
  mode: 'development',
  devtool: "eval-source-map",
  devServer: {
		hot: false,
		host: "0.0.0.0",
    port: 8080
  },
});
