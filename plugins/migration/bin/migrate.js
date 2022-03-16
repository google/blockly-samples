#!/usr/bin/env node
/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview A script for helping to migrate between versions of Blockly.
 */
import {addSubCommand, parseAndRunMigrations} from './command.js';
import {rename} from './rename.js';


addSubCommand(rename);

parseAndRunMigrations();
