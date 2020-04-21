/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Webpack configuration file.
 * @author samelh@google.com (Sam El-Husseini)
 */
'use strict';

const path = require('path');
const fs = require('fs');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

module.exports = (env) => {
  const mode = env.mode;
  const isProduction = mode === 'production';

  const srcEntry = `./src/index.${['js', 'ts'].find((ext) =>
    fs.existsSync(resolveApp(`./src/index.${ext}`))
  )}`;
  const testEntry = `./test/index.${['js', 'ts'].find((ext) =>
    fs.existsSync(resolveApp(`./test/index.${ext}`))
  )}`;

  return {
    mode,
    entry: isProduction ? srcEntry : testEntry,
    devtool: 'source-map',
    output: {
      path: isProduction ? resolveApp('dist') : resolveApp('build'),
      publicPath: isProduction ? '/dist/' : '/build/',
      filename: isProduction ? 'index.js' : 'test_bundle.js',
      libraryTarget: 'umd',
      globalObject: 'this',
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
    externals: isProduction ? {
      'blockly/core': {
        root: 'Blockly',
        commonjs: 'blockly/core',
        commonjs2: 'blockly/core',
        amd: 'blockly/core',
      },
    } : {},
  };
};
