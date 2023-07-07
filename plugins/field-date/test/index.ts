/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Plugin test.
 */

import * as Blockly from 'blockly';
import {generateFieldTestBlocks, createPlayground} from '@blockly/dev-tools';
import {FieldDateFromJsonConfig} from '../src/index';
import '../src/index';

// NOTE: The args type should be updated to allow the JsonConfig types.
interface Args {
  [key: string]: unknown;
}

const basicConfig: FieldDateFromJsonConfig = {
  date: '2020-02-20',
};

const tooltipConfig: FieldDateFromJsonConfig = {
  date: '2021-03-13',
  tooltip: 'This date block has a tooltip!',
};

const emptyConfig: FieldDateFromJsonConfig = {
};

const toolbox = generateFieldTestBlocks('field_date', [
  {
    label: 'Basic Date Input',
    args: basicConfig as Args,
  },
  {
    label: 'Tooltip Date Input',
    args: tooltipConfig as Args,
  },
  {
    label: 'Default Date Input',
    args: emptyConfig as Args,
  },
]);

/**
 * Create a workspace.
 * @param blocklyDiv The blockly container div.
 * @param options The Blockly options.
 * @returns The created workspace.
 */
function createWorkspace(blocklyDiv: HTMLElement,
    options: Blockly.BlocklyOptions): Blockly.WorkspaceSvg {
  const workspace = Blockly.inject(blocklyDiv, options);
  return workspace;
}

document.addEventListener('DOMContentLoaded', function() {
  const defaultOptions: Blockly.BlocklyOptions = {
    toolbox,
  };
  const rootElement = document.getElementById('root');
  if (rootElement) {
    // NOTE: Will need to update @blockly/dev-tools package JSON to keep it's
    // version of Blockly in sync with this package's. Both call for ^9.0.0,
    // though the package-locks result in each installing different versions.
    createPlayground(rootElement, createWorkspace, defaultOptions);
  }
});
