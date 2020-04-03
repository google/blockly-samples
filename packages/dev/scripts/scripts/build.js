/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A 'build' script for Blockly extension packages.
 * @author samelh@google.com (Sam El-Husseini)
 */

'use strict';

const args = process.argv.slice(2);
const path = require('path');
const fs = require('fs');

const webpack = require('webpack');
const webpackConfig = require('../config/webpack.config');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

const packageJson = require(resolveApp('package.json'));
const mode = args.length > 0 && args[0] == 'prod' ?
  'production' : 'development';
console.log(`Running ${mode} build for ${packageJson.name}`);

// Create the webpack configuration for based on the build environment.
const config = webpackConfig({
  mode,
});

// Create and run the webpack compiler.
webpack(config, (err, stats) => {
  if (err) {
    console.error(err.stack || err);
    if (err.details) {
      console.error(err.details);
    }
    return;
  }
  console.log(stats.toString({
    chunks: false, // Makes the build much quieter
    colors: true, // Shows colors in the console
  }));
});
