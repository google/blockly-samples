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
const execSync = require('child_process').execSync;

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

const packageJson = require(resolveApp('package.json'));
const blocklyNodeModulesPath = resolveApp('node_modules/blockly');

// Check if we have installed blockly from git instead of npm.
const blocklyDependency =
  (packageJson.dependencies && packageJson.dependencies['blockly']) ||
  (packageJson.devDependencies && packageJson.devDependencies['blockly']);

if (!blocklyDependency) {
  return;
}

if (blocklyDependency.indexOf('git://') !== 0) {
  return;
}

// Blockly was installed from a Git repo. Install and build.
console.log(`Running postinstall steps for ${packageJson.name}`);

// Run npm install.
execSync(`npm install`, {cwd: blocklyNodeModulesPath, stdio: [0, 1, 2]});

// Build.
execSync(`npm run build`, {cwd: blocklyNodeModulesPath, stdio: [0, 1, 2]});

// Package.
execSync(`npm run package`, {cwd: blocklyNodeModulesPath, stdio: [0, 1, 2]});
