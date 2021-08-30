/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Script for handling version 7 renames.
 */
'use strict';

const {addMigration} = require('../../utils');

addMigration('7', 'renames', true, 'test2', function(logger) {
  logger('migrate version 7 renames');
});
