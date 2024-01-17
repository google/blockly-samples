/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly/core';
import * as En from 'blockly/msg/en';
import 'blockly/blocks';
import './index.css';

// Put Blockly in the global scope for easy debugging.
(window as any).Blockly = Blockly;

// Even though En should be loaded by default,
// if you don't load it specifically, you'll get spurious message warnings.
Blockly.setLocale(En);

const mainWorkspaceDiv = document.getElementById('mainWorkspace');
const previewDiv = document.getElementById('preview');
const definitionDiv = document.getElementById('definition').firstChild;

const previewWorkspace = Blockly.inject(previewDiv, {});
const mainWorkspace = Blockly.inject(mainWorkspaceDiv, {});
