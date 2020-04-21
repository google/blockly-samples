/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A 'start' script for Blockly extension packages.
 * This script:
 *   Builds the src and test directories in development mode.
 *   Starts the webpack dev server which watches changes to these directories.
 *   Opens the test page `0.0.0.0:3000/test`.
 *   Hot reloads the page if any changes are made to the source files.
 * @author samelh@google.com (Sam El-Husseini)
 */

'use strict';

const path = require('path');
const fs = require('fs');

const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const webpackConfig = require('../config/webpack.config');
const webpackDevServerConfig = require('../config/webpackDevServer.config');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

const packageJson = require(resolveApp('package.json'));
console.log(`Running start for ${packageJson.name}`);

// Create the webpack configuration for the development environment.
// Build the test directory.
const config = webpackConfig({
  mode: 'development',
});
const compiler = webpack(config);

// Read the webpack devServer configuration.
const serverConfig = webpackDevServerConfig();
const port = serverConfig.port;
const host = serverConfig.host;

// Start the dev server.
const devServer = new WebpackDevServer(compiler, serverConfig);
devServer.listen(port, host, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log('Starting the development server...\n');
});
