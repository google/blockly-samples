/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Example of including Blockly using Parcel with 
 *               the Python generator.
 * @author ettinger.boris@gmail.com (Boris Ettinger)
 */

import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import 'blockly/python';
import * as En from 'blockly/msg/en';

Blockly.setLocale(En);

document.addEventListener("DOMContentLoaded", function () {
  const workspace = Blockly.inject('blocklyDiv',
    {
      toolbox: document.getElementById('toolbox'),
      media: 'media/'
    });

  const lang = 'Python';
  const button = document.getElementById('blocklyButton');
  button.addEventListener('click', function () {
    alert("Check the console for the generated output.");
    const code = Blockly[lang].workspaceToCode(workspace);
    console.log(code);
  });
});
