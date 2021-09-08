/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Trigers the python script for adding JSON hooks to block and
 *     field definitions.
 */
'use strict';

const {addMigration} = require('../utils');
const commander = require('commander');
const {spawnSync} = require('child_process');

addMigration(
    '7.20210930.0',
    'json-hooks',
    'add backwards-compatible JSON serialization hooks (which call any ' +
    'defined XML hooks) to your block and field definitions',
    (command) => {
      command
          .addArgument(
              new commander.Argument('[dir]', 'the directory to upgrade')
                  .default('./', 'the current directory'))
          .action((dir) => {
            spawnSync(
                'python',
                ['./bin/7.20210930.0/json-hooks.py', dir || './'],
                {stdio: 'inherit'});
          });
    });
