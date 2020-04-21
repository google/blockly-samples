/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * @fileoverview Webpack dev server configuration file.
 * @author samelh@google.com (Sam El-Husseini)
 */
'use strict';

const path = require('path');
const fs = require('fs');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

module.exports = () => {
  return {
    port: 3000,
    host: '0.0.0.0',
    hot: true,
    quiet: true,
    publicPath: resolveApp('build'),
    writeToDisk: true,
    watchOptions: {
      ignored: /node_modules/,
    },
    openPage: 'test',
    open: true,
  };
};
