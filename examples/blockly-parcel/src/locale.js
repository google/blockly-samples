/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Example of including Blockly using Parcel with a 
 *               custom locale: (French lang & JavaScript generator).
 * @author ettinger.boris@gmail.com (Boris Ettinger)
 */

import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import 'blockly/javascript';
import * as Fr from 'blockly/msg/fr';

Blockly.setLocale(Fr);

document.addEventListener("DOMContentLoaded", function () {
  const workspace = Blockly.inject('blocklyDiv',
    {
      toolbox: document.getElementById('toolbox'),
      media: 'media/'
    });

  const lang = 'JavaScript';
  const button = document.getElementById('blocklyButton');
  button.addEventListener('click', function () {
    alert("Check the console for the generated output.");
    const code = Blockly[lang].workspaceToCode(workspace);
    console.log(code);
  });
});
