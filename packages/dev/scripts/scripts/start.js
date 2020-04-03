/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A 'start' script for Blockly extension packages.
 * @author samelh@google.com (Sam El-Husseini)
 */

'use strict';

const path = require('path');
const fs = require('fs');
const open = require('open');

const webpack = require('webpack');
const webpackDevServer = require('webpack-dev-server');
const webpackConfig = require('../config/webpack.config');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

const packageJson = require(resolveApp('package.json'));
console.log(`Running start for ${packageJson.name}`);

// Create the webpack configuration for the development environment.
// Build the test directory.
const config = webpackConfig({
  mode: 'development',
  buildTest: true
});
const compiler = webpack(config);

// Read the webpack devServer configuration.
const devServerConfig = config[0].devServer;
const port = devServerConfig.port;
const host = devServerConfig.host;
const page = devServerConfig.openPage;
const URL = `http://${host}:${port}/${page}`;

// Start the deve server.
const devServer = new webpackDevServer(compiler);
devServer.listen(port, host, async (err) => {
  if (err) {
    return console.log(err);
  }
  console.log('Starting the development server...\n');
  await open(URL);
});
