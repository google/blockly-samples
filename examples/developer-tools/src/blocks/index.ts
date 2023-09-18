/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {factoryBase} from './factory_base';
import * as Blockly from 'blockly';
import {input} from './input';

// import for side effects for now
import '../output-generators/factory_base';
import '../output-generators/input';

export const registerAllBlocks = function() {
  Blockly.common.defineBlocks({
    'factory_base': factoryBase,
    'input': input,
  });
};


