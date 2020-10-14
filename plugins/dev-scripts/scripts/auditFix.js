/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview An audit and fix script for Blockly extension packages.
 * This script:
 *   - Runs `npm install` to get a clean (not locally linked) installation.
 *   - Runs `npm audit fix` to do the fixes.
 * @author fenichel@google.com (Rachel Fenichel)
 */
'use strict';

const execSync = require('child_process').execSync;

console.log(`Running npm audit fix steps for ${packageJson.name}`);

// Run npm install.
execSync(`npm install`, {stdio: [0, 1, 2] });

// Audit fix.
execSync(`npm audit fix`, {stdio: [0, 1, 2] });
