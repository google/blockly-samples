/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Script for migrating to JSON hooks.
 */
'use strict';

const {addMigration} = require('../../utils');

addMigration('7', 'json-hooks', false, 'test', function(logger) {
  logger('migrate to json');
});

addMigration('3.2', 'renames', true, 'description of renames',
    function(logger) {
      logger('3.2 renames');
    });

addMigration('3.2', 'blocks', false, 'description of blocks',
    function(logger) {
      logger('3.2 blocks');
    });

addMigration('3.4', 'renames', true, 'description of renames',
    function(logger) {
      logger('3.4 renames');
    });

addMigration('3.4', 'toolbox', false, 'description of toolbox',
    function(logger) {
      logger('3.4 toolbox');
    });

addMigration('3.4', 'themes', false, 'description of themes',
    function(logger) {
      logger('3.4 themes');
    });
