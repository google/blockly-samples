const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

// vue.config.js
module.exports = {
  devServer: {
    port: 3000
  },
  configureWebpack: {
    plugins: [
      // Copy over media resources from the Blockly package
      new CopyPlugin([
        {
          from: path.resolve(__dirname, './node_modules/blockly/media'),
          to: path.resolve(__dirname, 'dist/media')
        }
      ])
    ]
  }
}
