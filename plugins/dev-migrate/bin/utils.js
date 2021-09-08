/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Functions for creating migrations.
 */
'use strict';

const commander = require('commander');
const scriptPackageJson = require('../package.json');

const scriptName = scriptPackageJson.name;

const command = new commander.Command(scriptName)
    .version(
        scriptPackageJson.version,
        '-V, --version',
        'output the version of this script');

const runCommand = async function(opts) {
  await command.parseAsync(opts);
};
/** @package */
exports.runCommand = runCommand;

const addMigration = function(version, name, description, configureCallback) {
  const subCommand = new commander.Command(`${version}-${name}`)
      .description(description);
  configureCallback(subCommand);
  command.addCommand(subCommand, description);
};
/** @package */
exports.addMigration = addMigration;
