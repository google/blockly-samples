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
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const open = require('open');

const webpackConfig = require('../config/webpack.config');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

const packageJson = require(resolveApp('package.json'));
console.log(`Running start for ${packageJson.name}`);

const config = webpackConfig({
  mode: 'development',
  buildTest: true
});
const compiler = webpack(config);

const devServerConfig = config[0].devServer;
const port = devServerConfig.port;
const host = devServerConfig.host;
const page = devServerConfig.openPage;
const URL = `http://${host}:${port}/${page}`;

const devServer = new WebpackDevServer(compiler);
devServer.listen(port, host, async (err) => {
  if (err) {
    return console.log(err);
  }
  console.log('Starting the development server...\n');
  await open(URL);
});
