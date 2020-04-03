/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const fs = require('fs');
const path = require('path');
const CLIEngine = require('eslint').CLIEngine;

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

const cli = new CLIEngine();

const formatter = cli.getFormatter();

const dirs = ['src', 'test'];
dirs.forEach((dir) => {
  const resolvePath = resolveApp(dir);
  if (fs.existsSync(resolvePath)) {
    const report = cli.executeOnFiles(resolvePath);
    console.log(formatter(report.results));
  }
});
