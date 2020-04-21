/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Webpack base configuration file.
 * @author samelh@google.com (Sam El-Husseini)
 */

const path = require('path');
const fs = require('fs');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

module.exports = (env) => {
  const devServer = {
    port: 3000,
    host: '0.0.0.0',
    watchOptions: {
      ignored: /node_modules/,
    },
  };
  if (env.buildTest) {
    devServer.openPage = 'test';
    devServer.open = true;
  }

  const src = {
    name: 'src',
    mode: env.mode,
    entry: './src/index.js',
    devtool: 'source-map',
    output: {
      path: resolveApp('dist'),
      publicPath: '/dist/',
      filename: 'index.js',
      libraryTarget: 'umd',
      globalObject: 'this',
    },
    module: {
      rules: [{
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: require.resolve('babel-loader'),
          options: {
            presets: [require.resolve('@babel/preset-env')],
          },
        },
      }],
    },
    devServer: devServer,
    externals: {
      'blockly/core': {
        root: 'Blockly',
        commonjs: 'blockly/core',
        commonjs2: 'blockly/core',
        amd: 'blockly/core',
      },
    },
  };
  const webpackExports = [src];

  if (env.buildTest) {
    const test = {
      name: 'test',
      mode: 'development',
      entry: './test/index.js',
      devtool: 'source-map',
      output: {
        path: resolveApp('build'),
        publicPath: '/build/',
        filename: 'test_bundle.js',
      },
      resolve: {
        alias: {
          'blockly': resolveApp('node_modules/blockly'),
        },
      },
      module: {
        rules: [{
          test: /\.js$/,
          exclude: /(node_modules)/,
          use: {
            loader: require.resolve('babel-loader'),
            options: {
              presets: [require.resolve('@babel/preset-env')],
            },
          },
        }],
      },
    };
    webpackExports.push(test);
  }
  return webpackExports;
};
