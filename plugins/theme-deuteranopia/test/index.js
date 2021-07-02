/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Deuteranopia theme test.
 */

import * as Blockly from 'blockly';
import Theme from '../src/index';

// Do not use the advanced playground here because it will create a circular
// dependency with the @blockly/dev-tools package.
document.addEventListener('DOMContentLoaded', function() {
  Blockly.inject('root', {
    theme: Theme,
    toolbox: document.getElementById('toolbox'),
    grid: {
      spacing: 25,
      length: 3,
      colour: '#ccc',
      snap: true,
    },
  });
});
