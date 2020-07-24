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
const resolve = require('resolve');
const webpack = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

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
  // Blockly from git instead of npm.
  let blocklyAliasSuffix = '';
  const blocklyDependencyJson = resolveApp('node_modules/blockly');
  if (fs.existsSync(blocklyDependencyJson)) {
    const blocklyJson = require(blocklyDependencyJson);
    if (blocklyJson['_from'].indexOf('git://') === 0) {
      blocklyAliasSuffix = '/dist';
    }
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
    },
    resolve: {
      alias: {
        'blockly': resolveApp(`node_modules/blockly${blocklyAliasSuffix}`),
      },
      extensions: ['.ts', '.js']
          .filter((ext) => isTypescript || !ext.includes('ts')),
    },
    module: {
      rules: [
        // Run the linter.
        {
          test: /\.(js|mjs|ts)$/,
          enforce: 'pre',
          use: [
            {
              options: {
                cache: true,
                formatter: 'stylish',
                emitWarning: true,
                eslintPath: require.resolve('eslint'),
                resolvePluginsRelativeTo: __dirname,
                useEslintrc: false,
                baseConfig: {
                  extends: [require.resolve('@blockly/eslint-config')],
                },
              },
              loader: require.resolve('eslint-loader'),
            },
          ],
          include: [resolveApp('./src/'), resolveApp('./test/')],
        },
        // Load Blockly source maps.
        {
          test: /(blockly\/.*\.js)$/,
          use: [require.resolve('source-map-loader')],
          enforce: 'pre',
        },
        // Run babel to compile both JS and TS.
        {
          test: /\.(js|mjs|ts)$/,
          exclude: /(node_modules|build|dist)/,
          loader: require.resolve('babel-loader'),
          options: {
            babelrc: false,
            configFile: false,
            presets: [
              require.resolve('@babel/preset-env'),
              isTypescript && require.resolve('@babel/preset-typescript'),
            ].filter(Boolean),
            compact: isProduction,
          },
        },
      ],
    },
    plugins: [
      // Typecheck TS.
      isTypescript &&
      new ForkTsCheckerWebpackPlugin({
        typescript: resolve.sync('typescript', {
          basedir: resolveApp('node_modules'),
        }),
        async: isDevelopment,
        useTypescriptIncrementalApi: true,
        checkSyntacticErrors: true,
        tsconfig: resolveApp('tsconfig.json'),
        reportFiles: [
          '**',
        ],
        silent: true,
      }),
      // canvas should only be required by jsdom if the 'canvas' package is
      // installed in package.json. Ignoring canvas require errors.
      isTest && new webpack.IgnorePlugin(/canvas$/),
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
