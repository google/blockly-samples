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
import JSON5 from 'json5';


const DATABASE_URL = `https://raw.githubusercontent.com/google/blockly/develop/scripts/migration/renamings.json5`;

createAndAddSubCommand('rename', '>=5')
    .action(function() {
      console.log('args:', this.processedArgs);
    });

/**
 * A temporary top level function that can be called for manual testing.
 * @param {string} currVersion The version to migrate from.
 * @param {string} newVersion The version to migrate to.
 * @param {!Array<string>} files The names files to apply the renamings in.
 */
export async function tempTopLevel(currVersion, newVersion, files) {
  const database = await getDatabase();
  // TODO: Fix this to actually get the contents of the files.
  doRenamings(database, currVersion, newVersion, files);
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
 * @param {!Object} database The database of renames.
 * @param {string} currVersion The version to migrate from.
 * @param {string} newVersion The version to migrate to.
 * @param {!Array<string>} strings The strings to apply the renamings in.
 * @return {!Array<string>} The strings with renamings applied.
 */
export class Renamer {
  /**
   * @param {!Object} database The database of renames.
   * @param {string} currVersion The version to migrate from.
   * @param {string} newVersion The version to migrate to.
   */
  constructor(database, currVersion, newVersion) {
    this.renamings =
        Renamer.calculateRenamings(database, currVersion, newVersion);
  }

  /**
   * Turns a database of renamings into an intermediate format that is
   * easier to apply.
   * @param {!Object} database The database of renames.
   * @param {string} currVersion The version to migrate from.
   * @param {string} newVersion The version to migrate to.
   * @return {*} The collection of renamings to perform.
   */
  static calculateRenamings(database, currVersion, newVersion) {
    const renamings = [];

    // Sort versions (case not already sorted), as we want to apply
    // renamings in order.
    const versions = Object.keys(database).sort(compareVersions);
    for (const version of versions) {
      // Only process versions in the range (currVersion, newVersion].
      if (compareVersions.compare(version, currVersion, '<=')) continue;
      if (compareVersions.compare(version, newVersion, '>')) break;

      for (const module of database[version]) {
        const oldModulePath = module.oldPath ?? module.oldName;
        const newModulePath = module.newPath ?? module.newName ?? oldModulePath;

        if (module.exports) {
          for (const [oldExportName, info] of Object.entries(module.exports)) {
            const oldExportPath =
                info.oldPath ?? `${oldModulePath}.${oldExportName}`;
            const newExportPath = info.newPath ??
                (info.newModule ?? newModulePath) + '.' +
                (info.newExport ?? oldExportName);
            if (newExportPath !== oldExportPath) {
              renamings.push({old: oldExportPath, new: newExportPath});
            }
          }
        }

        if (newModulePath !== oldModulePath) {
          renamings.push({old: oldModulePath, new: newModulePath});
        }
      }
    }
    return renamings;
  }

  /**
   * Applies the given renamings directly to a JavaScript string
   * (presumably the contents of a developer's file).
   * @param {string} str The string to apply the renamings in.
   * @return {string} The file with renamings applied.
   */
  rename(str) {
    // Quick hack to test calculateRenamings.
    for (const entry of this.renamings) {
      if (str.startsWith(entry.old)) {
        return entry.new + str.slice(entry.old.length);
      }
    }
    return str;
  }
}
