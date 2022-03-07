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
import JSON5 from 'json5';


const dataBaseLocation = `https://raw.githubusercontent.com/google/blockly/
develop/scripts/migration/renamings.js`;

export async function doRenames(currVersion, newVersion) {
  const database = await getDatabase();
  const renamings = calculateRenamings(database);
  applyRenamings(renamings);
}

async function getDatabase() {
  const response = await fetch(dataBaseLocation);
  const body = await response.text();
  console.log(body);
  //return JSON5.parse(body);
}

export function calculateRenamings(database, currVersion, newVersion) { }

export function applyRenamings(renamings) {}
