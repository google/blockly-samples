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

const {runCommand} = require('./utils');
require('./migrations');

runCommand(process.argv);

process.exit(1);
