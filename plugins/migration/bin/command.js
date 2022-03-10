#!/usr/bin/env node
/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview The command building utilities for the migration script.
 */

import chalk from 'chalk';
import {Command} from 'commander';

// TODO: Not sure the best way to access the JSON from node.
import {createRequire} from 'module';
const require = createRequire(import.meta.url);
const scriptPackageJson = require('../package-lock.json');


const SCRIPT_NAME = scriptPackageJson.name;

export const ROOT_COMMAND = new Command(SCRIPT_NAME)
    .version(
        scriptPackageJson.version,
        '-v, --version',
        'output the version of this script')
    .usage(`${chalk.blue('<migration>')} ` +
        `${chalk.green('<from-version> <to-version>')} [options] ` +
        `${chalk.green('<file...>')}`);

/**
 * Creates a command with the basic format expected by the migrate script,
 * and automatically adds it as a subcommand. It is then returned so it can be
 * configured.
 * @param {string} name The name of the subcommand.
 * @param {string} _targetVersionRange The range of target versions of Blockly
 *     this command assists in migrating to.
 * @return {!Command} The basic subcommand.
 */
export function createAndAddSubCommand(name, _targetVersionRange) {
  // TODO: Use targetVersion to create more informative help text.

  const subCommand = new Command(name)
      .argument('<from-version>', 'Blockly version to migrate from')
      // TODO: Make the to-version optional (default to latest non-beta version
      //     of Blockly).
      .argument('<to-version>', 'Blockly version to migrate to')
      .argument('<file...>', 'Files to migrate');
  ROOT_COMMAND.addCommand(subCommand);
  return subCommand;
}

/**
 * Runs the root command with the current command line arguments and options.
 */
export function parseAndRunMigrations() {
  // Use parseAsync for async commands like rename (which fetches a database).
  ROOT_COMMAND.parseAsync();
}
