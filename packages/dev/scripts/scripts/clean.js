/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

const dirs = ['dist', 'build'];
dirs.forEach((dir) => {
  rimraf.sync(resolveApp(dir));
});
