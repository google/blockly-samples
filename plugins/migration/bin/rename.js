/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A script that automatically upgrades pieces of the Blockly API
 *     that have been renamed by modifying developers' local files.
 */
'use strict';

import {createAndAddSubCommand} from './command.js';
import fetch from 'node-fetch';
import glob from 'glob';
import {readFile, writeFile} from 'fs';
import semver from 'semver';
import JSON5 from 'json5';

const DATABASE_URL = `https://raw.githubusercontent.com/google/blockly/develop/scripts/migration/renamings.json5`;

/**
 * The version associated with renamings that have not been released yet.
 * @const {string}
 */
const DEV_VERSION = 'develop';

createAndAddSubCommand(
    'rename', '>=5', 'Perform renamings for breaking changes')
    .option(
        '-i, --in-place [suffix]',
        'do renamings in-place, optionally create backup files with the ' +
        'given suffix. Otherwise output to stdout')
    .action(async function() {
      const fromVersion = this.processedArgs[0];
      const toVersion = this.processedArgs[1];
      const fileGlobs = this.processedArgs[2];
      const fileNames = fileGlobs.flatMap((fileGlob) =>
        glob.sync(fileGlob, {nodir: true, nonull: false}));

      if (!fileNames.length) {
        process.stderr.write(`No matching files found for ${fileGlobs}. ` +
            `Aborting rename.`);
        return;
      }

      const renamer = new Renamer(await getDatabase(), fromVersion, toVersion);
      fileNames.forEach((name) => {
        readFile(name, 'utf8', (err, contents) => {
          if (err) throw err;
          const newContents = renamer.rename(contents);
          const i = this.opts().i;
          if (i) {
            if (typeof i == 'string') writeFile(name + i, contents, throwError);
            writeFile(name, newContents, throwError);
            process.stderr.write(`Migrated renamings in ${name}`);
          } else {
            process.stdout.write(newContents);
          }
        });
      });
    });

/**
 * Throws the error if the error is received, otherwise noop.
 * @param {!Error|null} err A possible error to throw.
 */
function throwError(err) {
  if (err) throw err;
}

/**
 * Gets the database of renames.
 * @return {!Promise<Object>} The database of renames as an object.
 */
export async function getDatabase() {
  const response = await fetch(DATABASE_URL);
  const body = await response.text();
  return JSON5.parse(body);
}

/**
 * Upgrades pieces of the Blockly API that have been renamed by modifying
 * developers' local files.
 * @param {!Object} database The database of renames.
 * @param {string} currVersion The version to migrate from.
 * @param {string} newVersion The version to migrate to.
 * @param {!Array<string>} strings The strings to apply the renamings in.
 * @return {!Array<string>} The strings with renamings applied.
 * @deprecated Use Renamer instance instead.
 */
export function doRenamings(database, currVersion, newVersion, strings) {
  const renamer = new Renamer(database, currVersion, newVersion);
  return strings.map((str) => renamer.rename(str));
}

/**
 * An object which can apply a given set of renamings to the contents
 * of JavaScript files, so as to automatically update developer's code
 * where parts of the Blockly API have been renamed.
 */
export class Renamer {
  /**
   * Constructor for the class.
   * @param {!Object} database The database of renames.
   * @param {string} currVersion The version to migrate from.
   * @param {string} newVersion The version to migrate to.
   */
  constructor(database, currVersion, newVersion) {
    /** @private @const {!Array<!VersionRenamer>} */
    this.versionRenamers_ =
        Renamer.calculateRenamings(database, currVersion, newVersion);
  }

  /**
   * Turns a database of renamings into an intermediate format that is
   * easier to apply.
   * @param {!Object} database The database of renames.
   * @param {string} currVersion The version to migrate from.
   * @param {string} newVersion The version to migrate to.
   * @return {!Array<!VersionRenamer>} The collection of renamings to perform.
   */
  static calculateRenamings(database, currVersion, newVersion) {
    currVersion = Renamer.coerceVersion(currVersion);
    newVersion = Renamer.coerceVersion(newVersion);
    const versions = Object.keys(database).sort(Renamer.compareVersions);
    const renamers /** !Array<!VersionRenamer> */ = [];
    for (const version of versions) {
      // Only process versions in the range (currVersion, ^newVersion].
      if (Renamer.lte(version, currVersion)) continue;
      if (Renamer.gt(version, newVersion)) break;

      renamers.push(new VersionRenamer(database[version]));
    }
    return renamers;
  }

  /**
   * Applies the given renamings directly to a JavaScript string
   * (presumably the contents of a developer's file).
   * @param {string} str The string to apply the renamings in.
   * @return {string} The file with renamings applied.
   */
  rename(str) {
    return str.replace(dottedIdentifier, (match) => {
      for (const versionRenamer of this.versionRenamers_) {
        match = versionRenamer.rename(match);
      }
      return match;
    });
  }

  /**
   * Coerces the given string into a valid version (semver compliant or
   * develop).
   * @param {string} version  The version to coerce.
   * @return  {string} The coerced version.
   */
  static coerceVersion(version) {
    return version === DEV_VERSION ?
        version : semver.coerce(version).toString();
  }

  /**
   * Compares the given versions. Compatible with Array.sort.
   * @param {string} v1 The first version to compare.
   * @param {string} v2 The second version to compare.
   * @return {number} A number indicating the relationship between the versions.
   */
  static compareVersions(v1, v2) {
    if (v2 === DEV_VERSION) return -1;
    if (v1 === DEV_VERSION) return 1;
    return semver.compare(v1, v2);
  }

  /**
   * Returns true if the first version is less than or equal to the second
   * version.
   * @param {string} v1 The version to compare.
   * @param {string} v2 The version to compare against.
   * @return {boolean} True if the first version is less than or equal to the
   *     second one.
   */
  static lte(v1, v2) {
    if (v2 === DEV_VERSION) return true;
    if (v1 === DEV_VERSION) return false;
    return semver.lte(v1, v2);
  }

  /**
   * Returns true if the first version is greater than the second version.
   * @param {string} v1 The version to compare.
   * @param {string} v2 The version to compare against.
   * @return {boolean} True if the first version is greater than the second one.
   */
  static gt(v1, v2) {
    if (v2 === DEV_VERSION) return false;
    if (v1 === DEV_VERSION) return true;
    return semver.gtr(v1, `^${v2}`);
  }
}

/**
 * An object which can apply a given set of renamings for a single
 * Blockly version to the individual dotted-identifier paths.
 */
class VersionRenamer {
  /**
   * Constructor for the version renamer.
   * @param {!Object} entry The database entry for a single version.
   */
  constructor(entry) {
    /**
     * List of pre-compiled renamings.
     * @private @const {
     *     !Array<{old: string, new: ?string, get: ?string, set: ?string}>}
     */
    this.renamings_ = [];
    // See the sample entry in renamings.json5 for explanation of the
    // meaning of the different properties on database entries.
    for (const module of entry) {
      const oldModulePath = module.oldPath ?? module.oldName;
      const newExport = module.newExport ? '.' + module.newExport : '';
      const newModulePath =
          module.newPath ?? (module.newName ?? oldModulePath) + newExport;

      if (module.exports) {
        for (const [oldExportName, info] of Object.entries(module.exports)) {
          const oldExportPath =
              info.oldPath ?? `${oldModulePath}.${oldExportName}`;
          const newBase = (info.newModule ?? newModulePath) + '.';
          const renaming = {old: oldExportPath};
          if (info.newPath) { // If newPath provided just use that.
            renaming.new = info.newPath;
          } else if (info.getMethod || info.setMethod) {
            renaming.get = info.getMethod ? newBase + info.getMethod : null;
            renaming.set = info.setMethod ? newBase + info.setMethod : null;
          } else {
            renaming.new = newBase + (info.newExport ?? oldExportName);
          }
          this.renamings_.push(renaming);
        }
      }

      this.renamings_.push({old: oldModulePath, new: newModulePath});
    }
  }

  /**
   * Applies the renamings directly to a single JavaScript dotted
   * identifier path (e.g. 'foo.bar.baz')
   * @param {string} str The string to apply the renamings in.
   * @return {string} The string after applying the most relevant renaming.
   */
  rename(str) {
    for (const entry of this.renamings_) {
      if (str.startsWith(entry.old)) {
        if (entry.get || entry.set) {
          process.stderr.write(`NOTE: ${entry.old} has been removed.`);
          if (entry.get) {
            process.stderr.write(`    - Call ${entry.get}() instead of ` +
                'reading it.');
          }
          if (entry.set) {
            process.stderr.write(`    - Call ${entry.set}(/* new value */) ` +
                'instead of setting it.');
          }
          process.stderr.write('You will need to manually verify this update.');
          return (entry.get ?? entry.set) + '()' + str.slice(entry.old.length);
        }
        return entry.new + str.slice(entry.old.length);
      }
    }
    return str;
  }
}

/**
 * RegExp matching a dotted identifier path like "foo.bar.baz".  Note
 * that this only matches such paths containing at least one dot, as
 * we expect to be looking for string like "Blockly.<something>" and
 * don't want to try to rename every singe variable and every word
 * that appears in each comment!
 */
const dottedIdentifier =
      /[A-Za-z$_][A-Za-z0-9$_]*(\.[A-Za-z$_][A-Za-z0-9$_]*)+/g;
