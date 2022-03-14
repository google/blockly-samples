#!/usr/bin/env node
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

import compareVersions from 'compare-versions';
import {createAndAddSubCommand} from './command.js';
import fetch from 'node-fetch';
import glob from 'glob';
import {readFile, writeFile} from 'fs';
import JSON5 from 'json5';

const DATABASE_URL = `https://raw.githubusercontent.com/google/blockly/develop/scripts/migration/renamings.json5`;

createAndAddSubCommand('rename', '>=5')
    .action(async function() {
      const fromVersion = this.processedArgs[0];
      const toVersion = this.processedArgs[1];
      const fileGlobs = this.processedArgs[2];
      const fileNames = fileGlobs.flatMap((fileGlob) =>
        glob.sync(fileGlob, {nodir: true, nonull: false}));

      if (!fileNames.length) {
        console.log(`No matching files found for ${fileGlobs}. ` +
            `Aborting rename.`);
        return;
      }

      const renamer = new Renamer(await getDatabase(), fromVersion, toVersion);
      fileNames.forEach((name) => {
        readFile(name, 'utf8', (err, contents) => {
          if (err) throw err;
          const newContents = renamer.rename(contents);
          writeFile(name, newContents, (err) => {
            if (err) throw err;
            console.log(`Migrated renamings in ${name}`);
          });
        });
      });
    });

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
    // Sort versions (case not already sorted), as we want to apply
    // renamings in order.
    const versions = Object.keys(database).sort(compareVersions);
    const renamers /** !Array<!VersionRenamer> */ = [];
    for (const version of versions) {
      // Only process versions in the range (currVersion, newVersion].
      if (compareVersions.compare(version, currVersion, '<=')) continue;
      if (compareVersions.compare(version, newVersion, '>')) break;

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
    // Quick hack to test calculateRenamings.
    for (const versionRenamer of this.versionRenamers_) {
      str = versionRenamer.rename(str);
    }
    return str;
  }
}

/**
 * An object which can apply a given set of renamings for a single
 * Blockly version to the individual dotted-identifier paths.
 */
class VersionRenamer {
  /**
   * @param {!Object} entry The database entry for a single version.
   */
  constructor(entry) {
    /** @private @const {!Array<{old: string, new: string}>} */ 
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
          const newExportPath = info.newPath ??
              (info.newModule ?? newModulePath) + '.' +
              (info.newExport ?? oldExportName);
          if (newExportPath !== oldExportPath) {
            this.renamings_.push({old: oldExportPath, new: newExportPath});
          }
        }
      }

      if (newModulePath !== oldModulePath) {
        this.renamings_.push({old: oldModulePath, new: newModulePath});
      }
    }
  }

  /**
   * Applies the renamings directly to a single JavaScript dotted
   * identifier path (e.g. 'foo.bar.baz')
   * @param {string} str The string to apply the renamings in.
   * @return {string} The string after applying any relevant renamings.
   */
  rename(str) {
    for (const entry of this.renamings_) {
      if (str.startsWith(entry.old)) {
        return entry.new + str.slice(entry.old.length);
      }
    }
    return str;
  }
}
