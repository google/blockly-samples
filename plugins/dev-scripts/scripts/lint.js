/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A 'lint' script for Blockly extension packages.
 * This script:
 *   Runs eslint on the src and test directories.
 * @author samelh@google.com (Sam El-Husseini)
 */

'use strict';

const fs = require('fs');
const path = require('path');
const CLIEngine = require('eslint').CLIEngine;

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

const packageJson = require(resolveApp('package.json'));
console.log(`Running lint for ${packageJson.name}`);

// Create the eslint engine.
const eslintConfig = require('@blockly/eslint-config');
const cli = new CLIEngine({
  extensions: ['.js', '.ts'],
  baseConfig: eslintConfig,
  useEslintrc: false,
  resolvePluginsRelativeTo: __dirname,
});
const formatter = cli.getFormatter();

// Run eslint for both the src and test directories.
// The eslint engine will use the .eslintrc under plugins/ for configuration.
const dirs = ['src', 'test'];
dirs.forEach((dir) => {
  const resolvePath = resolveApp(dir);
  if (fs.existsSync(resolvePath)) {
    const report = cli.executeOnFiles([dir]);
    console.log(formatter(report.results));
  }
});
