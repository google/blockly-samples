/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A 'test' script for Blockly extension packages.
 * This script:
 *   Runs mocha tests on all *.mocha.js tests in the test directory.
 * @author samelh@google.com (Sam El-Husseini)
 */

'use strict';

const Mocha = require('mocha');
const fs = require('fs');
const path = require('path');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

const packageJson = require(resolveApp('package.json'));
console.log(`Running test for ${packageJson.name}`);

const testDir = resolveApp('test');

let mochaConfig = {
  ui: 'tdd',
};
// If custom configuration exists, use that instead.
if (fs.existsSync(path.join(testDir, '.mocharc.js'))) {
  mochaConfig = require(path.join(testDir, '.mocharc.js'));
}

// Instantiate a Mocha instance.
const mocha = new Mocha(mochaConfig);

// Run mocha for each mocha .js file.
fs.readdirSync(testDir).filter((file) => {
  // Only keep the .mocha.js files
  return file.substr(-9) === '.mocha.js';
}).forEach((file) => {
  mocha.addFile(path.join(testDir, file));
});

// Run the tests.
mocha.run((failures) => {
  // exit with non-zero status if there were failures.
  process.exitCode = failures ? 1 : 0;
});
