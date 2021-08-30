/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Functions for creating migrations.
 */
'use strict';

const chalk = require('chalk');
const semver = require('semver');


/**
 * @typedef {{
 *   name: string,
 *   description: string,
 *   callback: function(function(...*))
 * }}
 */
const migration = undefined;

/**
 * @type {!Map<string,
 *     {required: !Array<migration>, optional: !Array<migration>}>}
 */
const migrationMap = new Map();

/**
 * Adds a migration to the collection of mmigrations.
 * @param {string} version The semver version this migration is associated with.
 * @param {string} name The name of the mmigration for use in -h and -l.
 * @param {boolean} required Whether this is a required migration or not.
 * @param {string} description A description of what the migration does.
 * @param {function(function(...*))} callback A function that triggers the
 *     migration. Gets passed another function which logs output.
 */
function addMigration(version, name, required, description, callback) {
  const newMigration = {
    name: name,
    description: description,
    callback: callback,
  };

  version = semver.coerce(version);
  const map = getOrInsert(
      migrationMap, version.version, {required: [], optional: []});
  if (required) {
    map.required.push(newMigration);
  } else {
    map.optional.push(newMigration);
  }
}
/** @package */
exports.addMigration = addMigration;

/**
 * Either returns the value associated with the given key (if one exists) or
 * associates the defaultVal with the given key and rturns it.
 * @param {!Map} map The map to get/set the value from.
 * @param {*} key The key to check for in the map.
 * @param {*} defaultVal The default value to assign to the key if no value is
 *     found.
 * @return {*} The value (possibly the defaultVal) associated with the key.
 */
function getOrInsert(map, key, defaultVal) {
  if (!map.has(key)) {
    map.set(key, defaultVal);
    return defaultVal;
  } else {
    return map.get(key);
  }
}

/**
 * Clears the collection of migrations.
 */
function clearMigrations() {
  migrationMap.clear();
}
/** @package */
exports.clearMigrations = clearMigrations;

/**
 * Returns all of the versions for migrations that we have.
 * @return {!Array<string>} All of the versions for migrations that we have.
 */
function getVersions() {
  return [...migrationMap.keys()].sort((a, b) => {
    if (semver.lt(a, b)) {
      return -1;
    }
    return 1;
  });
}
/** @package */
exports.getVersions = getVersions;

/**
 * Runs all of the migrations that fulfill the constraints.
 * @param {string} range The semver range of versions to run upgrades for.
 * @param {boolean} onlyRequired If true, only required upgrades will be run,
 *     otherwise all upgrades will be run.
 * @param {!Set<string>} migrationSet A set of the names of migrations to run.
 *     If empty, all migrations which fulfill the other constraints will be
 *     run.
 */
function runMigrations(range, onlyRequired, migrationSet) {
  if (!semver.validRange(range)) {
    console.log(`Invalid range: ${range}`);
    return;
  }

  const versions = getVersions();
  const maxVersion = semver.maxSatisfying(getVersions(), range);
  if (!maxVersion) {
    console.log('No available migrations');
    return;
  }
  console.log(`Migrating to Blockly version ${maxVersion}`);


  for (const version of versions) {
    if (semver.satisfies(version, range)) {
      const map = migrationMap.get(version);
      const migrations =
          onlyRequired ? map.required : [...map.required, ...map.optional];
      for (const migration of migrations) {
        if (!migrationSet.size || migrationSet.has(migration.name)) {
          console.log(
              `Running ${chalk.blue(migration.name)} (${version})`);
          migration.callback(logger);
        }
      }
    }
  }
}
/** @package */
exports.runMigrations = runMigrations;

/**
 * Logs the given args to the console with a '- ' prefix. Passed to migration
 * callbacks for logging.
 * @param {...*} args Arguments to log.
 */
function logger(...args) {
  console.log('-', ...args);
}

/**
 * Shows all of the migrations for a given version.
 * @param {string} version  The version to show the migrations of.
 */
function showVersionHelp(version) {
  const range = `${version} - ${version}`;
  if (!semver.validRange(range)) {
    console.log(`Invalid version: ${version}`);
    return;
  }

  const versions = getVersions();
  if (!versions.some((version) => semver.satisfies(version, range))) {
    console.log(`Version ${version} not found`);
    console.log(`Available versions: ${versions.join(', ')}`);
    return;
  }

  console.log(`Migrations for version ${version} (R is required)\n`);

  for (const version of versions) {
    if (semver.satisfies(version, range)) {
      const map = migrationMap.get(version);
      console.log(`${version}:`);
      for (const migration of map.required) {
        console.log(`  ${chalk.blue.bold(`R ${migration.name}`)}, ` +
            `${migration.description}`);
      }
      for (const migration of map.optional) {
        console.log(`    ${chalk.blue(migration.name)}, ` +
            `${migration.description}`);
      }
    }
  }
}
/** @package */
exports.showVersionHelp = showVersionHelp;
