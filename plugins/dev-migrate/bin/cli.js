#!/usr/bin/env node
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A script for migrating to newer Blockly versions.
 */
'use strict';

const chalk = require('chalk');
const commander = require('commander');
const {runMigrations, showVersionHelp, getVersions} = require('./utils');
const semver = require('semver');
const scriptPackageJson = require('../package.json');
require('./migrations');

const scriptName = scriptPackageJson.name;

const command = new commander.Command(scriptName)
    .version(
        scriptPackageJson.version,
        '-V, --version',
        'output the version of this script')
    .argument('[from-version]', 'Blockly version to migrate from')
    .argument('[to-version]', 'Blockly version to migrate to')
    .usage(`${chalk.green('<from-version> <to-version>')} [options]`)
    .option('-r, --required', 'only run required migrations')
    .option('-l, --list [migrations...]', 'only run the listed migrations')
    .helpOption(false)
    .addHelpText('after', `
Available Blockly versions:
  ${getVersions().join(', ')}`)
    .option(
        '-h, --help [version]',
        'display this help, or help for the specific version');

const result = command.parse();

if (result.opts().help) {
  if (result.opts().help === true) {
    result.help();
  } else {
    showVersionHelp(result.opts().help);
  }
} else if (!result.args.length) {
  result.help();
} else {
  const version1 = semver.coerce(result.args[0]);
  const version2 = semver.coerce(result.args[1]);
  runMigrations(
      `>${version1} <=${version2}`,
      result.opts().required,
      new Set(result.opts().list));
}

process.exit(1);
