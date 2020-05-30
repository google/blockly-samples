/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import toolboxCategories from './toolboxCategories';
import toolboxSimple from './toolboxSimple';
let addGUIControls;
if (typeof window !== 'undefined') {
  addGUIControls = require('./addGUIControls').default;
}
import * as testHelpers from './test_helpers.mocha';
import {DebugRenderer} from './debugRenderer';
import {generateFieldTestBlocks} from './generateFieldTestBlocks';
import {populateRandom} from './populateRandom';
import {createPlayground} from './playground/';
import {addCodeEditor} from './playground/monaco';

export {
  addGUIControls,
  DebugRenderer,
  generateFieldTestBlocks,
  createPlayground,
  addCodeEditor,
  populateRandom,
  testHelpers,
  toolboxCategories,
  toolboxSimple,
};
