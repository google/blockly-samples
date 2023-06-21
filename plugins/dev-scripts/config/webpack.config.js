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

const fs = require('fs');
const path = require('path');
const webpack = require('webpack');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

const packageJson = require(resolveApp('package.json'));

const ESLintPlugin = require('eslint-webpack-plugin');

module.exports = (env) => {
  const mode = env.mode;
  const isDevelopment = mode === 'development';
  const isProduction = mode === 'production';
  const isTest = mode === 'test';
  const isTypescript = fs.existsSync(resolveApp('tsconfig.json'));

  let entry;
  let outputFile;
  let target = 'web';
  if (isProduction) { // Production.
    ['js', 'ts'].filter((ext) =>
      fs.existsSync(resolveApp(`./src/index.${ext}`))
    ).forEach((ext) => {
      entry = `./src/index.${ext}`;
    });
    outputFile = 'index.js';
  } else if (isDevelopment) { // Development.
    ['js', 'ts'].filter((ext) =>
      fs.existsSync(resolveApp(`./test/index.${ext}`))
    ).forEach((ext) => {
      entry = `./test/index.${ext}`;
    });
    outputFile = 'test_bundle.js';
  } else if (isTest) { // Test.
    // Create an entry point for each .mocha.js file.
    fs.readdirSync('./test/')
        .filter((file) => file.substr(-9) === '.mocha.js')
        .forEach((file) => {
          const entryName = file.replace(/\.mocha\.js/i, '');
          if (!entry) entry = {};
          entry[entryName] = `./test/${file}`;
        });
    outputFile = '[name].mocha.js';
    target = 'node';
  }

  // Add 'dist' to the end of the blockly module alias if we have acquired
  // blockly from git instead of npm.
  let blocklyAliasSuffix = '';
  const blocklyDependency =
    (packageJson.dependencies && packageJson.dependencies['blockly']) ||
    (packageJson.devDependencies && packageJson.devDependencies['blockly']);
  if (blocklyDependency && blocklyDependency.indexOf('git://') === 0) {
    blocklyAliasSuffix = '/dist';
  }

  return {
    target,
    mode: isProduction ? 'production' : 'development',
    entry: entry,
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    output: {
      path: isProduction ? resolveApp('dist') : resolveApp('build'),
      publicPath: isProduction ? '/dist/' : '/build/',
      filename: outputFile,
      libraryTarget: 'umd',
      globalObject: 'this',
      clean: true,
    },
    resolve: {
      alias: {
        'blockly': resolveApp(`node_modules/blockly${blocklyAliasSuffix}`),
      },
      extensions: ['.ts', '.js']
          .filter((ext) => isTypescript || !ext.includes('ts')),
      fallback: {
        'util': false,
      },
    },
    module: {
      rules: [
        // Load Blockly source maps.
        {
          test: /(blockly\/.*\.js)$/,
          use: [require.resolve('source-map-loader')],
          enforce: 'pre',
        },
        isTypescript && {
          test: /\.tsx?$/,
          loader: require.resolve('ts-loader'),
        },
      ].filter(Boolean),
    },
    // Ignore spurious warnings from source-map-loader
    // It can't find source maps for some Closure modules and that is expected
    ignoreWarnings: [/Failed to parse source map/],
    plugins: [
      // Add package name.
      new webpack.DefinePlugin({
        'process.env.PACKAGE_NAME': JSON.stringify(packageJson.name),
      }),
      // canvas should only be required by jsdom if the 'canvas' package is
      // installed in package.json. Ignoring canvas require errors.
      isTest && new webpack.IgnorePlugin({
        resourceRegExp: /canvas$/,
      }),
      // Run the linter.
      !env.skipLint && new ESLintPlugin({
        cache: true,
        cacheLocation: path.join('node_modules/.cache/eslint/'),
        formatter: 'stylish',
        emitWarning: isDevelopment,
        eslintPath: require.resolve('eslint'),
        resolvePluginsRelativeTo: __dirname,
        useEslintrc: false,
        baseConfig: {
          extends: [require.resolve('@blockly/eslint-config')],
        },
      }),
    ].filter(Boolean),
    externals: isProduction ? {
      'blockly/core': {
        root: 'Blockly',
        commonjs: 'blockly/core',
        commonjs2: 'blockly/core',
        amd: 'blockly/core',
      },
      'blockly/javascript': {
        root: 'Blockly.JavaScript',
        commonjs: 'blockly/javascript',
        commonjs2: 'blockly/javascript',
        amd: 'blockly/javascript',
      },
      'blockly/python': {
        root: 'Blockly.Python',
        commonjs: 'blockly/python',
        commonjs2: 'blockly/python',
        amd: 'blockly/python',
      },
      'blockly/dart': {
        root: 'Blockly.Dart',
        commonjs: 'blockly/dart',
        commonjs2: 'blockly/dart',
        amd: 'blockly/dart',
      },
      'blockly/php': {
        root: 'Blockly.PHP',
        commonjs: 'blockly/php',
        commonjs2: 'blockly/php',
        amd: 'blockly/php',
      },
      'blockly/lua': {
        root: 'Blockly.Lua',
        commonjs: 'blockly/lua',
        commonjs2: 'blockly/lua',
        amd: 'blockly/lua',
      },
    } : {},
  };
};
