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

import fetch from 'node-fetch';


const dataBaseLocation = `https://raw.githubusercontent.com/google/blockly/
develop/scripts/migration/renamings.js`;

/**
 * Upgrades pieces of the Blockly API that have been renamed by modifying
 * developers' local files.
 * @param {string} currVersion The version to migrate from.
 * @param {string} newVersion The version to migrate to.
 * @param {string} files The files to apply the renamings in.
 */
export async function doRenames(currVersion, newVersion, files) {
  const database = await getDatabase();
  const renamings = calculateRenamings(database, currVersion, newVersion);
  applyRenamings(renamings, files);
}

/**
 * Gets the database of renames.
 * @return {!Promise<Object>} The database of renames as an object.
 */
async function getDatabase() {
  const response = await fetch(dataBaseLocation);
  const body = await response.text();
  console.log(body);
  // return JSON5.parse(body);
}

/**
 * Turns the database of renames into an intermediate format that is easier
 * to apply.
 * @param {!Object} database The database of renames.
 * @param {string} currVersion The version to migrate from.
 * @param {string} newVersion The version to migrate to.
 * @return {*} The collection of renamings to perform.
 */
export function calculateRenamings(database, currVersion, newVersion) {
  return null;
}

/**
 * Applies the given renamings directly to developers' files.
 * @param {*} renamings The collection of renamings to perform.
 * @param {string} files The files to apply the renamings in.
 */
export function applyRenamings(renamings, files) {}
