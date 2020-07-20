/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import toolboxCategories from './toolboxCategories';
import toolboxSimple from './toolboxSimple';
import * as testHelpers from './test_helpers.mocha';
import {DebugRenderer} from './debugRenderer';
import {generateFieldTestBlocks} from './generateFieldTestBlocks';
import {populateRandom} from './populateRandom';
import {spaghetti} from './spaghetti';
import {downloadWorkspaceScreenshot} from './screenshot';

let addGUIControls;
let addCodeEditor;
let createPlayground;
if (typeof window !== 'undefined') {
  addGUIControls = require('./addGUIControls').addGUIControls;
  addCodeEditor = require('./playground/monaco').addCodeEditor;
  createPlayground = require('./playground/').createPlayground;
}

export {
  addCodeEditor,
  addGUIControls,
  createPlayground,
  DebugRenderer,
  downloadWorkspaceScreenshot,
  generateFieldTestBlocks,
  populateRandom,
  spaghetti,
  testHelpers,
  toolboxCategories,
  toolboxSimple,
};
