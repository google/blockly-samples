/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A 'postinstall' script for Blockly extension packages.
 * This script:
 *   Completes post install tasks if necessary.
 * @author samelh@google.com (Sam El-Husseini)
 */

'use strict';

const fs = require('fs');
const path = require('path');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

const packageJson = require(resolveApp('package.json'));
const blocklyPath = resolveApp('node_modules/blockly');
const blocklyPackageJson = path.join(blocklyPath, 'package.json');

// Check if we have installed blockly from git instead of npm.

if (!fs.existsSync(blocklyPackageJson)) {
  return;
}

const blocklyJson = require(blocklyPackageJson);
if (!blocklyJson || blocklyJson['_from'].indexOf('git://') < 0) {
  return;
}

// Blockly was installed from a Git repo. Install and build.
console.log(`Running postinstall steps for ${packageJson.name}`);

// Run npm install.
execSync(`npm install`, {cwd: blocklyPath, stdio: [0, 1, 2]});

// Build.
execSync(`npm run build`, {cwd: blocklyPath, stdio: [0, 1, 2]});

// Package.
execSync(`npm run package`, {cwd: blocklyPath, stdio: [0, 1, 2]});
